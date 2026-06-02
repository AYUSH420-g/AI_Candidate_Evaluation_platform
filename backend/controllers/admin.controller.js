// import mongoose from "mongoose";
import User from "../models/user.model.js";
import projectDetails from "../models/projectDetails.model.js";
const searchQuery=async(req,res)=>{

    try{

        const [name]=req.query.name;
        const query={Role:"recruiter"}

        if(name)
        {
            query.Name={$regex: name, $options: "i"}
        }

        const recruiters = await User.find(query).select("Name Email");
        return res.status(201).json({recruiters:recruiters});

    }
    catch(e)
    {
        console.log(e);
        return res.status(400).json({message:"error from admin contoller"});
    }

};

const storeDetails=async(req,res)=>{

    try{
        const {projectName, jobDescription, recruiterIds}=req.body;

        const query={};

        query.projectName=projectName;
        query.jobDescription=jobDescription;
        query.recruiterList=recruiterIds;

        const q=await projectDetails.create(query);
         res.status(201).json({data:q});


    }
    catch(e)
    {
        console.log(e);
        res.status(400).json({message:"error from admin controller 2"});

    }
}
export {searchQuery,storeDetails};