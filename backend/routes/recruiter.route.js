import express from "express";
import { displayOpenings, handleAnalyse, handleCandidate, getCandidates, handleAtsCheck } from "../controllers/recruiter.controller.js";
import upload from "../middleware/upload.js";

const router=express.Router();

router.get("/getOpenings",displayOpenings);
router.post("/addCandidate",
    upload.single("candidateCv"),
    handleCandidate
);
router.post("/analyse",handleAnalyse);
router.get("/getCandidates",getCandidates);
router.post("/ats-check",
    upload.single("resume"),
    handleAtsCheck
);
export default router;