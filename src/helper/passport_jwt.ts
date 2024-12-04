var JwtStrategy = require('passport-jwt').Strategy
var  ExtractJwt = require('passport-jwt').ExtractJwt;
import {Auth}  from "@prisma/client";
import prisma from "../shared/prisma";
import config from "../config";
const passport=require('passport');

// Define the JwtPayload interface explicitly
interface JwtPayload {
  sub: string;
}

// Define the options for the JWT strategy with proper typing
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Extract JWT from Authorization header
  secretOrKey: config.jwt.secret,  // Secret key to verify the token
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload: JwtPayload, done: (error: any, user?: Auth | false) => void) => {
    try {
      // Use `findUnique` to search by id (or modify if you're using another field)
      const user = await prisma.auth.findFirst({
        where: { id: jwt_payload.sub },  // Ensure that `id` is the correct field for matching the JWT `sub`
      });

      if (user) {
        return done(null, user);  // If user is found, return it
      } else {
        return done(null, false);  // If no user is found, return false
      }
    } catch (err) {
      return done(err, false);  // On error, return the error and false
    }
  })
);

export default passport;
