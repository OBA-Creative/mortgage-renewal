import mongoose from "mongoose";
import Rate from "../models/ratesModel.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mortgage-renewals";

// Function to normalize rental data from old nested structure to new flat structure
const normalizeRentalData = (rentalData) => {
  if (!rentalData) {
    return null;
  }

  // Handle corrupted fixed rate structure: { rate: { rate: 5.43, lender: "Credit Union" } }
  if (
    rentalData.rate &&
    typeof rentalData.rate === "object" &&
    rentalData.rate.rate !== undefined
  ) {
    console.log("  Fixing fixed rate rental:", JSON.stringify(rentalData));
    return {
      rate: rentalData.rate.rate || 0,
      lender: rentalData.rate.lender || "",
    };
  }

  // Handle corrupted variable rate structure: { adjustment: { adjustment: -0.54, lender: "MCAP" } }
  if (
    rentalData.adjustment &&
    typeof rentalData.adjustment === "object" &&
    rentalData.adjustment.adjustment !== undefined
  ) {
    console.log("  Fixing variable rate rental:", JSON.stringify(rentalData));
    return {
      adjustment: rentalData.adjustment.adjustment || 0,
      lender: rentalData.adjustment.lender || "",
    };
  }

  // Return as-is if already correct format
  return rentalData;
};

async function migrateRentalRates() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    // Get all rate documents
    const rates = await Rate.find({}).lean();
    console.log(`Found ${rates.length} rate document(s)`);

    for (const rateDoc of rates) {
      console.log(`\nProcessing document ${rateDoc._id}...`);
      let hasChanges = false;
      const updateObj = {};

      // List of provinces
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

      for (const province of provinces) {
        if (!rateDoc[province]) continue;

        console.log(`Checking province ${province}...`);

        // Check fixed rate rentals (threeYrFixed, fourYrFixed, fiveYrFixed)
        const fixedRateTypes = ["threeYrFixed", "fourYrFixed", "fiveYrFixed"];
        for (const rateType of fixedRateTypes) {
          if (rateDoc[province][rateType]?.rental) {
            const normalized = normalizeRentalData(
              rateDoc[province][rateType].rental
            );
            if (
              normalized &&
              JSON.stringify(normalized) !==
                JSON.stringify(rateDoc[province][rateType].rental)
            ) {
              updateObj[`${province}.${rateType}.rental`] = normalized;
              hasChanges = true;
              console.log(`  Fixed ${province}.${rateType}.rental`);
            }
          }
        }

        // Check variable rate rentals (threeYrVariable, fiveYrVariable)
        const variableRateTypes = ["threeYrVariable", "fiveYrVariable"];
        for (const rateType of variableRateTypes) {
          if (rateDoc[province][rateType]?.rental) {
            const normalized = normalizeRentalData(
              rateDoc[province][rateType].rental
            );
            if (
              normalized &&
              JSON.stringify(normalized) !==
                JSON.stringify(rateDoc[province][rateType].rental)
            ) {
              updateObj[`${province}.${rateType}.rental`] = normalized;
              hasChanges = true;
              console.log(`  Fixed ${province}.${rateType}.rental`);
            }
          }
        }
      }

      // Apply updates if there are changes
      if (hasChanges) {
        console.log(
          `Updating document ${rateDoc._id} with:`,
          JSON.stringify(updateObj, null, 2)
        );

        const result = await Rate.findByIdAndUpdate(
          rateDoc._id,
          { $set: updateObj },
          { new: true, runValidators: false } // Skip validation during migration
        );

        if (result) {
          console.log(`Successfully updated document ${rateDoc._id}`);
        } else {
          console.error(`Failed to update document ${rateDoc._id}`);
        }
      } else {
        console.log(`No changes needed for document ${rateDoc._id}`);
      }
    }

    console.log("\n✅ Migration completed successfully!");

    // Verify the migration by checking some sample data
    console.log("\nVerifying migration results...");
    const verifyDoc = await Rate.findOne({}).lean();
    if (verifyDoc && verifyDoc.AB) {
      console.log("Sample AB rental data after migration:");
      console.log(
        "  threeYrFixed.rental:",
        JSON.stringify(verifyDoc.AB.threeYrFixed?.rental, null, 2)
      );
      console.log(
        "  threeYrVariable.rental:",
        JSON.stringify(verifyDoc.AB.threeYrVariable?.rental, null, 2)
      );
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.error("Error stack:", error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
console.log("🚀 Starting rental rates migration...");
migrateRentalRates();
