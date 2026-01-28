import { PrismaClient } from "./generated/prisma/index.js";
import { config } from 'dotenv';

config();

const prisma = new PrismaClient({
  adapter: {
    url: process.env.DATABASE_URL
  }
});

export default prisma;
