import mongoose from "mongoose";
import * as dotenv from 'dotenv';
dotenv.config()

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB");
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
};