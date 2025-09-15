import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import { createHash, isValidPassword } from "../utils/hash.js";

export async function loginUser(req, res) {
    
    //como se logea
    const { email, password } = req.body
    const user = await User.findOne({email})
    
    if(!user || !isValidPassword(password, user.password)){
         return res.redirect('/login?error=invalid_credentials')
    }
    
    //Como se mantiene logeado
    const token = generateToken(user)
    res.cookie('currentUser', token, { 
        httpOnly: true, 
        signed: true, 
        maxAge: 24 * 60 * 60 * 1000
    })
    return res.redirect('/current')
    
}

export const getCurrentUser = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({status: 'success', user});
}
