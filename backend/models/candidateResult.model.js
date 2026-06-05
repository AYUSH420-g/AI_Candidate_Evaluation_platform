import mongoose from "mongoose";

const candidateResultSchema = new mongoose.Schema(
{
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    score: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },

    status: {
        type: String,
        enum: ["Pass", "Fail"],
        required: true
    },

    summary: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

const CandidateResult = mongoose.model(
    "CandidateResult",
    candidateResultSchema
);

export default CandidateResult;