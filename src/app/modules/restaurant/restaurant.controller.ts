import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { logger } from "../../../shared/logger";
import { RestaurantService } from "./restaurant.service";
import ApiError from "../../../errors/apiError";
import httpStatus from "http-status";
import { Restaurant } from "@prisma/client";

const createRestaurant = catchAsync(async (req: Request, res: Response) => {
  logger.info("Inside RestaurantController :: createRestaurant()");
  
  const { imagePaths, ...restaurantData } = req.body;

  const newRestaurant = await RestaurantService.createRestaurant({
    ...restaurantData,
    imagePaths,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Restaurant created successfully!",
    success: true,
    data: newRestaurant,
  });
});

// const getAllRestaurant = catchAsync(async (req: Request, res: Response) => {
//   logger.info("Inside RestaurantController :: getAllRestaurant()");

//   const { name } = req.query;

//   const result = await RestaurantService.getAllRestaurant(name as string);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: "Restaurants fetched successfully!",
//     success: true,
//     data: result,
//   });
// });



interface RestaurantFilters {
  names?: string[]; 
  ids?: string[];         
  phones?: string[]; 
  reg_numbers?:string[]; 
  res_addresses?:string[];
  pincodes?:string[] ;
  res_locations?:string[];    
}
const getAllRestaurant = catchAsync(async (req: Request, res: Response) => {
  logger.info("Inside RestaurantController :: getAllRestaurant()");

  const { names,ids,phones,reg_numbers,res_addresses,pincodes,res_locations } = req.query;

  const filters: RestaurantFilters = {
    names: names ? (Array.isArray(names) ? names : [names]) as string[] : undefined,
    ids: ids ? (Array.isArray(ids) ? ids : [ids]) as string[] : undefined,
    phones: phones ? (Array.isArray(phones) ? phones : [phones]) as string[] : undefined,
    reg_numbers: reg_numbers ? (Array.isArray(reg_numbers) ? reg_numbers : [reg_numbers]) as string[] : undefined,
    res_addresses: res_addresses ? (Array.isArray(res_addresses) ? res_addresses : [res_addresses]) as string[] : undefined,
    pincodes: pincodes ? (Array.isArray(pincodes) ? pincodes : [pincodes]) as string[] : undefined,
    res_locations: res_locations ? (Array.isArray(res_locations) ? res_locations : [res_locations]) as string[] : undefined,
  };

  const result = await RestaurantService.getAllRestaurant(filters);

  sendResponse<Partial<Restaurant & { role: { name: string } }>[]>(res, {
    statusCode: 200,
    message: "Successfully fetched Restaurants!",
    success: true,
    data: result,
  });
});

// const getRestaurantById = catchAsync(async (req: Request, res: Response) => {
//   logger.info("Inside RestaurantController :: getRestaurantById()");

//   const { id } = req.params;

//   if (!id) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Restaurant ID is required");
//   }

//   const restaurant = await RestaurantService.getRestaurantById(id);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     message: "Restaurant fetched successfully",
//     success: true,
//     data: restaurant,
//   });
// });

const updateRestaurant = catchAsync(async (req: Request, res: Response) => {
  logger.info("Inside RestaurantController :: updateRestaurant()");

  const { id } = req.params;  
  const { imagePathsToAdd, imageIdsToDelete, ...updateData } = req.body;

  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Restaurant ID is required for update");
  }

  const updatedRestaurant = await RestaurantService.updateRestaurant({
    id,
    updateData,
    imagePathsToAdd,
    imageIdsToDelete,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Restaurant updated successfully",
    success: true,
    data: updatedRestaurant,
  });
});

const deleteRestaurant = catchAsync(async (req: Request, res: Response) => {
  logger.info("Inside RestaurantController :: deleteRestaurant()");

  const { id } = req.body;

  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Restaurant ID is required for deletion");
  }

  await RestaurantService.deleteRestaurant(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Restaurant deleted successfully",
    success: true,
  });
});


const sendOTP = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:sendOTP");
  const result = await RestaurantService.sendOTP(req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "Successfully OTP Send !!",
    success: true,
    data: result,
  });
});


const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  logger.info("insider controller:verifyOTP");
  const result = await RestaurantService.verifyOTP(req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "OTP verify successfull !!",
    success: true,
    data: result,
  });
});

export const RestaurantController = {
  createRestaurant,
  getAllRestaurant,
  // getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  sendOTP,
  verifyOTP,
};
