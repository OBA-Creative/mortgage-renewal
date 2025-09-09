import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Rate from "@/models/ratesModel";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Get the most recent rates (today's or latest available)
    const latestRates = await Rate.findOne().sort({ createdAt: -1 });

    if (!latestRates) {
      return NextResponse.json(
        { success: false, message: "No rates found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        rates: latestRates,
        effectiveDate: latestRates.createdAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching rates:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
