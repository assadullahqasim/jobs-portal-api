import { Router } from "express";
import {
    postApplication,
    getApplications,
    getApplicationbyId,
    getApplicationbyRecruiter,
    updateApplicationStatus
} from "../controllers/application.controller.js"
import {jwtVerification} from "../middleware/authJwt.middleware.js"


const router = Router()

//? postApplication

router.route("/post-application/:jobId").post(jwtVerification,postApplication)

//? getApplications

router.route("/get-applications").get(jwtVerification,getApplications)

//? getApplicationbyId

router.route("/get-application/:id").get(jwtVerification,getApplicationbyId)

//? getApplicationbyRecruiter

router.route("/get/recruiter/applications").get(jwtVerification,getApplicationbyRecruiter)

//? updateApplicationStatus

router.route("/update-application-status/:applicationId/:status").get(jwtVerification,updateApplicationStatus)

export default router