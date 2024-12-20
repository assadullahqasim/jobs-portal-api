import { Job } from "../models/job/job.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Recruiter } from "../models/user model/recruiter.model.js"

//? post job

const postJob = asyncHandler(async(req,res)=>{
    
    if(req.user.role !== "recruiter"){
        throw new ApiError(400,"only recruiter can post job")
    }

    const recruiter = await Recruiter.findOne({user:req.user._id})

    const {title,description,skills,salary,location,jobtype} = req.body

    if(!title || !description || !skills || !salary || !location || !jobtype){
        throw new ApiError(400,"All fields are requireds")
    }

    const { min, max } = salary;

    if (!min || !max) {
        throw new ApiError(400, "Salary min and max are required");
    }

    const job = new Job(
        {
            title,
            description,
            skills:Array.isArray(skills) ? skills : skills.split(",").map(skill => skill.trim()),
            salary:{
                min:Number(min),
                max:Number(max)
            },
            location,
            jobtype,
            recruiter: recruiter._id
        }
    )

    await job.save()

    recruiter.postedJobs.push(job._id)
    await recruiter.save()

    return res.status(200).json(
        new ApiResponse(200,{job},"Job posted successfully")
    )
})

//? update job

const updateJob = asyncHandler(async(req,res)=>{

    const {id} = req.params

    if(req.user.role !== "recruiter"){
        throw new ApiError(400,"only recruiter can update job")
    }

    const {title,description,skills,salary,location,jobtype} = req.body

    const {min,max} = salary

    if(!min || !max){
        throw new ApiError("Salary min and max are required")
    }

    const skillsArray = Array.isArray(skills) ? skills : skills.split(",").map(skill => skill.trim())

    const job = await Job.findByIdAndUpdate(
        id,
        {
            ...(title && {title}),
            ...(description && {description}),
            ...(skills && {skills:skillsArray}),
            ...(salary && {salary:{min:Number(min),max:Number(max)}}),
            ...(location && {location}),
            ...(jobtype && {jobtype})
        },
        {
            new:true
        }
    )

    return res.status(200).json(
        new ApiResponse(200,{job},"job update successfully")
    )
})

//? delete job

const deleteJob = asyncHandler(async(req,res)=>{

    const {id} = req.params

    if(req.user.role !== "recruiter"){
        throw new ApiError(400,"only recruiter delete job")
    }

    const job = await Job.findByIdAndDelete(id)

    return res.status(200).json(
        new ApiResponse(200,{id},"job delete successfully")
    )


})

//? get all job

const findJobs = asyncHandler(async(req,res)=>{

    const {location, "salary[min]":minSalary, "salary[max]": maxSalary,skills,page,limit} = req.query

    const filters = {}

    if(location){
        filters.location  = {$regex: location, $options: "i"}
    }

    if(minSalary || maxSalary){
        filters["salary.min"] = minSalary ? {$get: Number(minSalary)} : undefined
        filters["salary.max"] = maxSalary ? {$lte: Number(maxSalary)} : undefined
    }

    if(skills){
        const skillArray = Array.isArray(skills) ? skills : skills.split(",")
        filters.skills = {$all:skillArray}
    }


    const sortBy = {datePosted : -1}

    const pageNumber = Number(page) || 1
    const pageSize = Number(limit) || 10

    const jobs = await Job.find(filters)
    .sort(sortBy)
    .skip((pageNumber -1)*pageSize)
    .limit(pageSize)

    const totalJobs = await Job.countDocuments(filters)

    return res.status(200).json(
        new ApiResponse(200,{
            jobs,
            pagination:{
                currentPage: pageNumber,
                totalPages: Math.ceil(totalJobs/pageSize),
                totalJobs
            }
        },"fetch jobs successfully")
    )
})

//? getjob by id

const getJobById = asyncHandler(async(req,res)=>{
    
    const {id} = req.params

    const job  = await Job.findById(id)

    if(!job){
        throw new ApiError(404,"job not found")
    }

    return res.status(200).json(
        new ApiResponse(200,{job},"get the job by id successfully")
    )
})

export {
    postJob,
    updateJob,
    deleteJob,
    findJobs,
    getJobById
}