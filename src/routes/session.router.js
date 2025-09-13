import { Router } from "express";
import { passportAuth } from "../middlewares/passportAuth.js";
import User from "../models/user.model.js";

const sessionRouter = Router();

sessionRouter.get('/current', passportAuth('jwt'), async (req, res) => {
    const user = await User.findById (req.user._id).lean()
    res.render('current', { user })
}) 

sessionRouter.get('/logout', (req, res) => {
      res.clearCookie('currentUser', {
        httpOnly: true,
        signed: true
    })
    res.render('logout')
})

export default sessionRouter