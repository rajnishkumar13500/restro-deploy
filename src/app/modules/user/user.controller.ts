import { Request,Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { logger } from "../../../shared/logger";
import { UserService } from "./user.service";
import { User } from "@prisma/client";

const createUser = catchAsync(async (req: Request, res: Response) => {
  logger.info("Inside UserController :: createUser()");
  await UserService.createUser(req.body);
  sendResponse(res, {
    statusCode: 200,
    message: "Successfully User Created !!",
    success: true,
  });
});

interface UserFilters {
  searchTerms?: string[]; 
  ids?: string[];         
  roles?: string[];       
}
const getAllUser = catchAsync(async (req: Request, res: Response) => {
  logger.info("Inside UserController :: getAllUser()");

  const { searchTerms, roles, ids } = req.query;

  console.log("searchTerms : " ,searchTerms);
  console.log("roles : " ,roles);
  console.log("ids : " ,ids);

  const filters: UserFilters = {
    searchTerms: searchTerms ? (Array.isArray(searchTerms) ? searchTerms : [searchTerms]) as string[] : undefined,
    roles: roles ? (Array.isArray(roles) ? roles : [roles]) as string[] : undefined,
    ids: ids ? (Array.isArray(ids) ? ids : [ids]) as string[] : undefined,
  };
  
  const result = await UserService.getAllUsers(filters);

  sendResponse<Partial<User & { role: { name: string } }>[]>(res, {
    statusCode: 200,
    message: "Successfully fetched users!",
    success: true,
    data: result,
  });
});



const deleteUser = catchAsync(async (req:Request,res:Response) =>
{
  logger.info("Inside UserController :: deleteUser()");
  await UserService.deleteUser(req.body);
  sendResponse(res,{
    statusCode:200,
    message:"User Deleted Successfully",
    success:true,
  });
}) ;

const updateUser = catchAsync(async(req:Request,res:Response) => 
{
  logger.info("Inside UserController :: updateUser()");
  await UserService.updateUser(req.body);
  sendResponse(res,{statusCode:200,
    message:"User Updated Sucessfully",
    success:true,
    });
});

export const UserController = {
  createUser,
  getAllUser,
  deleteUser,
  updateUser,
  
};
