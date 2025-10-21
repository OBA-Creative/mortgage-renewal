import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Rate from "../models/ratesModel.js";
import connectToDatabase from "../lib/db.js";

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local in the project root
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

// Canadian provinces and territories
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

// Canadian lenders
const lenders = [
  "TD Bank",
  "RBC",
  "BMO",
  "Scotiabank",
  "CIBC",
  "National Bank",
  "Credit Union",
  "Alternative Lender",
  "First National",
  "MCAP",
  "Dominion Lending",
];

// Generate random rate between min and max (rounded to 2 decimals)
const generateRate = (min, max) => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Generate random adjustment (can be positive or negative)
const generateAdjustment = (min, max) => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Generate random lender
const getRandomLender = () => {
  return lenders[Math.floor(Math.random() * lenders.length)];
};

// Generate LTV rate structure for fixed rates
const generateLTVRates = (baseRate) => {
  return {
    under65: {
      rate: baseRate,
      lender: getRandomLender(),
    },
    under70: {
      rate: baseRate + 0.1,
      lender: getRandomLender(),
    },
    under75: {
      rate: baseRate + 0.2,
      lender: getRandomLender(),
    },
    under80: {
      rate: baseRate + 0.3,
      lender: getRandomLender(),
    },
    over80: {
      rate: baseRate + 0.4,
      lender: getRandomLender(),
    },
    refinance: {
      under25: {
        rate: baseRate + 0.15,
        lender: getRandomLender(),
      },
      over25: {
        rate: baseRate + 0.25,
        lender: getRandomLender(),
      },
    },
    rental: {
      rate: {
        rate: baseRate + 0.5, // Rental properties typically have higher rates
        lender: getRandomLender(),
      },
    },
  };
};

// Generate LTV adjustment structure for variable rates (relative to prime)
const generateVariableLTVAdjustments = (baseAdjustment) => {
  return {
    under65: {
      adjustment: baseAdjustment,
      lender: getRandomLender(),
    },
    under70: {
      adjustment: baseAdjustment - 0.05, // Slightly better rate for lower LTV
      lender: getRandomLender(),
    },
    under75: {
      adjustment: baseAdjustment - 0.1,
      lender: getRandomLender(),
    },
    under80: {
      adjustment: baseAdjustment - 0.15,
      lender: getRandomLender(),
    },
    over80: {
      adjustment: baseAdjustment - 0.2,
      lender: getRandomLender(),
    },
    refinance: {
      under25: {
        adjustment: baseAdjustment - 0.05,
        lender: getRandomLender(),
      },
      over25: {
        adjustment: baseAdjustment - 0.1,
        lender: getRandomLender(),
      },
    },
    rental: {
      adjustment: {
        adjustment: baseAdjustment + 0.3, // Rental properties typically have higher adjustments
        lender: getRandomLender(),
      },
    },
  };
};

// Generate province data
const generateProvinceData = () => {
  // Generate base rates for this province
  const threeYrBase = generateRate(4.7, 5.3);
  const fourYrBase = generateRate(4.8, 5.4);
  const fiveYrBase = generateRate(4.85, 5.5);

  // Generate variable rate adjustments (typically negative - discounts from prime)
  const threeYrVarAdjustment = generateAdjustment(-1.2, -0.6); // Prime - 0.6% to 1.2%
  const fiveYrVarAdjustment = generateAdjustment(-1.3, -0.7); // Prime - 0.7% to 1.3%

  return {
    threeYrFixed: generateLTVRates(threeYrBase),
    fourYrFixed: generateLTVRates(fourYrBase),
    fiveYrFixed: generateLTVRates(fiveYrBase),
    threeYrVariable: generateVariableLTVAdjustments(threeYrVarAdjustment),
    fiveYrVariable: generateVariableLTVAdjustments(fiveYrVarAdjustment),
  };
};

