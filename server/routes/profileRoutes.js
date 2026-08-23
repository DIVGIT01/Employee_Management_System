import { Router } from "express";
import { getProfile } from "../controllers/profileController.js";
import { getProfile } from "../controllers/profileController.js";

const  profileRouter = Router();

profileRouter.get("/", protect, getProfile)
profileRouter.post("/", protect, updateProfile)

export default profileRouter;