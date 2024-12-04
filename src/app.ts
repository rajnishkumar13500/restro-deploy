import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import CookieParser from 'cookie-parser';
import httpStatus from 'http-status';
import ApiError from './errors/apiError';
import router from './app/routes';
import config from './config';
import { Session } from 'inspector';
const passport=require('passport');
const app: Application = express();

app.use(cors());
app.use(CookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(passport.initialize());

require('./helper/passport_jwt')

app.get('/favicon.ico', (req: Request, res: Response) => {
    res.status(204).end();
})

app.get('/', (req: Request, res: Response) => {
    res.send("hello world")
})

// Route to check protected access
app.get('/protected', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err) {
        return res.status(500).json({ success: false, message: "An error occurred", error: err });
      }
      if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
      }
      req.user = user;
      next();
    })(req, res, next);
  }, (req: Request, res: Response) => {
    // This callback will run only if authentication succeeds
    res.status(200).send({
      success: true,
      message: 'Access Granted',
      user:{id: req.user.id,
        email: req.user.email
      },
    });
  });
  


app.use('/api/v1', router);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({ success: false, message: err.message })
    } else {
        res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: 'Something Went Wrong',
        });
    }
    next();
})

export default app;