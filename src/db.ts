import mongoose from "mongoose";
import * as dotenv from 'dotenv';
dotenv.config()

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI as string);
  }

  await connectionPromise;
  console.log("Connected to MongoDB");
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
};