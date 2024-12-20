import mongoose from "mongoose";

const jobSeekerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    resume: {
      type: String,
      required: true
    },
    skills: {
      type: [String],
      required: true
    },
    experience: {
      type: String,
      trim: true
    },
    education: {
      type: String,
      trim: true
    },
    appliedJobs: [ 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
  },
  { timestamps: true }
);

export const JobSeeker = mongoose.model("JobSeeker", jobSeekerSchema);
