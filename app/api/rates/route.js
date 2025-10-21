import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Rate from "@/models/ratesModel";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Get the most recent rates (includes all rate types including rental)
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
        prime: latestRates.prime,
        effectiveDate: latestRates.createdAt,
        type: "all rates (including rental)",
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
