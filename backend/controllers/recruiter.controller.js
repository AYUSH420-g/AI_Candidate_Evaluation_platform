import jwt from "jsonwebtoken";
import projectDetails from "../models/projectDetails.model.js";
const displayOpenings=async(req,res)=>{
    try{
        const token=req.headers.authorization.split(" ")[1];

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        // console.log(decoded.id);

        const tasks=await projectDetails.find({recruiterList:decoded.id});

        
        return res.status(201).json({
            message: "success",tasks});

    }
    catch(e)
    {
        console.log(e);
        return res.status(400).json({message:e});
    }
}
export {displayOpenings}