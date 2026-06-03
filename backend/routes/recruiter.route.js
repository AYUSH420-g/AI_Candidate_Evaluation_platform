import express from "express";
import { displayOpenings } from "../controllers/recruiter.controller.js";

const router=express.Router();

router.get("/getOpenings",displayOpenings);
export default router;