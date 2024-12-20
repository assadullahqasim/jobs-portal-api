import mongoose from "mongoose";

const jobSchema = mongoose.Schema(
    {
        title:{
            type: String,
            required: true
        },
        description:{
            type: String,
            required: true 
        },
        skills:[
            {
                type: String
            }
        ],
        salary: {
            min:{
                type: Number
            },
            max:{
                type: Number
            }
        },
        location:{
            type: String
        },
        jobtype:{
            type: String,
            enum: ["fulltime","parttime","remote"]
        },
        recruiter:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "recruiter"
        },
        datePosted:{
            type: Date,
            default: Date.now()
        }
    }
)

export const Job = mongoose.model("Job",jobSchema)