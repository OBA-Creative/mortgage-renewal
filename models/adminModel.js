import mongoose from "mongoose";
import validator from "validator";

const adminSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Admin must have a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide admin email address"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      trim: true,
      minLength: 8,
      select: false,
    },
    role: {
      type: String,
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "People",
    timestamps: true,
  }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;
