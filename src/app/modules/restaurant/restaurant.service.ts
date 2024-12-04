import { Restaurant, Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/apiError";
import httpStatus from "http-status";
import cloudinary from "../../../shared/cloudinary";
import { EmailtTransporter } from "../../../helper/emailtransfer";
import path from "path";
import { validateEmail } from "../../../utils/emailValidate";
const otpGenerator = require("otp-generator");
import bcrypt from "bcrypt";

const uploadImage = async (imagePath: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "restaurants",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error uploading image"
    );
  }
};

const sendOTP = async (payload: any): Promise<any> => {
  const data: any = await prisma.$transaction(
    async (tx) => {
      const { email } = payload;

      // Validate email
      if (!email) {
        throw new Error("Enter Email !!");
      }
      if (!validateEmail(email)) {
        throw new Error("Enter a Valid Email");
      }

      // Generate OTP and set expiration date
      const expiresDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration
      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
      });

      var dbotp;
      // Check if OTP already exists for this email
      try {
        dbotp = await tx.otp.findFirst({
          where: { email },
        });
      } catch (error) {
        console.log(error);
      }

      if (dbotp) {
        // Update existing OTP
        const updatedOtp = await tx.otp.update({
          where: { id: dbotp.id },
          data: {
            otp,
            expiresAt: expiresDate,
          },
        });
        return updatedOtp;
      } else {
        // Create a new OTP record
        const newOtp = await tx.otp.create({
          data: {
            email,
            otp,
            expiresAt: expiresDate,
          },
        });
        return newOtp;
      }
    },
    {
      timeout: 20000,
    }
  );

  // Send the OTP via email
  await sendOtponEmail(data.email, data.otp);
};

const verifyOTP = async (payload: {
  email: string;
  otp: string;
}): Promise<boolean> => {
  const { email, otp } = payload;

  // Validate input
  if (!email) {
    throw new Error("Enter Email !!");
  }
  if (!validateEmail(email)) {
    throw new Error("Enter a Valid Email");
  }
  if (!otp) {
    throw new Error("Enter OTP !!");
  }

  const otpRecord = await prisma.otp.findFirst({
    where: { email },
  });
  if (!otpRecord) {
    throw new Error("No OTP found for this email.");
  }
  const now = new Date();
  if (otpRecord.expiresAt === null || otpRecord.expiresAt < now) {
    throw new Error("OTP has expired.");
  }
  if (otpRecord.otp !== otp) {
    throw new Error("Invalid OTP.");
  }
  await prisma.otp.delete({ where: { id: otpRecord.id } });

  return true;
};

//use for sending OTPemail
const sendOtponEmail = async (email: string, otp: string) => {
  const pathName = path.join(__dirname, "../../../../template/verify.html");
  const subject = "Sending OTP for Email Verification";
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
};

const createRestaurant = async (
  payload: Prisma.RestaurantCreateInput & { imagePaths?: string[] }
): Promise<Restaurant> => {
  const { name, imagePaths = [], ...restData } = payload;

  // Check if restaurant name already exists
  const existingRestaurant = await prisma.restaurant.findUnique({
    where: { name },
  });

  if (existingRestaurant) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Restaurant name already exists"
    );
  }

  try {
    const newRestaurant = await prisma.restaurant.create({
      data: {
        ...restData,
        name,
      },
      include: {
        Images: true,
      },
    });

    // Upload images and create corresponding entries in Images table
    for (const imagePath of imagePaths) {
      const imageUrl = await uploadImage(imagePath);
      await prisma.images.create({
        data: {
          name: `Image for ${newRestaurant.name}`,
          link: imageUrl,
          Status: "active",
          res_id: newRestaurant.id,
        },
      });
    }

    // Fetch updated restaurant with images
    const restaurantWithImages = await prisma.restaurant.findUnique({
      where: { id: newRestaurant.id },
      include: { Images: true },
    });

    return restaurantWithImages!;
  } catch (error) {
    console.error("Error creating restaurant:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error creating restaurant"
    );
  }
};


interface RestaurantFilters {
  names?: string[];
  ids?: string[];
  phones?: string[];
  reg_numbers?: string[];
  res_addresses?: string[];
  pincodes?: string[];
  res_locations?: string[];
}

