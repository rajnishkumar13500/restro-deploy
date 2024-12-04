import bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/apiError";
import httpStatus from "http-status";
import { JwtHelper } from "../../../helper/jwtToken";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import moment from "moment";
const { v4: uuidv4 } = require("uuid");
import * as path from "path";
import { EmailtTransporter } from "../../../helper/emailtransfer";
const otpGenerator = require("otp-generator");
import { forgotPassword } from "@prisma/client";
import { logger } from "../../../shared/logger";

type ILginResponse = {
  accessToken?: string;
  user: {};
};




const sendOtponEmail = async (email: string, otp: string) => {
  const pathName = path.join(__dirname, "../../../../template/verify.html");
  const subject = "Sending Security code for Forgot Password";
  const obj = { OTP: otp };
  const toMail = email;
  try {
    await EmailtTransporter({ pathName, replacementObj: obj, toMail, subject });
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to send email !"
    );
  }
  logger.info("send Security key successfully");

};





const loginUser = async (user: any): Promise<ILginResponse> => {
  const { email, password } = user;
  const isUserExist = await prisma.auth.findUnique({
    where: { email },
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User is not Exist !");
  }
  // check Verified doctor or not
  if (isUserExist.role === "Owner") {
    const getOwnerInfo = await prisma.owner.findUnique({
      where: {
        email: isUserExist.email,
      },
    });
    if (getOwnerInfo && getOwnerInfo?.status === false) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Please Verify Your Email First !"
      );
    }
  }
  const isPasswordMatched = await bcrypt.compare(
    password,
    isUserExist.password
  );

  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.NOT_FOUND, "Password is not Matched !");
  }
  const { role, id } = isUserExist;
  const accessToken = JwtHelper.createToken(
    { role, id },
    config.jwt.secret as Secret,
    config.jwt.JWT_EXPIRES_IN as string
  );
  logger.info("user login successfully");

  return { accessToken, user: { role, id } };
};




const resetpassword = async (user: any): Promise<any> => {
  const { email, password, newpassword } = user;
  const isUserExist = await prisma.auth.findUnique({
    where: { email },
  });
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User is not Exist !");
  }
  const issame = await bcrypt.compare(password, isUserExist.password);
  if (!issame) {
    throw new ApiError(httpStatus.NOT_FOUND, "Password is not Matched !");
  }
  const hashedPassword = await bcrypt.hash(newpassword, 10);
  await prisma.auth.update({
    where: { email },
    data: { password: hashedPassword },
  });
  return { message: "Password reset successfully" };
};
const forgotpassword = async (payload: any) => {
  const { email } = payload;
  if (email.length <= 0) throw new Error("enter valid email address");

  const isUserExist = await prisma.auth.findUnique({
    where: { email },
  });
  if (!isUserExist) throw new Error("email not found");
  const otp = otpGenerator.generate(8, {
    upperCaseAlphabets: true,
    specialChars: true,
  });
  const expiresDate = new Date(Date.now() + 10 * 60 * 1000);
  const forgotpass = await prisma.forgotPassword.create({
    data: { email, otp, expiresAt: expiresDate },
  });
  sendOtponEmail(email, otp);
  logger.info("Reset Password successfully");

  return forgotpassword;
};





const setNewPassword = async (payload: any) => {
  const { email, otp, password, confirmPassword } = payload;
  if (password.length < 8)
    throw new Error("Password should be at least 8 characters long");
  if (password !== confirmPassword)
    throw new Error("Password and confirm password does not match");
  const isUserExist = await prisma.auth.findUnique({
    where: { email },
  });
  if (!isUserExist) throw new Error("email not found");
  const isOtpValid = await prisma.forgotPassword.findFirst({
    where: { email, otp, expiresAt: { gt: new Date() } },
  });
  if (!isOtpValid) throw new Error("Invalid OTP or expired OTP");
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.auth.update({
    where: { email },
    data: { password: hashedPassword },
  });
  await prisma.forgotPassword.delete({ where: { email, otp } });
  return { message: "Password reset successfully" };
};



export const AuthService = {
  loginUser,
  resetpassword,
  forgotpassword,
  setNewPassword,
};
