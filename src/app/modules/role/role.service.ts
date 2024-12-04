import { PrismaClient, Role } from "@prisma/client"; 
import ApiError from "../../../errors/apiError"; 
import httpStatus from "http-status"; 
import prisma from "../../../shared/prisma"; 

const prismaClient = new PrismaClient(); 

interface CreateRolePayload {
  roleName: string;
  permissionNames: string[];
}

const createRole = async (payload: CreateRolePayload) => {

  const { roleName, permissionNames } = payload;

  try {
    // Find existing permissions by name
    const permissions = await prisma.permission.findMany({
      where: {
        name: { in: permissionNames },
      },
    });

    // Check if all permissions exist
    const existingPermissionNames = permissions.map((permission) => permission.name);
    const missingPermissions = permissionNames.filter(
      (name) => !existingPermissionNames.includes(name)
    );

    if (missingPermissions.length > 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Missing permissions: ${missingPermissions.join(', ')}`);
    }

    // Create the new role with associated permissions
    const newRole = await prisma.role.create({
      data: {
        name: roleName,
        permissions: {
          connect: permissions.map((permission) => ({ id: permission.id })),
        },
      },
    });

    return newRole;
  } catch (error) {
   
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to create role: ${error}`);
  }
}

const getRoles = async (name?: string): Promise<Role[]> => {
  try {
    const result = await prisma.role.findMany({
      where: name
        ? {
            name: {
              contains: name,
              // mode: 'insensitive',
            },
          }
        : {},
      
    });

    return result;
  } catch (error) {
    console.error("Error fetching Roles:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error fetching Roles");
  }
};


const updateRole = async(payload :any) => 
{
    const {id, ...updatedData} = payload ;
    try {

        try {
          const resdb = await prisma.role.findUnique(
            {
              where:{id}
            }
          )
          
        } catch (error) {
          console.log("error fetching the roles")
        }

        const updatedRole = await prisma.role.update({
          where: { id },
          data: {
            ...updatedData,      
          },
          
        });    


    
    } catch (error) {
      console.error("Error Updating Roles:", error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error fetching Roles");
    }
}

export const RoleServices = {
  createRole,
  getRoles,
  updateRole,
};
