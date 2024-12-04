import { User, Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/apiError";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import cloudinary from "../../../shared/cloudinary";

const uploadImage = async (imagePath: string): Promise<string> => {
    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder: "users",
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

const createUser = async (payload : any): Promise<User> => {
    const { password, imagePath1, imagePath2, imagePath3, ...restdata } = payload;

    const existingUser = await prisma.user.findUnique({
        where: { email: payload.email },
    });

    if (existingUser) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl1;
    if (imagePath1) {
        imageUrl1 = await uploadImage(imagePath1);
    }
    let imageUrl2;
    if (imagePath2) {
        imageUrl2 = await uploadImage(imagePath2);
    }
    let imageUrl3;
    if (imagePath3) {
        imageUrl3 = await uploadImage(imagePath3);
    }

    try {
        const result = await prisma.user.create({
            data: {
                ...restdata,
                password: hashedPassword,
            },
        });

        if (imageUrl1) {
            await prisma.documents.create({
                data: {
                    name: "Aadhaar",
                    link: imageUrl1,
                    status: "active",
                    user_id: result.id,
                },
            });
        }
        if (imageUrl2) {
            await prisma.documents.create({
                data: {
                    name: "Pan card",
                    link: imageUrl2,
                    status: "active",
                    user_id: result.id,
                },
            });
        }
        if (imageUrl3) {
            await prisma.documents.create({
                data: {
                    name: `other`,
                    link: imageUrl3,
                    status: "active",
                    user_id: result.id,
                },
            });
        }

        return result;
    } catch (error) {
        console.error("Error creating user:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error creating user");
    }
};


interface UserFilters {
    searchTerms?: string[]; 
    ids?: string[];         
    roles?: string[];       
  }
  
  const getAllUsers = async (filters: UserFilters = {}): Promise<Partial<User & { role: { name: string } }>[]> => {
    
    const { searchTerms, ids, roles } = filters;
    console.log({ searchTerms, ids, roles });
  
    const andConditions: any[] = [];
  
    // Filter by search terms (name)
    if (Array.isArray(searchTerms) && searchTerms.length > 0) {
      andConditions.push({
        OR: searchTerms.map((name) => ({
          name: {
            contains: name,
          },
        })),
      });
    }
  
    // Filter by user IDs
    if (Array.isArray(ids) && ids.length > 0) {
      andConditions.push({
        id: {
          in: ids,
        },
      });
    }
  
    // Filter by roles
    if (Array.isArray(roles) && roles.length > 0) {
      andConditions.push({
        role: {
          name: {
            in: roles,
          },
        },
      });
    }
  
    const whereConditions = {
      AND: andConditions.length > 0 ? andConditions : undefined,
    };
  

    console.log(whereConditions)
    // Query Prisma to get the filtered users
    const result = await prisma.user.findMany({
        where: whereConditions,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          password: false, 
          created_at: true,
          updated_at: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          name: "asc", 
        },
      });
  
    return result;  
  };
  


type DeleteUserInput = {
    id: string;
};

const deleteUser = async ({ id }: DeleteUserInput): Promise<void> => {
    let existingUser;
    let documents;

    try {
        existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found");
        }

        documents = await prisma.documents.findMany({
            where: { user_id: id },
        });
    } catch (error) {
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Error finding user or documents"
        );
    }

    // Delete each document from Cloudinary
    try {
        for (const document of documents) {
            const publicId = document.link.split("/").pop()?.split(".")[0]; // Extract public_id from URL
            if (publicId) {
                await cloudinary.uploader.destroy(`users/${publicId}`);
            }
        }

        // Delete documents from the database
        await prisma.documents.deleteMany({
            where: { user_id: id },
        });
    } catch (error) {
        console.error(
            "Error deleting documents from Cloudinary or database:",
            error
        );
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Error deleting user's documents"
        );
    }

    // Delete the user
    try {
        await prisma.user.delete({
            where: { id },
        });
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error deleting user");
    }
};

type UpdateUserInput = {
    id: string;
    name: string;
    role_id: string;
    email: string;
    phone: string;
    password: string;
};
const updateUser = async ({
    id,
    name,
    role_id,
    email,
    phone,
    password,
}: UpdateUserInput): Promise<any> => {
    try {

        const existingUser = await prisma.user.findUnique({
            where: { id },
        });

        if (!existingUser) {
            return new ApiError(404, "User not found");
        }

        // Check if the email already exists in the database
        if (email && email !== existingUser.email) {
            const existingEmail = await prisma.user.findUnique({
                where: { email },
            });

            if (existingEmail) {
                return new ApiError(400, "Email already exists");
            }
        }
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name,
                phone,
                role_id,
                email,
                password: hashedPassword,
                updated_at: new Date(),
            },
            select: {
                id: true,
                name: true,
                phone: true,
                role_id: true,
                status: true,
                email: true,
                updated_at: true,
                created_at: true,
            },
        });

        return updatedUser;
    } catch (error) {
        console.error("Error updating user:", error);
        return new ApiError(500, "Internal server error");
    }
};



export const UserService = {
    createUser,
    getAllUsers,
    deleteUser,
    updateUser,
};
