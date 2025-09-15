import { Router } from "express";
import { passportAuth } from "../middlewares/passportAuth.js";
import { loginUser, getCurrentUser } from "../controllers/session.controller.js";
import User from "../models/user.model.js";

const sessionRouter = Router();

sessionRouter.post("/login", loginUser)
sessionRouter.get('/current', passportAuth('jwt'), getCurrentUser) 

export default sessionRouter