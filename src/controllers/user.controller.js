import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import { createHash, isValidPassword } from "../utils/hash.js";

export async function loginUser(req, res) {
    
    //como se logea
    const { email, password } = req.body
    const user = await User.findOne({email})
    console.log('User found:', user)
    if(!user || !isValidPassword(password, user.password)){
        console.log('Invalid credentials for:', email)
        return res.redirect('/login?error=invalid_credentials')
    }
    
    //Como se mantiene logeado
    const token = generateToken(user)
    res.cookie('currentUser', token, { 
        httpOnly: true, 
        signed: true, 
        maxAge: 24 * 60 * 60 * 1000
    })
     console.log('Login successful for:', email)
    res.redirect('/current')
}

export async function registerUser(req, res) {
   try{ const { first_name, last_name, age, email, password } = req.body
    const hashedPassword = createHash(password)

    const user = await User.findOne({email})
    if (user) {
        return res.redirect('/register?error=errorregistro')
    }

    const newUser = await User.create ({ 
        first_name, 
        last_name, 
        age, 
        email, 
        password: hashedPassword})
    
    const token = generateToken(newUser)

    res.cookie('currentUser', token, { 
        httpOnly: true, 
        signed: true,
        maxAge: 24 * 60 * 60 * 1000
     })
    res.redirect('/current')
}catch(error){
    res.redirect('/register?error=registration_failed')
}
}

export async function deleteUser(req, res) {
     try{
        const uid = req.params.uid;
        
        const deletedUser = await User.findByIdAndDelete(uid);
        if (!deletedUser) return res.status(404).json({status: "error", message: "Usuario no encontrado"})

        res.status(200).json({status: "success", payload: deletedUser})
        
    }catch (error){
        res.status(500).json ({ status: "error", message: "Error al borrar el usuario" })
    }
    
}