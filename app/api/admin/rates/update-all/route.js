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

    const { rates } = await request.json();

    if (!rates) {
      return NextResponse.json(
        { success: false, message: "Rates are required" },
        { status: 400 }
      );
    }

    // List of all Canadian provinces and territories
    const provinces = [
      "AB",
      "BC",
      "MB",
      "NB",
      "NL",
      "NS",
      "NT",
      "NU",
      "ON",
      "PE",
      "QC",
      "SK",
      "YT",
    ];

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

      console.log(
        "Formatted rates for all provinces:",
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

    // Build update data for all provinces
    const updateData = {};
    provinces.forEach((provinceCode) => {
      updateData[provinceCode] = formattedRates;
    });

    const updatedRates = await Rate.findByIdAndUpdate(
      existingRates._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log("Updated all provinces with new rates");

    return NextResponse.json({
      success: true,
      message: "All provinces updated successfully",
      updatedProvinces: provinces,
    });
  } catch (error) {
    console.error("Error updating all provinces:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update all provinces",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
