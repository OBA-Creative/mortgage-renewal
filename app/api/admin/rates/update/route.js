import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Rate from "@/models/ratesModel";

// Helper function to validate and format rates to 2 decimal places
const validateAndFormatRate = (rate) => {
  const numRate = parseFloat(rate);

  // Check if it's a valid number
  if (isNaN(numRate)) {
    throw new Error(`Invalid rate value: ${rate}`);
  }

  // Check if it's within reasonable bounds (0 to 30%)
  if (numRate < 0 || numRate > 30) {
    throw new Error(`Rate must be between 0 and 30, got: ${numRate}`);
  }

  // Use toFixed to ensure exactly 2 decimal places, then convert back to number
  // This should work with the Mongoose model's getter/setter
  return parseFloat(numRate.toFixed(2));
};

// Helper function to validate and format all rates in a rate structure
const validateAndFormatRateStructure = (rateStructure) => {
  const formatted = {};
  const ltvCategories = [
    "under65",
    "under70",
    "under75",
    "under80",
    "over80",
    "refinance",
  ];

  for (const ltv of ltvCategories) {
    if (rateStructure[ltv] !== undefined && rateStructure[ltv] !== null) {
      formatted[ltv] = validateAndFormatRate(rateStructure[ltv]);
    }
  }

  return formatted;
};

export async function POST(request) {
  try {
    await connectToDatabase();

    const { provinceCode, rates } = await request.json();

    if (!provinceCode || !rates) {
      return NextResponse.json(
        { success: false, message: "Province code and rates are required" },
        { status: 400 }
      );
    }

    // Validate and format all rates
    let formattedRates;
    try {
      formattedRates = {
        threeYrFixed: validateAndFormatRateStructure(rates.threeYrFixed || {}),
        fourYrFixed: validateAndFormatRateStructure(rates.fourYrFixed || {}),
        fiveYrFixed: validateAndFormatRateStructure(rates.fiveYrFixed || {}),
        threeYrVariable: validateAndFormatRateStructure(
          rates.threeYrVariable || {}
        ),
        fiveYrVariable: validateAndFormatRateStructure(
          rates.fiveYrVariable || {}
        ),
      };

      // Debug: Log the formatted rates to see what we're sending
      console.log(
        "Formatted rates before DB update:",
        JSON.stringify(formattedRates, null, 2)
      );
    } catch (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: "Rate validation failed",
          error: validationError.message,
        },
        { status: 400 }
      );
    }

    // Find the current rates document
    const existingRates = await Rate.findOne().sort({ createdAt: -1 });

    if (!existingRates) {
      return NextResponse.json(
        { success: false, message: "No existing rates found" },
        { status: 404 }
      );
    }

    // Update the specific province rates with formatted data
    const updateData = {};
    updateData[provinceCode] = formattedRates;

    const updatedRates = await Rate.findByIdAndUpdate(
      existingRates._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Debug: Log what was actually saved
    console.log(
      "Saved rates to DB:",
      JSON.stringify(updatedRates[provinceCode], null, 2)
    );

    return NextResponse.json({
      success: true,
      message: `${provinceCode} rates updated successfully`,
      data: updatedRates[provinceCode],
    });
  } catch (error) {
    console.error("Error updating rates:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update rates",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
