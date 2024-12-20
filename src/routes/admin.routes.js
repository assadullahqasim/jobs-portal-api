import { Router } from "express";
import {
    fetchAllUser,
    fetchAllJobPosts,
    getAdminStats,
    deleteJobPostByAdmin,
    deleteUserById
} from "../controllers/admin.controller.js"
import {jwtVerification} from "../middleware/authJwt.middleware.js"

const router = Router()

//? fetchAllUser

router.route("/fetch/all/user").get(jwtVerification,fetchAllUser)

//? fetchAllJobPosts

router.route("/fetch/all/jobs").get(jwtVerification,fetchAllJobPosts)

//? getAdminStats

router.route("/get-stats").get(jwtVerification,getAdminStats)

//? deleteJobPostByAdmin

router.route("/delete-job/:jobId").delete(jwtVerification,deleteJobPostByAdmin)

//? deleteUserById

router.route("/delete-user/:userId").delete(jwtVerification,deleteUserById)

export default router