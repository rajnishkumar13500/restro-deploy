import {  Customer } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/apiError";
import httpStatus from "http-status";
import { Request } from "express";
import { IUpload } from "../../../interfaces/file";
import { CloudinaryHelper } from "../../../helper/uploadHelper";
import { logger } from "../../../shared/logger";







//use for create a owner
const createCustomer = async (payload: any): Promise<any> => {
  const data = await prisma.$transaction(
    async (tx) => {
      const { ...othersData } = payload;
      const isExist= await tx.customer.findUnique({where:{email:othersData.email}})
      if (isExist) {
        throw new ApiError(httpStatus.CONFLICT, "Email already exists");
      }

      const customer = await tx.customer.create({ data: othersData });

      
      return customer;
    },
    {
      timeout: 10000, // 10 seconds timeout for the entire transaction
    }
  );
  logger.info("create Customer successfully");

  return data;
};
const getoneCustomer = async (id: string): Promise<Customer| null> => {
  const result = await prisma.customer.findUnique({
    where: {
      id: id,
    },
  });
  return result;
};
const updateCustomer = async (req: Request): Promise<Customer> => {
  const file = req.file as IUpload;
  const id = req.params.id as string;
  const user = req.body;

  if (file) {
    const uploadImage = await CloudinaryHelper.uploadFile(file);
    if (uploadImage) {
      user.img = uploadImage.secure_url;
    } else {
      throw new ApiError(
        httpStatus.EXPECTATION_FAILED,
        "Failed to Upload Image"
      );
    }
  }
  const result = await prisma.customer.update({
    where: { id },
    data: user,
  });
  return result;
};
const deleteCustomer = async (id: string): Promise<any> => {
  const result = await prisma.$transaction(async (tx) => {
    const patient = await tx.customer.delete({
      where: {
        id: id,
      },
    });
  });
  return result;
};

export const customerService = {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getoneCustomer,
};
