import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/userModel";

export async function POST(request) {
  try {
    const body = await request.json();

    console.log(
      "[API /api/users] Received body:",
      JSON.stringify(body, null, 2),
    );

    // Validate minimum required fields before DB call
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Missing required fields: ${!body.firstName ? "firstName" : ""} ${!body.lastName ? "lastName" : ""} ${!body.email ? "email" : ""}`.trim(),
          receivedKeys: Object.keys(body),
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const user = await User.create(body);

    console.log("[API /api/users] User saved successfully:", user._id);

    return NextResponse.json(
      { success: true, user: { id: user._id, email: user.email } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving user:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, message: messages.join(", ") },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to save user data" },
      { status: 500 },
    );
  }
}
