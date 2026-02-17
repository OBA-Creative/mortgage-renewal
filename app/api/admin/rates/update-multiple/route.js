import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Rate from "@/models/ratesModel";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { sourceProvinceCode, targetProvinceCodes, rates } =
      await request.json();
    console.log("Multiple update request received:", {
      sourceProvinceCode,
      targetProvinceCodes,
      rates: rates ? "provided" : "not provided",
    });

    if (
      !sourceProvinceCode ||
      !targetProvinceCodes ||
      !Array.isArray(targetProvinceCodes) ||
      !rates
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Source province code, target provinces array, and rates data are required",
        },
        { status: 400 },
      );
    }

    if (targetProvinceCodes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one target province must be specified",
        },
        { status: 400 },
      );
    }

    // Find the current rates document
    const existingRates = await Rate.findOne().sort({ createdAt: -1 });

    if (!existingRates) {
      return NextResponse.json(
        { success: false, message: "No existing rates found" },
        { status: 404 },
      );
    }

    console.log("Found existing document:", existingRates._id);

    // Use the provided rates data instead of fetching from database
    const sourceData = rates;
    console.log("Using provided source data for:", sourceProvinceCode);

    // Build the update object using dot notation for source and all target provinces
    const updateObj = {};

    // First, update the source province with the current form values
    console.log(`Updating source province: ${sourceProvinceCode}`);

    [
      "threeYrFixed",
      "fourYrFixed",
      "fiveYrFixed",
      "threeYrVariable",
      "fiveYrVariable",
    ].forEach((rateType) => {
      if (sourceData[rateType]) {
        // Handle both fixed and variable rate types with LTV structure
        ["under65", "under70", "under75", "under80", "over80"].forEach(
          (ltvKey) => {
            if (sourceData[rateType][ltvKey]) {
              if (rateType.includes("Variable")) {
                // For variable rates, use adjustment instead of rate
                updateObj[`${sourceProvinceCode}.${rateType}.${ltvKey}`] = {
                  adjustment: sourceData[rateType][ltvKey].adjustment,
                  lender: sourceData[rateType][ltvKey].lender,
                };
              } else {
                // For fixed rates, use rate
                updateObj[`${sourceProvinceCode}.${rateType}.${ltvKey}`] = {
                  rate: sourceData[rateType][ltvKey].rate,
                  lender: sourceData[rateType][ltvKey].lender,
                };
              }
              console.log(
                `Set ${sourceProvinceCode}.${rateType}.${ltvKey}:`,
                updateObj[`${sourceProvinceCode}.${rateType}.${ltvKey}`],
              );
            }
          },
        );

        // Handle refinance structure
        if (sourceData[rateType].refinance) {
          ["under25", "over25"].forEach((refinanceKey) => {
            if (sourceData[rateType].refinance[refinanceKey]) {
              if (rateType.includes("Variable")) {
                // For variable rates, use adjustment instead of rate
                updateObj[
                  `${sourceProvinceCode}.${rateType}.refinance.${refinanceKey}`
                ] = {
                  adjustment:
                    sourceData[rateType].refinance[refinanceKey].adjustment,
                  lender: sourceData[rateType].refinance[refinanceKey].lender,
                };
              } else {
                // For fixed rates, use rate
                updateObj[
                  `${sourceProvinceCode}.${rateType}.refinance.${refinanceKey}`
                ] = {
                  rate: sourceData[rateType].refinance[refinanceKey].rate,
                  lender: sourceData[rateType].refinance[refinanceKey].lender,
                };
              }
              console.log(
                `Set ${sourceProvinceCode}.${rateType}.refinance.${refinanceKey}:`,
                updateObj[
                  `${sourceProvinceCode}.${rateType}.refinance.${refinanceKey}`
                ],
              );
            }
          });
        }

        // Handle rental rates (nested under25/over25 structure, like refinance)
        if (sourceData[rateType].rental) {
          ["under25", "over25"].forEach((rentalKey) => {
            if (sourceData[rateType].rental[rentalKey]) {
              if (rateType.includes("Variable")) {
                updateObj[
                  `${sourceProvinceCode}.${rateType}.rental.${rentalKey}`
                ] = {
                  adjustment: sourceData[rateType].rental[rentalKey].adjustment,
                  lender: sourceData[rateType].rental[rentalKey].lender,
                };
              } else {
                updateObj[
                  `${sourceProvinceCode}.${rateType}.rental.${rentalKey}`
                ] = {
                  rate: sourceData[rateType].rental[rentalKey].rate,
                  lender: sourceData[rateType].rental[rentalKey].lender,
                };
              }
              console.log(
                `Set ${sourceProvinceCode}.${rateType}.rental.${rentalKey}:`,
                updateObj[
                  `${sourceProvinceCode}.${rateType}.rental.${rentalKey}`
                ],
              );
            }
          });
        }
      }
    });

    // Then, copy the same rates to all target provinces
    targetProvinceCodes.forEach((targetProvinceCode) => {
      console.log(`Processing target province: ${targetProvinceCode}`);

      // Copy all rate types from source to target
      [
        "threeYrFixed",
        "fourYrFixed",
        "fiveYrFixed",
        "threeYrVariable",
        "fiveYrVariable",
      ].forEach((rateType) => {
        if (sourceData[rateType]) {
          // Handle both fixed and variable rate types with LTV structure
          ["under65", "under70", "under75", "under80", "over80"].forEach(
            (ltvKey) => {
              if (sourceData[rateType][ltvKey]) {
                if (rateType.includes("Variable")) {
                  // For variable rates, use adjustment instead of rate
                  updateObj[`${targetProvinceCode}.${rateType}.${ltvKey}`] = {
                    adjustment: sourceData[rateType][ltvKey].adjustment,
                    lender: sourceData[rateType][ltvKey].lender,
                  };
                } else {
                  // For fixed rates, use rate
                  updateObj[`${targetProvinceCode}.${rateType}.${ltvKey}`] = {
                    rate: sourceData[rateType][ltvKey].rate,
                    lender: sourceData[rateType][ltvKey].lender,
                  };
                }
                console.log(
                  `Set ${targetProvinceCode}.${rateType}.${ltvKey}:`,
                  updateObj[`${targetProvinceCode}.${rateType}.${ltvKey}`],
                );
              }
            },
          );

          // Handle refinance structure
          if (sourceData[rateType].refinance) {
            ["under25", "over25"].forEach((refinanceKey) => {
              if (sourceData[rateType].refinance[refinanceKey]) {
                if (rateType.includes("Variable")) {
                  // For variable rates, use adjustment instead of rate
                  updateObj[
                    `${targetProvinceCode}.${rateType}.refinance.${refinanceKey}`
                  ] = {
                    adjustment:
                      sourceData[rateType].refinance[refinanceKey].adjustment,
                    lender: sourceData[rateType].refinance[refinanceKey].lender,
                  };
                } else {
                  // For fixed rates, use rate
                  updateObj[
                    `${targetProvinceCode}.${rateType}.refinance.${refinanceKey}`
                  ] = {
                    rate: sourceData[rateType].refinance[refinanceKey].rate,
                    lender: sourceData[rateType].refinance[refinanceKey].lender,
                  };
                }
                console.log(
                  `Set ${targetProvinceCode}.${rateType}.refinance.${refinanceKey}:`,
                  updateObj[
                    `${targetProvinceCode}.${rateType}.refinance.${refinanceKey}`
                  ],
                );
              }
            });
          }

          // Handle rental rates (nested under25/over25 structure, like refinance)
          if (sourceData[rateType].rental) {
            ["under25", "over25"].forEach((rentalKey) => {
              if (sourceData[rateType].rental[rentalKey]) {
                if (rateType.includes("Variable")) {
                  updateObj[
                    `${targetProvinceCode}.${rateType}.rental.${rentalKey}`
                  ] = {
                    adjustment:
                      sourceData[rateType].rental[rentalKey].adjustment,
                    lender: sourceData[rateType].rental[rentalKey].lender,
                  };
                } else {
                  updateObj[
                    `${targetProvinceCode}.${rateType}.rental.${rentalKey}`
                  ] = {
                    rate: sourceData[rateType].rental[rentalKey].rate,
                    lender: sourceData[rateType].rental[rentalKey].lender,
                  };
                }
                console.log(
                  `Set ${targetProvinceCode}.${rateType}.rental.${rentalKey}:`,
                  updateObj[
                    `${targetProvinceCode}.${rateType}.rental.${rentalKey}`
                  ],
                );
              }
            });
          }
        }
      });
    });

    console.log("Final update object keys:", Object.keys(updateObj));

    // Use findOneAndUpdate with $set to update all target provinces at once
    const updatedRates = await Rate.findOneAndUpdate(
      {},
      { $set: updateObj },
      {
        new: true,
        sort: { createdAt: -1 },
        runValidators: true,
        lean: false,
      },
    );

    if (!updatedRates) {
      return NextResponse.json(
        { success: false, message: "Failed to update rates document" },
        { status: 500 },
      );
    }

    console.log("Multiple provinces updated successfully");

    // Return the updated data for the source province and target provinces
    const updatedData = {};
    updatedData[sourceProvinceCode] = updatedRates[sourceProvinceCode];
    targetProvinceCodes.forEach((provinceCode) => {
      updatedData[provinceCode] = updatedRates[provinceCode];
    });

    return NextResponse.json({
      success: true,
      message: `Source province ${sourceProvinceCode} and ${targetProvinceCodes.length} target provinces updated successfully`,
      sourceProvince: sourceProvinceCode,
      targetProvinces: targetProvinceCodes,
      data: updatedData,
    });
  } catch (error) {
    console.error("Error updating multiple provinces:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update multiple provinces",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
