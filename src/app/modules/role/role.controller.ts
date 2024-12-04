import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { logger } from "../../../shared/logger";
import { RoleServices } from "./role.service";
import ApiError from "../../../errors/apiError";
import httpStatus from "http-status";

const createRole = catchAsync(async (req: Request, res: Response) => {
  logger.info("Inside RoleController :: createRole()");
  
  const newRole = await  RoleServices.createRole(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Role created successfully!",
    success: true,
    data: newRole,
  });
});



const getRoles = catchAsync(async (req: Request, res: Response) => {
  logger.info("Inside RolesController :: getRoles()");

  const { name } = req.query;

  const result = await RoleServices.getRoles(name as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Roles fetched successfully!",
    success: true,
    data: result,
  });
});


const updateRoles = catchAsync(async (req: Request, res: Response) => {
  logger.info("Inside Rolecontroller :: updateRole()");

  const { id } = req.params;  
  const { updateData } = req.body;

  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Restaurant ID is required for update");
  }

  const updatedRole = await RoleServices.updateRole({
    id,
    updateData,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Role updated successfully",
    success: true,
    data: updatedRole,
  });
});


export const RoleController = {
  createRole,
  getRoles,
  updateRoles,
  
};
