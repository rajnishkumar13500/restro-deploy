import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Owner } from "@prisma/client";
import { customerService } from "./customer.service";
import { logger } from "../../../shared/logger";


const createCustomer = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:createCustomer");
  const result = await customerService.createCustomer(req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "Successfully Customer Created !!",
    success: true,
    data: result,
  });
});


const getoneCustomer = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:getoneCustomer");
  const result = await customerService.getoneCustomer(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    message: "Get Customer successfull !!",
    success: true,
    data: result,
  });
});
const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:updateCustomer");
  const result = await customerService.updateCustomer(req);
  sendResponse(res, {
    statusCode: 200,
    message: "Update Customer successfull !!",
    success: true,
    data: result,
  });
});
const deleteCustomer = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:deleteCustomer");
  const result = await customerService.deleteCustomer(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    message: "Delete Customer successfull !!",
    success: true,
    data: result,
  });
});

export const customerController = {
  createCustomer,
  getoneCustomer,
  updateCustomer,
  deleteCustomer,
};
