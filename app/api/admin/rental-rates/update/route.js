import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import RentalRate from "@/models/rentalRatesModel";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { provinceCode, rates } = await request.json();
    console.log("Rental rate update request received:", {
      provinceCode,
      rates: JSON.stringify(rates, null, 2),
    });

    if (!provinceCode || !rates) {
      return NextResponse.json(
        { success: false, message: "Province code and rates are required" },
        { status: 400 }
      );
    }

    // Build the update object using dot notation
    const updateObj = {};

    Object.keys(rates).forEach((rateType) => {
      if (rateType === "prime") {
        updateObj[`${provinceCode}.${rateType}`] = rates[rateType];
        console.log(`Setting ${provinceCode}.${rateType}:`, rates[rateType]);
      } else {
        // Handle fixed rate types (threeYrFixed, fourYrFixed, fiveYrFixed)
        if (rates[rateType]) {
          Object.keys(rates[rateType]).forEach((ltvKey) => {
            if (ltvKey === "refinance" && rates[rateType][ltvKey]) {
              // Handle refinance nested structure
              Object.keys(rates[rateType][ltvKey]).forEach((refinanceKey) => {
                updateObj[
                  `${provinceCode}.${rateType}.${ltvKey}.${refinanceKey}`
                ] = rates[rateType][ltvKey][refinanceKey];
                console.log(
                  `Setting ${provinceCode}.${rateType}.${ltvKey}.${refinanceKey}:`,
                  rates[rateType][ltvKey][refinanceKey]
                );
              });
            } else if (rates[rateType][ltvKey]) {
              // Handle regular LTV keys (under65, under70, etc.)
              updateObj[`${provinceCode}.${rateType}.${ltvKey}`] =
                rates[rateType][ltvKey];
              console.log(
                `Setting ${provinceCode}.${rateType}.${ltvKey}:`,
                rates[rateType][ltvKey]
              );
            }
          });
        }
      }
    });

    console.log(
      "Final rental rate update object:",
      JSON.stringify(updateObj, null, 2)
    );

    // Use findOneAndUpdate with $set to update the document
    const updatedRates = await RentalRate.findOneAndUpdate(
      {}, // Find the most recent document (there should only be one)
      { $set: updateObj },
      {
        new: true,
        sort: { createdAt: -1 },
        runValidators: true,
        lean: false,
      }
    );

    if (!updatedRates) {
      return NextResponse.json(
        { success: false, message: "No existing rental rates document found" },
        { status: 404 }
      );
    }

    console.log(
      "Rental rates document updated successfully:",
      updatedRates._id
    );

    return NextResponse.json({
      success: true,
      message: `${provinceCode} rental rates updated successfully`,
      data: updatedRates[provinceCode],
    });
  } catch (error) {
    console.error("Error updating rental rates:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update rental rates",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
