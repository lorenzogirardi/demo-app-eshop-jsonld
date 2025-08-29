import { PrismaClient } from "@prisma/client";
import { mockPrisma } from "./mock-db";

// Use mock database instead of real Prisma client
export const prisma = mockPrisma;
