import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import RentalRate from "@/models/rentalRatesModel";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Get the most recent rental rates (today's or latest available) using lean() for plain JS objects
    const latestRates = await RentalRate.findOne()
      .sort({ createdAt: -1 })
      .lean();

    if (!latestRates) {
      return NextResponse.json(
        { success: false, message: "No rental rates found in database" },
        { status: 404 }
      );
    }

    // Extract just the province data, excluding MongoDB metadata
    // Since we used lean(), we already have plain JS objects
    const { _id, createdAt, updatedAt, __v, ...provincesData } = latestRates;

    console.log(
      "Rental API Debug - Full object keys:",
      Object.keys(latestRates)
    );
    console.log(
      "Rental API Debug - Provinces data keys:",
      Object.keys(provincesData)
    );
    console.log("Rental API Debug - Sample province ON:", provincesData.ON);
    console.log(
      "Rental API Debug - ON threeYrFixed:",
      provincesData.ON?.threeYrFixed
    );
    console.log(
      "Rental API Debug - ON fourYrFixed:",
      provincesData.ON?.fourYrFixed
    );
    console.log(
      "Rental API Debug - ON fiveYrFixed:",
      provincesData.ON?.fiveYrFixed
    );

    return NextResponse.json(
      {
        success: true,
        rates: provincesData,
        effectiveDate: latestRates.createdAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching rental rates:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
