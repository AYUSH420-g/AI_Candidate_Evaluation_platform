import jwt from "jsonwebtoken";
import projectDetails from "../models/projectDetails.model.js";
import candidateDetails from "../models/candidateDetails.model.js";
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

const handleCandidate=async(req,res)=>{

    try{

        const {recruiterId,adminId,candidateName,candidateEmail,projectId}=req.body;
        
        const decoded = jwt.verify(recruiterId, process.env.JWT_SECRET);
        
        const query = {
            recruiterId: decoded.id,
            adminId,
            candidateName,
            candidateEmail,
            projectId,
            candidateCv: req.file.path
        };      
        

        const q=await candidateDetails.create(query);
        res.status(201).json({data:q});

    }
    catch(err)
    {
        console.log(err);
        res.status(201).json({message:"error from recruiter controller"});
    }
};

export {displayOpenings,handleCandidate}