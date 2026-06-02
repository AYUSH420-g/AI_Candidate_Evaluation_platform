import express from "express"
import {searchQuery,storeDetails} from "../controllers/admin.controller.js";

const route=express.Router();

route.get("/getrecruiter",searchQuery);
route.post("/assign-project",storeDetails);

export default route;