import mongoose from "mongoose";
import Rate from "../models/ratesModel.js";

// MongoDB connection string
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mortgage-renewals";

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
  };
};

// Generate province data
const generateProvinceData = () => {
  // Generate base rates for this province
  const threeYrBase = generateRate(4.7, 5.3);
  const fourYrBase = generateRate(4.8, 5.4);
  const fiveYrBase = generateRate(4.85, 5.5);
  const primeRate = generateRate(6.25, 6.75);

  // Generate variable rate adjustments (typically negative - discounts from prime)
  const threeYrVarAdjustment = generateAdjustment(-1.2, -0.6); // Prime - 0.6% to 1.2%
  const fiveYrVarAdjustment = generateAdjustment(-1.3, -0.7); // Prime - 0.7% to 1.3%

  return {
    threeYrFixed: generateLTVRates(threeYrBase),
    fourYrFixed: generateLTVRates(fourYrBase),
    fiveYrFixed: generateLTVRates(fiveYrBase),
    threeYrVariable: generateVariableLTVAdjustments(threeYrVarAdjustment),
    fiveYrVariable: generateVariableLTVAdjustments(fiveYrVarAdjustment),
    prime: {
      rate: primeRate,
      lender: getRandomLender(),
    },
  };
};

// Main function to insert today's rates
const insertTodayRates = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("📊 Generating rate data for all provinces...");

    // Build the rates document
    const ratesData = {};

    // Generate data for each province
    provinces.forEach((province) => {
      console.log(`   📍 Generating data for ${province}...`);
      ratesData[province] = generateProvinceData();
    });

    console.log("💾 Inserting rates into database...");

    // Insert the new rates document
    const newRates = new Rate(ratesData);
    const savedRates = await newRates.save();

    console.log("✅ Successfully inserted rates!");
    console.log(`📄 Document ID: ${savedRates._id}`);
    console.log(`📅 Created at: ${savedRates.createdAt}`);

    // Display summary for a few provinces
    console.log("\n📊 Sample Rate Data:");
    console.log("=".repeat(70));

    ["AB", "ON", "BC"].forEach((province) => {
      const provinceData = savedRates[province];
      const primeRate = provinceData.prime.rate;

      console.log(
        `\n${province} Province (Prime: ${primeRate}% - ${provinceData.prime.lender}):`
      );
      console.log(`  3-Year Fixed:`);
      console.log(
        `    ≤65% LTV: ${provinceData.threeYrFixed.under65.rate}% (${provinceData.threeYrFixed.under65.lender})`
      );
      console.log(
        `    >80% LTV: ${provinceData.threeYrFixed.over80.rate}% (${provinceData.threeYrFixed.over80.lender})`
      );

      console.log(
        `  3-Year Variable (Prime ${
          provinceData.threeYrVariable.under65.adjustment >= 0 ? "+" : ""
        }${provinceData.threeYrVariable.under65.adjustment}%):`
      );
      const calc3YrVar =
        primeRate + provinceData.threeYrVariable.under65.adjustment;
      console.log(
        `    ≤65% LTV: ${calc3YrVar.toFixed(2)}% calculated (${
          provinceData.threeYrVariable.under65.lender
        })`
      );
      console.log(
        `    Adjustment: ${provinceData.threeYrVariable.under65.adjustment}%`
      );

      console.log(
        `  5-Year Variable (Prime ${
          provinceData.fiveYrVariable.under65.adjustment >= 0 ? "+" : ""
        }${provinceData.fiveYrVariable.under65.adjustment}%):`
      );
      const calc5YrVar =
        primeRate + provinceData.fiveYrVariable.under65.adjustment;
      console.log(
        `    ≤65% LTV: ${calc5YrVar.toFixed(2)}% calculated (${
          provinceData.fiveYrVariable.under65.lender
        })`
      );
      console.log(
        `    Adjustment: ${provinceData.fiveYrVariable.under65.adjustment}%`
      );
    });

    console.log("\n📈 Database Statistics:");
    console.log(`   Total Provinces: ${provinces.length}`);
    console.log(
      `   Rate Types per Province: 5 (3yr/4yr/5yr fixed + 3yr/5yr variable + prime)`
    );
    console.log(`   Fixed Rates: Store actual percentages`);
    console.log(`   Variable Rates: Store adjustments to prime (+/-)`);
    console.log(
      `   Total Rate/Adjustment Pairs: ${
        provinces.length * 5 * 7 + provinces.length
      }`
    );

    console.log("\n✨ Variable rate adjustments stored successfully!");
    console.log(
      "📊 Frontend can calculate: Prime + Adjustment = Final Variable Rate"
    );
  } catch (error) {
    console.error("❌ Error inserting rates:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
};

// Run the script
insertTodayRates();
