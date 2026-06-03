import express from "express";
import { displayOpenings, handleCandidate } from "../controllers/recruiter.controller.js";
import upload from "../middleware/upload.js";

const router=express.Router();

router.get("/getOpenings",displayOpenings);
router.post("/addCandidate",
    upload.single("candidateCv"),
    handleCandidate
);
export default router;