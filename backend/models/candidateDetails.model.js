import mongoose from "mongoose";

const candidateDetailsSchema = new mongoose.Schema(
    {
        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        candidateName: {
            type: String,
            required: true,
            trim: true,
        },

        candidateEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        candidateCv: {
            type: String, 
            required: true,
        },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Rejected", "Selected"],
            default: "Pending",
        },
        resumeText: {
            type: String
}
    },
    {
        timestamps: true,
    }
);

const candidateDetails = mongoose.model(
    "candidateDetails",
    candidateDetailsSchema
);

export default candidateDetails;