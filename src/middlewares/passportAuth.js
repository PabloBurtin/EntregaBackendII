import passport from "passport"

export const passportAuth = (strategy) => {
    return async (req, res, next) =>{
       passport.authenticate(strategy, { session: false }, (error, user, info) => {
            if(error) {
                console.error( 'Authentication error:', error)
                return res.redirect('/login?error=auth_error')
            }
            if(!user) {
                return res.redirect('/login?error=invalid_credentials')
            }
            req.user = user
            next()
       })(req, res, next)
    }
}