import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["application", "status_update"],
            required: true,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
        },
        message: {
            type: String,
            required: true,
        }, 
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
