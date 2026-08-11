import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error`);
    process.exit(1); // Stop the server if connection fails
  }
};

