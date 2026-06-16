import express from "express";
import { displayquestions } from "../controllers/interview.controller.js";

const route=express.Router();

route.get("/:id",displayquestions);
export default route;