import mongoose from "mongoose";

export const connectMongoDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};
