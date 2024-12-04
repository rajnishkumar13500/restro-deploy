import express, { NextFunction, Request, Response } from "express";
import { CloudinaryHelper } from "../../../helper/uploadHelper";
const router = express.Router();
import { ownerController } from "./owner.controller";

router.post("/", ownerController.createOwner);
router.post("/sendotp", ownerController.sendOTP);
router.post("/resendotp", ownerController.reSendOtponEmail);
router.post("/verifyOTP", ownerController.verifyOTP);
router.get("/:id?", ownerController.getoneOwner);
router.patch(
  "/:id?",
  CloudinaryHelper.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    return ownerController.updateOwner(req, res, next);
  }
);
router.delete("/:id?", ownerController.deleteOwner);

export const ownerRouter = router;
