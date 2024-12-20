import { Application } from "../models/application/application.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Job} from "../models/job/job.model.js"
import {JobSeeker} from "../models/user model/jobSeeker.model.js"
import { Recruiter } from "../models/user model/recruiter.model.js";
import {io} from "../notificationServer.js"
import {Notification} from "../models/notification.model.js"

//? post application

const postApplication = asyncHandler(async(req,res)=>{
    const {jobId} = req.params

    const userId = req.user._id

    if(req.user.role !== "job_seeker"){
        throw new ApiError(409,"Only job seeker can apply")
    }
    const {coverLetter} = req.body

    const job = await Job.findById(jobId)

    if(!job){
        throw new ApiError(404,"Job not found")
    }

    const recruiter = await Recruiter.findOne({postedJobs:jobId})

    if(!recruiter){
        throw new ApiError(400,"recruiter has not posted any job")
    }

    const job_seeker = await JobSeeker.findOne({user:userId})

    if(!job_seeker){
        throw new ApiError(404,"your bio not found")
    }

    const existingApplication = await Application.findOne({
        job: jobId,
        applicant: userId
    })

    if(existingApplication){
        throw new ApiError(409,"You have already applied for this job")
    }

    const application = new Application({
        job: jobId,
        applicant: userId,
        coverLetter: coverLetter,
        resume: job_seeker.resume
    })

    await application.save()

    job_seeker.appliedJobs.push(application._id)
    recruiter.applications.push(application._id)
    await job_seeker.save()
    await recruiter.save()

    const notification = await Notification.create({
        type: "application",
        recipient: job.recruiter._id,
        sender: userId,
        job: jobId,
        message: `New application for job: ${job.title}`,
    });

    io.to(job.recruiter._id.toString()).emit("new_notification", notification)

    return res.status(200).json(
        new ApiResponse(200,{application},"applied for job successfully")
    )
})


//? fetchUserApplications

const getApplications = asyncHandler(async(req,res)=>{

    const userId = req.user._id

    if(req.user.role !== "job_seeker"){
        throw new ApiError(403,"Only job seeker can access this route")
    }

    const applications = await Application.find({applicant:userId})
    .populate({
        path : "job",
        select: "title description skills salary location jobtype datePosted"
    })
    .populate({
        path: "applicant",
        select:"firstname lastname email"
    })

    if (!applications || applications.length === 0) {
        throw new ApiError(404, "No applications found for this user");
    }

    return res.status(200).json(
        new ApiResponse(200,{applications},"Fetched applications successfully")
    )
})

//? getApplicationbyId

const getApplicationbyId = asyncHandler(async(req,res)=>{

    const {id} = req.params

    const userId = req.user._id

    if(req.user.role !== "job_seeker"){
        throw new ApiError(403,"Only job seeker can access this route")
    }

    const application = await Application.findOne({
        applicant:userId, _id:id
    })
    .populate({
        path : "job",
        select: "title description skills salary location jobtype datePosted"
    })
    .populate({
        path: "applicant",
        select:"firstname lastname email"
    })

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { application }, "Application fetched successfully")
    );
})

//? get Application by recruiter

const getApplicationbyRecruiter = asyncHandler(async(req,res)=>{

    const userId = req.user._id

    if(req.user.role !== "recruiter"){
        throw new ApiError("only recruiter can access this route")
    }

    const recruiter = await Recruiter.find({user: userId})
    .populate({
        path: "applications",
        populate:{
            path: "job",
            select : "title description skills location salary jobtype datePosted"
        }
    })
    .populate({
        path: "applications",
        populate:{
            path: "applicant",
            select: "firstname lastname email resume"
        }
    })

    if(!recruiter){
        throw new ApiError(404,"No application found")
    }

    return res.status(200).json(
        new ApiResponse(200,{recruiter},"fetched applications")
    )
})

//? update application status

const updateApplicationStatus = asyncHandler(async(req,res)=>{

    const {applicationId,status} = req.params

    const userId = req.user._id

    if(req.user.role !== "recruiter"){
        throw new ApiError(403,"Only recruiter can access this route or update applecation status")
    }

    const application = await Application.findById(applicationId)

    if(!application){
        throw new ApiError(404,"application does not found with this id")
    }

    if(application.status === "pending"){

        if(status === "accepted"){
            application.status = status
            await application.save()
        }else if(status === "rejected"){
    
            const recruiter = await Recruiter.findById(userId)
    
            if(!recruiter){
                throw new ApiError(404,"recruiter not found")
            }
            application.status = status
    
            recruiter.applications.pull(applicationId)
            await recruiter.save()
            await application.save()

            await application.deleteOne({applicationId})
        }
    }else{
        throw new ApiError(400,"status already updated")
    }

    const notification = await Notification.create({
        type: "status_update",
        recipient: application.applicant._id,
        sender: req.user._id,
        job: application.job._id,
        message: `Your application for job: ${application.job.title} has been ${status}`,
    });

    io.to(application.applicant._id.toString()).emit("new_notification", notification);


    return res.status(200).json(
        new ApiResponse(200,null,"update application status successfully")
    )
})

export {
    postApplication,
    getApplications,
    getApplicationbyId,
    getApplicationbyRecruiter,
    updateApplicationStatus
}