import mongoose from "mongoose";
import * as dotenv from 'dotenv';
dotenv.config()

// Cache the connection across warm serverless invocations.
let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 8000 })
      .then((m) => {
        console.log("Connected to MongoDB");
        return m;
      })
      .catch((err) => {
        // Reset so the next invocation can retry instead of reusing a failed promise.
        connectionPromise = null;
        console.error("MongoDB connection error:", err);
        throw err;
      });
  }

  await connectionPromise;
};

export const closeDB = async (): Promise<void> => {
  await mongoose.disconnect();
};