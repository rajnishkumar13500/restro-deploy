import express from "express";
import { authController } from "./auth.controller";

const router = express.Router();

router.post("/login", authController.login);
router.post("/resetpassword", authController.resetpassword);
router.post("/forgotpassword", authController.forgotpassword);
router.post("/setnewpassword", authController.setNewPassword);

export const AuthRouter = router;
