import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Rate from "@/models/ratesModel";

export async function GET() {
  try {
    await connectToDatabase();

    // Find the most recent rates document to get the current prime rate
    const ratesDoc = await Rate.findOne().sort({ createdAt: -1 });

    if (!ratesDoc) {
      // Return default prime rate if no document exists
      return NextResponse.json({
        success: true,
        prime: 0,
        message: "No prime rate found, returning default",
      });
    }

    return NextResponse.json({
      success: true,
      prime: ratesDoc.prime || 0,
    });
  } catch (error) {
    console.error("Error fetching prime rate:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch prime rate" },
      { status: 500 }
    );
  }
}
