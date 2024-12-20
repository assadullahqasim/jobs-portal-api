import { Router } from "express";
import 
{
    registerUser,
    verifyCode,
    resendVerificationCode,
    loggedInUser,
    getProfile,
    updateProfile,
    getProfileById,
    getNotifications
} from "../controllers/user.controller.js"
import { upload } from "../middleware/multer.middleware.js"
import { jwtVerification } from "../middleware/authJwt.middleware.js"
 
const router = Router()

//? registerUser
router.route("/register").post(
    upload.fields([
        {name:"companyLogo",maxCount:1},
        {name:"resume",maxCount:1},
    ]),
    registerUser
);

//? verifyCode

router.route("/verify-code").post(verifyCode)

//? resendVerificationCode

router.route("/resend-verification-code").post(resendVerificationCode)

//? loggedInUser

router.route("/login").post(loggedInUser)

//? getProfile

router.route("/get-profile").get(jwtVerification,getProfile)

//? updateProfile

router.route("/update-profile").put(jwtVerification,updateProfile)

//? getProfileById

router.route("/get-user/:id").get(jwtVerification,getProfileById)

//? getNotifications

router.route("/get-notofication").get(jwtVerification,getNotifications)

export default router