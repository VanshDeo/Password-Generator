import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  try{
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI environment variable is not defined");
  }
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
  }catch(err){
    if (err instanceof Error) {
      console.error(`MongoDB connection error: ${err.message}`);
    } else {
      console.error(`MongoDB connection error: ${String(err)}`);
    }
    process.exit(1);
  }
};

export default connectDB;
