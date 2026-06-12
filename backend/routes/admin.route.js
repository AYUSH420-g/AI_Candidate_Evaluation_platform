import express from "express"
import multer from "multer";
import { searchQuery,storeDetails,getStatus, displaystatus, rejectCandidate ,genQuestion} from "../controllers/admin.controller.js";

const route=express.Router();
const upload=multer({storage:multer.memoryStorage()});

route.get("/getrecruiter",searchQuery);
route.post("/assign-project",upload.single('jobDesc'),storeDetails);
route.get("/getstatus",getStatus);
route.get("/displaystatus",displaystatus);
route.patch("/rejectcandidate/:id",rejectCandidate);
route.post("/genquestion",genQuestion);

export default route;