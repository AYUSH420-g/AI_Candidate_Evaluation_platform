import express from "express"
import userRoute from "./routes/auth.route.js"
import dotenv from "dotenv"
import connectDB from "./db.js";
import cors from "cors";


dotenv.config();
connectDB();

const app=express();

app.use(cors());
app.use(express.json());

app.use("/",userRoute);

const PORT=process.env.PORT || 5010
app.listen(PORT,()=>{
    console.log(`Server is listening on port ${PORT}`);
})