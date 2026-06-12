import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ""
    },

    email: {
      type: String,
      
      lowercase: true,
      trim: true
    },

    seniorityLevel: {
      type: String,
      default: ""
    },

    experienceYears: {
      type: Number,
      default: 0
    },

    skills: {
      type: [String],
      default: []
    },

    resumeText: {
      type: String,
      default: ""
    },

    embeddingText: {
      type: String,
      default: ""
    },

    resumeEmbedding: {
      type: [Number],
      default: []
    },

    aiSummary: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Candidate = mongoose.model(
  "Candidate",
  candidateSchema
);

export default Candidate;