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

    // Find the most recent rates document (not just any document)
    let ratesDoc = await Rate.findOne().sort({ createdAt: -1 });

    console.log("Prime update - Found document:", {
      id: ratesDoc?._id,
      currentPrime: ratesDoc?.prime,
      newPrime: primeRate,
    });

    if (!ratesDoc) {
      // Create new document if none exists
      ratesDoc = new Rate({ prime: primeRate });
      console.log("Prime update - Creating new document");
    } else {
      // Update existing document
      ratesDoc.prime = primeRate;
      console.log("Prime update - Updating existing document");
    }

    const savedDoc = await ratesDoc.save();
    console.log("Prime update - Saved successfully:", {
      id: savedDoc._id,
      prime: savedDoc.prime,
    });

    return NextResponse.json({
      success: true,
      message: "Prime rate updated successfully",
      prime: savedDoc.prime,
    });
  } catch (error) {
    console.error("Prime rate update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update prime rate" },
      { status: 500 }
    );
  }
}
