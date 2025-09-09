import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Rate from "@/models/ratesModel";

export async function POST(request) {
  try {
    const { prime } = await request.json();

    // Validate prime rate
    if (!prime || isNaN(parseFloat(prime))) {
      return NextResponse.json(
        { success: false, message: "Valid prime rate is required" },
        { status: 400 }
      );
    }

    const primeRate = parseFloat(prime);

    // Validate range (typically prime rate is between 0-20%)
    if (primeRate < 0 || primeRate > 20) {
      return NextResponse.json(
        { success: false, message: "Prime rate must be between 0% and 20%" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find existing rates document or create new one
    let ratesDoc = await Rate.findOne();

    if (!ratesDoc) {
      // Create new document if none exists
      ratesDoc = new Rate({ prime: primeRate });
    } else {
      // Update existing document
      ratesDoc.prime = primeRate;
    }

    await ratesDoc.save();

    return NextResponse.json({
      success: true,
      message: "Prime rate updated successfully",
      prime: ratesDoc.prime,
    });
  } catch (error) {
    console.error("Prime rate update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update prime rate" },
      { status: 500 }
    );
  }
}
