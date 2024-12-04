import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

const createToken = (payload: {}, secret: Secret, expireTime: string) => {
    return jwt.sign(payload, secret, {
        expiresIn: expireTime
    })
}

export const JwtHelper={
    createToken
}