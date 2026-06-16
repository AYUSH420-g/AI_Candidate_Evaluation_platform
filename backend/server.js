import express from "express"
import userRoute from "./routes/auth.route.js"
import adminRoute from "./routes/admin.route.js"
import recruiterRoute from "./routes/recruiter.route.js"
import InterviewRoute from "./routes/interview.route.js"
import dotenv from "dotenv"
import connectDB from "./db.js";
import cors from "cors";


dotenv.config();
connectDB();

const app=express();

app.use(cors());
app.use(express.json());


app.use("/auth",userRoute);
app.use("/interview",InterviewRoute);
app.use("/admin",adminRoute);
app.use("/recruiter",recruiterRoute);

const PORT=process.env.PORT || 5010
app.listen(PORT,()=>{
    console.log(`Server is listening on port ${PORT}`);
})