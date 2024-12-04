import { PrismaClient } from "@prisma/client";
import { query } from "express";

const prisma = new PrismaClient({
    errorFormat: 'minimal',
    log:["query"],
});

export default prisma;