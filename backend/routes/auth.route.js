import express from "express"
import { handleSignup ,handleLogin} from "../controllers/auth.controller.js";

const router=express.Router();

router.post("/signup",handleSignup);
router.post("/login",handleLogin);

export default router;