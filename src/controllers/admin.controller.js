import {User} from "../models/user model/user.model.js"
import {Recruiter} from "../models/user model/recruiter.model.js"
import {Job} from "../models/job/job.model.js"
import {JobSeeker} from "../models/user model/jobSeeker.model.js"
import {Application} from "../models/application/application.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"

//? Fetch all users by admin

const fetchAllUser = asyncHandler(async(req,res)=>{

    if(req.user.role !== "admin"){
        throw new ApiError(403,"only admin can access this route")
    }

    const users = await User.find()

    if(!users){
        throw new ApiError(404,"No user found")
    }

    return res.status(200).json(
        new ApiResponse(200,{users},"fetched all users successfully")
    )
})

//? Fetch all job postings by admin

const fetchAllJobPosts = asyncHandler(async(req,res)=>{

    if(req.user.role !== "admin"){
        throw new ApiError(403,"only admin can access this route")
    }

    const jobs  = await Job.find()

    if(!jobs){
        throw new ApiError(404,"No job found")
    }

    return res.status(200).json(
        new ApiResponse(200,{jobs},"All jobs fetched successfully")
    )
})

//? getAdminStats

const getAdminStats = asyncHandler(async(req,res)=>{

    if(req.user.role !== "admin"){
        throw new ApiError(403,"only admin can access this route")
    }

    const userStats = await User.aggregate([
        {
            $group:{
                _id:"$role",
                count:{$sum : 1}
            }
        }
    ])

    const jobStats = await Job.aggregate([
        {
            $group:{
                _id: null,
                count:{$sum:1}
            }
        }
    ])

    const applicationStats = await Application.aggregate([
        {
            $group:{
                _id:null,
                count:{$sum:1}
            }
        }
    ])

    const stats = {
        users: userStats.reduce(
            (acc, curr) => ({ ...acc, [curr._id]: curr.count }),
            {}
        ),
        totalJobs: jobStats[0]?.totalJobs || 0,
        totalApplications: applicationStats[0]?.totalApplications || 0
    }

    return res.status(200).json(
        new ApiResponse(200,stats,"Admin stats fetched successfully")
    )
})

const deleteJobPostByAdmin = asyncHandler(async(req,res)=>{

    const {jobId} = req.params

    if(req.user.role !== "admin"){
        throw new ApiError(403,"only admin can access this route")
    }

    const job = await Job.findByIdAndDelete(jobId)

    if(!job){
        throw new ApiError(404,"No job found with this ID")
    }

    return res.status(200).json(
        new ApiResponse(200,{jobId},"job deleted successfully")
    )

})

//? Delete any user by admin

const deleteUserById = asyncHandler(async(req,res)=>{

    const {userId} = req.params

    if(req.user.role !== "admin"){
        throw new ApiError(403,"only admin can access this route")
    }

    const user = await User.findById(userId)

    if(user.role === "recruiter"){

        const recruiter = await Recruiter.findOne({user:userId})
        await Job.deleteMany({recruiter:recruiter._id})
        await Recruiter.findByIdAndDelete(recruiter._id)

    }else if(user.role === "job_seeker"){
        
        await Application.deleteMany({applicant:userId}) 
        await JobSeeker.findOneAndDelete({user:userId})
    }

    await User.findByIdAndDelete(userId)

    return res.status(200).json(
        new ApiResponse(200,{userId},"user deleted successfully")
    )
})

export {
    fetchAllUser,
    fetchAllJobPosts,
    getAdminStats,
    deleteJobPostByAdmin,
    deleteUserById
}