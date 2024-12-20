import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.get("/",(req,res)=>{
    res.status(200).json({message:"Hello World"})
})

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//*----> import routes
import userRouter from "./routes/user.routes.js"
import jobRouter from "./routes/job.routes.js"
import applicationRouter from "./routes/application.routes.js"
import adminRouter from "./routes/admin.routes.js"

//*----> use routes
app.use("/api/v1/user",userRouter)
app.use("/api/v1/job",jobRouter)
app.use("/api/v1/application",applicationRouter)
app.use("/api/v1/admin",adminRouter)
export {app}