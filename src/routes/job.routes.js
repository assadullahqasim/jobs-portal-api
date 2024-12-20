import { Router } from "express";
import {
    postJob,
    updateJob,
    deleteJob,
    findJobs,
    getJobById
} from "../controllers/job.controller.js"
import { jwtVerification } from "../middleware/authJwt.middleware.js"

const router = Router()

//? postJob

router.route("/post-job").post(jwtVerification,postJob)

//? updateJob

router.route("/job-update/:id").put(jwtVerification,updateJob)

//? deleteJob

router.route("/delete-job/:id").delete(jwtVerification,deleteJob)

//? findJobs

router.route("/find-jobs").get(findJobs)

//? getJobById

router.route("/get-job/:id").get(getJobById)

export default router