import dotenv from "dotenv";
import { createAdmin } from "./createAdmin.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function setupInitialAdmin() {
  const adminData = {
    userName: "Super Admin",
    email: "admin@mortgagerenewals.com",
    password: "AdminPass123!", // Change this to a secure password
  };

  try {
    const result = await createAdmin(adminData);
    if (result.success) {
      console.log("✅ Initial admin setup completed");
      console.log(`📧 Email: ${adminData.email}`);
      console.log(`🔑 Password: ${adminData.password}`);
      console.log(
        "\n⚠️  IMPORTANT: Change the default password after first login!"
      );
    } else {
      console.error("❌ Failed to create admin:", result.message);
    }
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
  } finally {
    process.exit(0);
  }
}

// Run the setup
setupInitialAdmin();
