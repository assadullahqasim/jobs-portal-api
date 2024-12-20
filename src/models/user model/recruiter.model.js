import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    companyDescription: {
      type: String,
      required: true,
      trim: true
    },
    companyLocation: {
      type: String,
      required: true,
      trim: true
    },
    companyLogo: { 
      type: String,
      trim: true
    },
    postedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application"
      },
    ],
  },
  { timestamps: true }
);

export const Recruiter = mongoose.model("Recruiter", recruiterSchema);
