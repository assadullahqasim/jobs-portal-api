import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import crypto from "crypto"

const verificationCodeSchema = mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required : true
        },
        code:{
            type: String,
            required: true
        },
        expiresAt:{
            type: Date,
            default: Date.now(),
            expires: 600
        }
    }
)

verificationCodeSchema.methods.generateCode = function () {
    const code = Math.floor(100000 + Math.random() * 900000);
    const hashedCode = crypto.createHash("sha256").update(code.toString()).digest("hex");
    this.code = hashedCode;
    return code;
};


verificationCodeSchema.methods.generateCodeToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            user:this.user
        },
        process.env.CODE_JWT_SECRET,
        {
            expiresIn: "10m"
        }
    )
}

export const verificationCode = mongoose.model("verificationCode",verificationCodeSchema)