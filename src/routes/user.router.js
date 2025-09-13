import { Router } from "express";

import { registerUser, deleteUser } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.delete("/:uid", deleteUser);

export default userRouter