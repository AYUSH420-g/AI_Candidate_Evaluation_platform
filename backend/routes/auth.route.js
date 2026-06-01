import express from "express"
import { handleSignup } from "../controllers/auth.controller.js";

const router=express.Router();

router.post("/auth",handleSignup);
export default router;