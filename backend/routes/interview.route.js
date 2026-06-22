import express from "express";
import { displayquestions ,submitInterview} from "../controllers/interview.controller.js";

const route=express.Router();

route.get("/:id",displayquestions);

route.post(
  "/:id/submit",
  submitInterview
);
export default route;