const getAllRestaurant = async (filters: RestaurantFilters = {}): Promise<any> => {
  const { names, ids, phones, reg_numbers, res_addresses, pincodes, res_locations } = filters;

  // console.log("inside service: ");
  // console.log({ names, ids, phones, reg_numbers, res_addresses, pincodes, res_locations });

  const andConditions: any[] = [];

  // Filter by names
  if (Array.isArray(names) && names.length > 0) {
    andConditions.push({
      OR: names.map((name) => ({
        name: {
          contains: name,
        },
      })),
    });
  }

  // Filter by ids (use 'in' for exact match)
  if (Array.isArray(ids) && ids.length > 0) {
    andConditions.push({
      id: {
        in: ids,
      },
    });
  }

  // Filter by phones
  if (Array.isArray(phones) && phones.length > 0) {
    andConditions.push({
      phone: {
        in: phones,
      },
    });
  }

  // Filter by reg numbers
  if (Array.isArray(reg_numbers) && reg_numbers.length > 0) {
    andConditions.push({
      reg_number: {
        in: reg_numbers,
      },
    });
  }

  // Filter by res addresses
  if (Array.isArray(res_addresses) && res_addresses.length > 0) {
    andConditions.push({
      res_address: {
        in: res_addresses,
      },
    });
  }

  // Filter by pincodes
  if (Array.isArray(pincodes) && pincodes.length > 0) {
    andConditions.push({
      pincode: {
        in: pincodes,
      },
    });
  }

  // Filter by res locations
  if (Array.isArray(res_locations) && res_locations.length > 0) {
    andConditions.push({
      res_location: {
        in: res_locations,
      },
    });
  }

  // Handle no conditions
  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  console.log(whereConditions);

  // Query Prisma to get the filtered restaurants
  const result = await prisma.restaurant.findMany({
    where: whereConditions,
    include: {
      Images: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return result;
};




// const getRestaurantById = async (restaurantId: string): Promise<Restaurant & { Images: any[] }> => {
//   try {
//     const restaurant = await prisma.restaurant.findUnique({
//       where: { id: restaurantId },
//       include: {
//         Images: true,
//       },
//     });

//     if (!restaurant) {
//       throw new ApiError(httpStatus.NOT_FOUND, "Restaurant not found");
//     }

//     return restaurant;
//   } catch (error) {
//     console.error("Error fetching restaurant:", error);
//     throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error fetching restaurant");
//   }
// };

// const getAllRestaurant = async (name?: string): Promise<Restaurant[]> => {
//   try {
//     const restaurants = await prisma.restaurant.findMany({
//       where: name
//         ? {
//           name: {
//             contains: name,
//             // mode: 'insensitive',
//           },
//         }
//         : {},
//       include: {
//         Images: true,
//       },
//     });

//     return restaurants;
//   } catch (error) {
//     console.error("Error fetching restaurants:", error);
//     throw new ApiError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       "Error fetching restaurants"
//     );
//   }
// };

const deleteRestaurant = async (restaurantId: string): Promise<void> => {
  let existingRestaurant;

  try {
    // Find the restaurant by ID
    existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { Images: true },
    });

    if (!existingRestaurant) {
      throw new ApiError(httpStatus.NOT_FOUND, "Restaurant not found");
    }

    // Delete each image from Cloudinary
    for (const image of existingRestaurant.Images) {
      const publicId = extractPublicId(image.link);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // Delete images from the database
    await prisma.images.deleteMany({
      where: { res_id: restaurantId },
    });

    // Delete the restaurant
    await prisma.restaurant.delete({
      where: { id: restaurantId },
    });
  } catch (error) {
    console.error("Error deleting restaurant or images:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error deleting restaurant or images"
    );
  }
};

const extractPublicId = (url: string): string | null => {
  try {
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1];
    const [publicId] = lastPart.split(".");
    return `restaurants/${publicId}`;
  } catch {
    return null;
  }
};

type UpdateRestaurantInput = {
  id: string;
  updateData: Prisma.RestaurantUpdateInput;
  imagePathsToAdd?: string[];
  imageIdsToDelete?: string[];
};

const updateRestaurant = async ({
  id,
  updateData,
  imagePathsToAdd = [],
  imageIdsToDelete = [],
}: UpdateRestaurantInput): Promise<Restaurant & { Images: any[] }> => {
  try {
    // Check if restaurant exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: { Images: true },
    });

    if (!existingRestaurant) {
      throw new ApiError(httpStatus.NOT_FOUND, "Restaurant not found");
    }

    // Update restaurant details by spreading updateData directly
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
      include: { Images: true },
    });

    // Handle image deletions
    if (imageIdsToDelete.length > 0) {
      const imagesToDelete = await prisma.images.findMany({
        where: {
          id: { in: imageIdsToDelete },
          res_id: id,
        },
        select: { link: true },
      });

      for (const image of imagesToDelete) {
        const publicId = extractPublicId(image.link);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      await prisma.images.deleteMany({
        where: {
          id: { in: imageIdsToDelete },
          res_id: id,
        },
      });
    }

    // Handle image additions
    for (const imagePath of imagePathsToAdd) {
      const imageUrl = await uploadImage(imagePath);
      await prisma.images.create({
        data: {
          name: `Image for ${updatedRestaurant.name}`,
          link: imageUrl,
          Status: "active",
          res_id: id,
        },
      });
    }

    // Fetch updated restaurant with images
    const finalRestaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: { Images: true },
    });

    return finalRestaurant!;
  } catch (error) {
    console.error("Error updating restaurant:", error);
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error updating restaurant"
    );
  }
};

export const RestaurantService = {
  createRestaurant,
  getAllRestaurant,
  deleteRestaurant,
  updateRestaurant,
  // getRestaurantById,
  sendOTP,
  verifyOTP,
};
