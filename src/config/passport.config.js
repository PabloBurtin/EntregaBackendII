import passport from "passport"
import jwt from "passport-jwt"
import User from "../models/user.model.js";

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt; 

const cookieExtractor = (req) => {
    let token = null
    if (req && req.signedCookies){
        token = req.signedCookies.currentUser
    }
    console.log('Extracted token:', token)
    return token;
}

const initializePassport = ()=>{
    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET
    }, async (jwt_payload, done) => {
        console.log('JWT Payload:', jwt_payload)
        try {
             const user = await User.findById(jwt_payload.id);
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        }catch (error) {
            return done (error)
        }
        }
    ))
}

export default initializePassport