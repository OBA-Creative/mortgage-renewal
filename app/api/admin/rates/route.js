import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Rate from "@/models/ratesModel";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Get the most recent rates (today's or latest available) using lean() for plain JS objects
    const latestRates = await Rate.findOne().sort({ createdAt: -1 }).lean();

    if (!latestRates) {
      return NextResponse.json(
        { success: false, message: "No rates found in database" },
        { status: 404 }
      );
    }

    // Extract province data and prime rate, excluding MongoDB metadata
    // Since we used lean(), we already have plain JS objects
    const { _id, createdAt, updatedAt, __v, ...dataWithPrime } = latestRates;

    console.log("API Debug - Full object keys:", Object.keys(latestRates));
    console.log(
      "API Debug - Data with prime keys:",
      Object.keys(dataWithPrime)
    );
    console.log("API Debug - Prime rate:", dataWithPrime.prime);
    console.log("API Debug - Sample province ON:", dataWithPrime.ON);

    return NextResponse.json(
      {
        success: true,
        rates: dataWithPrime, // This now includes both provinces and prime rate
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
