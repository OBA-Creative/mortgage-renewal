import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Admin from "@/models/adminModel";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find admin with email and include password field
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials or account disabled" },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session data (excluding password)
    const sessionData = {
      id: admin._id,
      email: admin.email,
      userName: admin.userName,
      role: admin.role,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Admin authenticated successfully",
        admin: sessionData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin authentication error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
