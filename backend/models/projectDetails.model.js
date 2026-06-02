import mongoose, { trusted } from "mongoose";

const project=new mongoose.Schema({

    projectName:{
        type: String,
        required: true
    },

    jobDescription:{
        type: String,
        required : true
    },

    recruiterList:[{
        type:mongoose.Schema.Types.ObjectId, ref:"User"

    }]

});

const projectDetails=mongoose.model("projectDetails",project);
export default projectDetails;