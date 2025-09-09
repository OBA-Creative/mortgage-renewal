import mongoose from "mongoose";

export async function connectToDatabase() {
  try {
    // Check if environment variables are set
    if (!process.env.MONGODB_USERNAME || !process.env.MONGODB_PASSWORD) {
      throw new Error(
        "Missing MONGODB_USERNAME or MONGODB_PASSWORD environment variables. Please create a .env.local file with your MongoDB credentials."
      );
    }

    await mongoose.connect(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.newjce6.mongodb.net/MortgageRenewals?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log("Connection to DB successfully established");
  } catch (err) {
    console.error("Connection to DB failed:", err.message);
    throw err;
  }
}

export default connectToDatabase;
