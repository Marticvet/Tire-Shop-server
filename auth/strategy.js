import { PRIVATE_KEY } from "../config.js";
import passportJwt from "passport-jwt";

const options = {
    secretOrKey: PRIVATE_KEY,
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken()
};

const jwtStrategy = new passportJwt.Strategy(options, async (payload, done) => {
    const userdata = {
        userId: payload.userId,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name
    };
    
    // userData will be set as `req.user` in the `next` middleware
    done(null, userdata);
})

export default jwtStrategy;