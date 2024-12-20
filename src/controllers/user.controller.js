import { User } from "../models/user model/user.model.js"
import { verificationCode } from "../models/user model/verificationcode.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { sendVerificationEmail } from "../utils/nodemailer.js"
import { Recruiter } from "../models/user model/recruiter.model.js"
import { JobSeeker } from "../models/user model/jobSeeker.model.js"
import jwt from "jsonwebtoken"
import crypto from "crypto";
import { Notification } from "../models/notification.model.js"


//? generateAccessAndRefreshToken

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save()
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}


//? register user 

const registerUser = asyncHandler(async (req, res) => {

    const { firstname, lastname, username, email, password, role, } = req.body

    if (!firstname || !lastname || !username || !email || !password || !role) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with this email and username already present")
    }

    const user = new User({
        firstname,
        lastname,
        username,
        email,
        password,
        role
    })

    let recruiter
    let job_seeker

    if (role === "recruiter") {

        const { companyName, companyDescription, companyLocation } = req.body

        if (!companyName || !companyDescription || !companyLocation) {
            throw new ApiError(400, "Recruiter-specific fields are required");
        }

        let companyLogoLocalPath
        if (req.files?.companyLogo[0].path) {
            try {
                companyLogoLocalPath = req.files?.companyLogo[0].path;
            } catch (error) {
                throw new ApiError(400, "failed to get company logo local file path")
            }
        }

        let compLogo
        if (companyLogoLocalPath) {
            try {
                compLogo = await uploadOnCloudinary(companyLogoLocalPath)
            } catch (error) {
                throw new ApiError(400, "failed to upload company logo on cloudinary")
            }
        }

        recruiter = await Recruiter.create({
            user: user._id,
            companyName,
            companyDescription,
            companyLocation,
            companyLogo: compLogo.url
        })

    } else if (role === "job_seeker") {

        const { skills, experience, education } = req.body

        if (!skills || !experience || !education) {
            throw new ApiError(400, "Job Seeker-specific fields are required");
        }

        let resumeLocalPath
        if (req.files?.resume[0].path) {
            try {
                resumeLocalPath = req.files?.resume[0].path;
            } catch (error) {
                throw new ApiError(400, "failed to get resume local file path")
            }
        }

        let userResume
        if (resumeLocalPath) {
            try {
                userResume = await uploadOnCloudinary(resumeLocalPath)
            } catch (error) {
                throw new ApiError(400, "failed to upload resume on cloudinary")
            }
        }

        job_seeker = await JobSeeker.create({
            user: user._id,
            resume: userResume.url,
            skills: Array.isArray(skills) ? skills : skills.split(","),
            experience,
            education
        })

    }
    const verifyCode = new verificationCode({ user: user._id })
    const code = verifyCode.generateCode()
    const generateCodeToken = verifyCode.generateCodeToken()
    await verifyCode.save()
    await user.save()

    if (role === "admin") {

        const existedAdmin = await User.findOne({ role: "admin" })

        if (!existedAdmin) {
            throw new ApiError(403, "Admin already exists. Contact support.")
        }
    }

    await sendVerificationEmail(user, code)

    const options = {
        httpOnly: true,
        secure: true
    }

    if (role === "recruiter") {
        return res.status(200).cookie("generateCodeToken", generateCodeToken, options).json(
            new ApiResponse(200, { user, recruiter }, "recruiter register successfully")
        )
    } else if (role === "job_seeker") {
        return res.status(200).cookie("generateCodeToken", generateCodeToken, options).json(
            new ApiResponse(200, { user, job_seeker }, "job seeker register successfully")
        )
    } else {
        return res.status(200).cookie("generateCodeToken", generateCodeToken, options).json(
            new ApiResponse(200, { user }, "User register successfully")
        )
    }

})

//? verifyCode

