import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Owner } from "@prisma/client";
import { ownerService } from "./owner.service";
import { logger } from "../../../shared/logger";

const sendOTP = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:sendOTP");
  const result = await ownerService.sendOTP(req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "Successfully OTP Send !!",
    success: true,
    data: result,
  });
});
const reSendOtponEmail = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:reSendOtponEmail");
  const result = await ownerService.reSendOtponEmail(req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "Successfully OTP reSend !!",
    success: true,
    data: result,
  });
});
const createOwner = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:createOwner");
  const result = await ownerService.createOwner(req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "Successfully Owner Created !!",
    success: true,
    data: result,
  });
});
const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:verifyOTP");
  const result = await ownerService.verifyOTP(req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "OTP verify successfull !!",
    success: true,
    data: result,
  });
});

const getoneOwner = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:getoneOwner");
  const result = await ownerService.getoneOwner(req,req.params.id);
  sendResponse(res, {
    statusCode: 200,
    message: "Get Owner successfull !!",
    success: true,
    data: result,
  });
});
const updateOwner = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:updateOwner");
  const result = await ownerService.updateOwner(req);
  sendResponse(res, {
    statusCode: 200,
    message: "Update Owner successfull !!",
    success: true,
    data: result,
  });
});
const deleteOwner = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:deleteOwner");
  const result = await ownerService.deleteOwner(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    message: "Delete Owner successfull !!",
    success: true,
    data: result,
  });
});

export const ownerController = {
  createOwner,
  sendOTP,
  reSendOtponEmail,
  verifyOTP,
  getoneOwner,
  updateOwner,
  deleteOwner,
};
