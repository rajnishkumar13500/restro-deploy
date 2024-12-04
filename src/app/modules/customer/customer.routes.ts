import express, { NextFunction, Request, Response } from "express";
import { CloudinaryHelper } from "../../../helper/uploadHelper";
const router = express.Router();
import { customerController } from "./customer.controller";

router.post("/", customerController.createCustomer);

router.get("/:id?", customerController.getoneCustomer);
router.patch(
  "/:id?",
  CloudinaryHelper.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    return customerController.updateCustomer(req, res, next);
  }
);
router.delete("/:id?", customerController.deleteCustomer);

export const customerRouter = router;
