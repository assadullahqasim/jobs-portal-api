import mongoose from "mongoose";

const applicationSchema = mongoose.Schema(
    {
        job:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },
        applicant:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        coverLetter:{
            type: String, 
            required: false
        },
        resume:{
            type: String,
            required: false
        },
        status:{
            type: String,
            enum: ["pending","accepted","rejected"],
            default: "pending"
        },
        appliedAt:{
            type: Date,
            default: Date.now()
        }
    },{
        timestamps: true
    }
)

export const Application = mongoose.model("Application",applicationSchema)