const verifyCode = asyncHandler(async (req, res) => {
    const { code } = req.body

    if (!code) {
        throw new ApiError(400, "verification code is required")
    }

    const token = req.cookies?.generateCodeToken || req.headers["authorization"].split(" ")[1]

    if (!token) {
        throw new ApiError(400, "Invalid or expire token")
    }

    const verifyToken = jwt.verify(token, process.env.CODE_JWT_SECRET)

    if (!verifyToken) {
        throw new ApiError(400, "Invalid or expire token")
    }

    const verifyCodeDoc = await verificationCode.findById(verifyToken?._id)

    if (!verifyCodeDoc) {
        throw new ApiError(404, "Verification code not found")
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex')

    if (hashedCode !== verifyCodeDoc.code) {
        throw new ApiError(400, "Invalid verification code")
    }

    const user = await User.findById(verifyToken.user)

    if (!user) {
        throw new ApiError(404, "user not found")
    }

    if (user.isEmailVerified) {
        throw new ApiError(400, "Email is already verified")
    }

    user.isEmailVerified = true
    await user.save()

    await verifyCodeDoc.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, null, "email verify successfully")
    )

})

//? resendVerificationCode

const resendVerificationCode = asyncHandler(async (req, res) => {

    const { email } = req.body

    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const verifyCode = new verificationCode({ user: user._id })
    const code = verifyCode.generateCode()
    const generateCodeToken = verifyCode.generateCodeToken()

    await verifyCode.save()
    await sendVerificationEmail(user, code)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("generateCodeToken", generateCodeToken, options).json(
        new ApiResponse(200, {}, "resend verification code")
    )

})

//? login user

const loggedInUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body

    if (!(email || username)) {
        throw new ApiError(400, "email or username is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "user not found")
    }

    if (!user.isEmailVerified) {
        throw new ApiError(400, "verify email first")
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -isEmailVerified")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200, { loggedInUser }, "User login successfully")
    )

})

//? get profile

const getProfile = asyncHandler(async (req, res) => {

    const userId = req.user._id

    const user = await User.findById(userId).select("-password -refreshToken -isEmailVerified")

    if (!user) {
        throw new ApiError(404, "user not found")
    }

    return res.status(200).json(
        new ApiResponse(200, { user }, "get profile successfully")
    )
})

//? update profile

const updateProfile = asyncHandler(async (req, res) => {

    const { firstname, lastname, username } = req.body

    const userId = req.user._id

    await User.findByIdAndUpdate(
        userId,
        {
            ...(firstname && { firstname }),
            ...(lastname && { lastname }),
            ...(username && { username })
        },
        {
            new: true
        }
    )

    const user = await User.findById(userId).select("-password -refreshToken -email -isEmailVerified")

    let recruiter
    let job_seeker

    if (user.role === "recruiter") {

        const { companyName, companyDescription, companyLocation } = req.body

        recruiter = await Recruiter.findOneAndUpdate(
            { user: userId },
            {
                ...(companyName && { companyName }),
                ...(companyDescription && { companyDescription }),
                ...(companyLocation && { companyLocation })
            }, { new: true }
        )

    } else if (user.role === "job_seeker") {

        const { skills, experience, education } = req.body

        job_seeker = await JobSeeker.findOneAndUpdate(
            { user: userId },
            {
                ...(skills && { skills: Array.isArray(skills) ? skills : skills.split(",") }),
                ...(experience && { experience }),
                ...(education && { education })
            }, { new: true }
        )

    }


    if (req.user.role === "recruiter") {
        return res.status(200).json(
            new ApiResponse(200, { user, recruiter }, "recruiter update successfully")
        )
    } else if (req.user.role === "job_seeker") {
        return res.status(200).json(
            new ApiResponse(200, { user, job_seeker }, "job seeker update successfully")
        )
    } else {
        return res.status(200).json(
            new ApiResponse(200, { user }, "User update successfully")
        )
    }

})

//? get profile by Id

const getProfileById = asyncHandler(async (req, res) => {

    const { id } = req.params

    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admins can access this route and delete a user.");
    }

    const user = await User.findById(id)

    if (user) {
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiError(200, { user }, "get profile successfully")
    )
})

//? getnotification

const getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .populate("sender", "firstname lastname")
        .populate("job", "title");

    if(!notifications){
        throw new ApiError(404,"No notification found")
    }
    return res.status(200).json(
        new ApiResponse(200, { notifications }, "Notifications fetched successfully")
    );
});


export {
    registerUser,
    verifyCode,
    resendVerificationCode,
    loggedInUser,
    getProfile,
    updateProfile,
    getProfileById,
    getNotifications
}