import passport from "passport";

const authMiddleware = passport.authenticate("jwt", { session: false });

export { authMiddleware };
