import { request } from "express";
import mongoose from "mongoose";

const candidateMatchSchema = new mongoose.Schema(
{
    candidateId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },

    candidateName:{
        type:String,
        // required:true
    },

    openingId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },

    matchedSkills:{
        type:[String],
        default:[]
    },

    missingSkills:{
        type:[String],
        default:[]
    },

    matchedPreferredSkills:{
        type:[String],
        default:[]
    },

    missingPreferredSkills:{
        type:[String],
        default:[]
    },

    skillScore:{
        type:Number,
        default:0
    },

    experienceScore:{
        type:Number,
        default:0
    },

    semanticScore:{
        type:Number,
        default:0
    },

    overallScore:{
        type:Number,
        default:0
    },

    recommendation:{
        type:String,
        default:""
    }
    ,
    status:{
        type:String,
        enum:["Pending", "Shortlisted", "Accepted", "Rejected"],
        default:"Pending"
    },

    Questions:
        [
            {
                question:{
                    type:String,
                    required:true
                },
                Options:{
                    type:String,
                    validate: {
                        validator: function(v) {
                            return v.length === 4;
                        },
            
                    }
                },
                correctAnswer: {
                    type: String
                }
            }
        ],

        link:{
            type:Boolean,
            default:false
        }
},
{
    timestamps:true
});

export default mongoose.model(
    "CandidateMatch",
    candidateMatchSchema
);