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

    Questions: {
  easy: [
    {
      question: String,

      code: {
        type: String,
        default: ""
      },

      options: {
        A: String,
        B: String,
        C: String,
        D: String
      },

      correctAnswer: {
        type: String,
        enum: ["A", "B", "C", "D"]
      },

      selectedAnswer:{
        type: String,
        enum: ["A", "B", "C", "D"],
        default: null
      },

      type: {
        type: String,
        enum: ["aptitude", "technical"]
      },

      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"]
      }
    }
  ],

  medium: [
    {
      question: String,

      code: {
        type: String,
        default: ""
      },

      options: {
        A: String,
        B: String,
        C: String,
        D: String
      },

      correctAnswer: {
        type: String,
        enum: ["A", "B", "C", "D"]
      },
      selectedAnswer:{
        type: String,
        enum: ["A", "B", "C", "D"],
        default: null
      }
      ,
      type: {
        type: String,
        enum: ["aptitude", "technical"]
      },

      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"]
      }
    }
  ],

  hard: [
    {
      question: String,

      code: {
        type: String,
        default: ""
      },

      options: {
        A: String,
        B: String,
        C: String,
        D: String
      },

      correctAnswer: {
        type: String,
        enum: ["A", "B", "C", "D",""]
      },

      selectedAnswer:{
        type: String,
        enum: ["A", "B", "C", "D"],
        default: null
      },

      type: {
        type: String,
        enum: ["aptitude", "technical"]
      },

      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"]
      }
    }
  ]
},


    link: {
    type: Boolean,
    default: false
    },

    link_url:{
      type:String,
      default: null
    },

    testScore:{
      type:Number,
      default: null
    },

    totalQuestions:{
      type:Number,
      default: null
    },

    testSubmitted:{
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