// Main function to populate database with updated rates structure
const populateUpdatedRates = async () => {
  try {
    console.log("🔌 Connecting to MongoDB Atlas...");
    await connectToDatabase();
    console.log("✅ Connected to MongoDB Atlas");

    console.log("📊 Generating rate data for all provinces...");

    // Build the rates document
    const ratesData = {};

    // Generate data for each province
    provinces.forEach((province) => {
      console.log(`   📍 Generating data for ${province}...`);
      ratesData[province] = generateProvinceData();
    });

    // Add prime rate (single number value as per updated model)
    ratesData.prime = generateRate(6.25, 6.75);

    console.log("💾 Inserting rates into database...");

    // Delete existing rates to start fresh
    await Rate.deleteMany({});
    console.log("🗑️  Cleared existing rates");

    // Insert the new rates document
    const newRates = new Rate(ratesData);
    const savedRates = await newRates.save();

    console.log("✅ Successfully inserted updated rates!");
    console.log(`📄 Document ID: ${savedRates._id}`);
    console.log(`📅 Created at: ${savedRates.createdAt}`);

    // Display summary for a few provinces
    console.log("\n📊 Sample Rate Data (Updated Structure):");
    console.log("=".repeat(70));

    ["AB", "ON", "BC"].forEach((province) => {
      const provinceData = savedRates[province];
      const primeRate = savedRates.prime;

      console.log(`\n${province} Province (Prime Rate: ${primeRate}%):`);

      console.log(`  3-Year Fixed:`);
      console.log(
        `    ≤65% LTV: ${provinceData.threeYrFixed.under65.rate}% (${provinceData.threeYrFixed.under65.lender})`
      );
      console.log(
        `    >80% LTV: ${provinceData.threeYrFixed.over80.rate}% (${provinceData.threeYrFixed.over80.lender})`
      );
      console.log(
        `    Refinance ≤25yr: ${provinceData.threeYrFixed.refinance.under25.rate}% (${provinceData.threeYrFixed.refinance.under25.lender})`
      );
      console.log(
        `    Rental: ${provinceData.threeYrFixed.rental.rate.rate}% (${provinceData.threeYrFixed.rental.rate.lender})`
      );

      console.log(
        `  3-Year Variable (Prime ${provinceData.threeYrVariable.under65.adjustment >= 0 ? "+" : ""}${provinceData.threeYrVariable.under65.adjustment}%):`
      );
      const calc3YrVar =
        primeRate + provinceData.threeYrVariable.under65.adjustment;
      console.log(
        `    ≤65% LTV: ${calc3YrVar.toFixed(2)}% calculated (${provinceData.threeYrVariable.under65.lender})`
      );
      console.log(
        `    Refinance ≤25yr: ${(primeRate + provinceData.threeYrVariable.refinance.under25.adjustment).toFixed(2)}% calculated (${provinceData.threeYrVariable.refinance.under25.lender})`
      );
      console.log(
        `    Rental: ${(primeRate + provinceData.threeYrVariable.rental.adjustment.adjustment).toFixed(2)}% calculated (${provinceData.threeYrVariable.rental.adjustment.lender})`
      );
    });

    console.log("\n📈 Database Statistics:");
    console.log(`   Total Provinces: ${provinces.length}`);
    console.log(
      `   Rate Types per Province: 5 (3yr/4yr/5yr fixed + 3yr/5yr variable)`
    );
    console.log(
      `   LTV Categories per Rate Type: 5 (≤65%, ≤70%, ≤75%, ≤80%, >80%)`
    );
    console.log(`   Additional Categories: Refinance (≤25yr, >25yr) + Rental`);
    console.log(`   Prime Rate: ${savedRates.prime}% (single value)`);
    console.log(`   Fixed Rates: Store actual percentages`);
    console.log(`   Variable Rates: Store adjustments to prime (+/-)`);

    console.log("\n✨ Updated rate structure populated successfully!");
    console.log(
      "🏠 Includes separate rental property rates and refinance options"
    );
    console.log(
      "📊 Frontend can calculate: Prime + Adjustment = Final Variable Rate"
    );
  } catch (error) {
    console.error("❌ Error populating rates:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
};

// Run the script
populateUpdatedRates();
