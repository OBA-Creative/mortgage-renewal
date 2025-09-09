import bcrypt from "bcryptjs";
import connectToDatabase from "../lib/db.js";
import Admin from "../models/adminModel.js";

/**
 * Utility script to create admin accounts
 * Run this script to add administrators to the admin collection
 */
export async function createAdmin(adminData) {
  try {
    await connectToDatabase();

    const { userName, email, password } = adminData;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      throw new Error("Admin with this email already exists");
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new admin
    const newAdmin = new Admin({
      userName,
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    await newAdmin.save();

    console.log(`✅ Admin created successfully: ${email}`);
    return {
      success: true,
      message: `Admin ${email} created successfully`,
      adminId: newAdmin._id,
    };
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    return {
      success: false,
      message: error.message,
    };
  }
}

// Example usage (uncomment and modify to create admin accounts):
//
// async function setupInitialAdmin() {
//   const adminData = {
//     userName: "Super Admin",
//     email: "admin@yourcompany.com",
//     password: "SecurePassword123!" // Use a strong password
//   };
//
//   await createAdmin(adminData);
// }
//
// // Run this to create the initial admin
// setupInitialAdmin().catch(console.error);

export default createAdmin;
