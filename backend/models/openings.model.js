import mongoose from "mongoose";

const openingSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    
    recruiterList:{
        type:[String],
        default:[]
    },

    jobTitle: {
      type: String,
      required: true,
    },

    seniorityLevel: {
      type: String,
      required: true,
    },

    experienceRequiredYears: {
      type: Number
    },

    mandatorySkills: {
      type: [String],
      default: [],
    },

    preferredSkills: {
      type: [String],
      default: [],
    },

    softSkills: {
      type: [String],
      default: [],
    },

    briefSummary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Opening = mongoose.model("Opening", openingSchema);

export default Opening;