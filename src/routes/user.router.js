import { Router } from "express";

import { loginUser, registerUser, deleteUser } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);

export default userRouter