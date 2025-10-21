import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import RentalRate from "@/models/rentalRatesModel";

// Helper function to validate and format rates to 2 decimal places
const validateAndFormatRate = (rate) => {
  const numRate = parseFloat(rate);

  // Check if it's a valid number
  if (isNaN(numRate)) {
    throw new Error(`Invalid rate value: ${rate}`);
  }

  // Check if it's within reasonable bounds (-10 to 30%)
  // Rental rates can have negative adjustments for variable rates
  if (numRate < -10 || numRate > 30) {
    throw new Error(`Rate must be between -10 and 30, got: ${numRate}`);
  }

  // Use toFixed to ensure exactly 2 decimal places, then convert back to number
  return parseFloat(numRate.toFixed(2));
};

// Helper function to validate and format all rates in a rate structure
const validateAndFormatRateStructure = (rateStructure, isVariable = false) => {
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
      if (ltv === "refinance") {
        // Handle refinance subcategories
        formatted[ltv] = {};
        const refinanceCategories = ["under25", "over25"];
        for (const refCat of refinanceCategories) {
          if (
            rateStructure[ltv][refCat] !== undefined &&
            rateStructure[ltv][refCat] !== null
          ) {
            const rateLenderPair = rateStructure[ltv][refCat];
            formatted[ltv][refCat] = {
              [isVariable ? "adjustment" : "rate"]: validateAndFormatRate(
                rateLenderPair[isVariable ? "adjustment" : "rate"] || 0
              ),
              lender: rateLenderPair.lender || "Default Lender",
            };
          }
        }
      } else {
        // Handle regular LTV categories
        const rateLenderPair = rateStructure[ltv];
        formatted[ltv] = {
          [isVariable ? "adjustment" : "rate"]: validateAndFormatRate(
            rateLenderPair[isVariable ? "adjustment" : "rate"] || 0
          ),
          lender: rateLenderPair.lender || "Default Lender",
        };
      }
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
        threeYrFixed: validateAndFormatRateStructure(
          rates.threeYrFixed || {},
          false
        ),
        fourYrFixed: validateAndFormatRateStructure(
          rates.fourYrFixed || {},
          false
        ),
        fiveYrFixed: validateAndFormatRateStructure(
          rates.fiveYrFixed || {},
          false
        ),
        threeYrVariable: validateAndFormatRateStructure(
          rates.threeYrVariable || {},
          true
        ),
        fiveYrVariable: validateAndFormatRateStructure(
          rates.fiveYrVariable || {},
          true
        ),
      };

      console.log(
        "Formatted rental rates for all provinces:",
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

    // Find the current rental rates document
    const existingRates = await RentalRate.findOne().sort({ createdAt: -1 });

    if (!existingRates) {
      return NextResponse.json(
        { success: false, message: "No existing rental rates found" },
        { status: 404 }
      );
    }

    // Build update data for all provinces
    const updateData = {};
    provinces.forEach((provinceCode) => {
      updateData[provinceCode] = formattedRates;
    });

    const updatedRates = await RentalRate.findByIdAndUpdate(
      existingRates._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log("Updated all provinces with new rental rates");

    return NextResponse.json({
      success: true,
      message: "All provinces updated successfully with rental rates",
      updatedProvinces: provinces,
    });
  } catch (error) {
    console.error("Error updating all provinces with rental rates:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update all provinces with rental rates",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
