import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Rate from "@/models/ratesModel";
import RentalRate from "@/models/rentalRatesModel";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Check if this is a request for rental rates
    const { searchParams } = new URL(request.url);
    const rateType = searchParams.get("type");
    const isRentalRates = rateType === "rental";

    // Choose the appropriate model based on request type
    const RateModel = isRentalRates ? RentalRate : Rate;
    const rateTypeName = isRentalRates ? "rental rates" : "standard rates";

    // Get the most recent rates (today's or latest available)
    const latestRates = await RateModel.findOne().sort({ createdAt: -1 });

    if (!latestRates) {
      return NextResponse.json(
        { success: false, message: `No ${rateTypeName} found in database` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        rates: latestRates,
        prime: latestRates.prime,
        effectiveDate: latestRates.createdAt,
        type: rateTypeName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `Error fetching ${isRentalRates ? "rental" : "standard"} rates:`,
      error
    );
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
