import express, { NextFunction, Request, Response } from 'express';
import { UserController } from './user.controller';

const router = express.Router();

router.get('/getAllUsers', UserController.getAllUser);
router.post('/', UserController.createUser);
router.delete('/',UserController.deleteUser);
router.put('/:id',UserController.updateUser);

export const UserRouter = router;