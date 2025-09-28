import dotenv from "dotenv";
import connectToDatabase from "../lib/db.js";
import RentalRate from "../models/rentalRatesModel.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Generate realistic rental property mortgage rates with LTV adjustments and lender info
function generateRealisticRentalRates() {
  const baseRate = 5.4; // Rental rates typically 0.4-0.6% higher than owner-occupied
  const variableDiscount = 0.5; // Variable rates typically lower than fixed

  // Sample lenders for rental properties (some specialize in investment properties)
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
    "B2B Bank",
    "CMLS",
    "Equitable Bank",
  ];

  // Generate random lender
  const getRandomLender = () => {
    return lenders[Math.floor(Math.random() * lenders.length)];
  };

  // Generate random adjustment for variable rates (typically negative - discounts from prime)
  const generateAdjustment = (min, max) => {
    return +(Math.random() * (max - min) + min).toFixed(2);
  };

  // Generate base rates for fixed terms (rental properties have higher rates)
  const baseRates = {
    threeYrFixed: +(baseRate + Math.random() * 0.6 - 0.3).toFixed(2),
    fourYrFixed: +(baseRate + Math.random() * 0.4 - 0.2).toFixed(2),
    fiveYrFixed: +(baseRate + Math.random() * 0.3 - 0.15).toFixed(2),
  };

  // Generate variable rate adjustments for rental properties (typically less favorable)
  const variableAdjustments = {
    threeYrVariable: generateAdjustment(-0.8, -0.2), // Prime - 0.2% to 0.8% (less discount than owner-occupied)
    fiveYrVariable: generateAdjustment(-0.9, -0.3), // Prime - 0.3% to 0.9% (less discount than owner-occupied)
  };

  // Create LTV structure for fixed rates
  const ltvRates = {};

  Object.keys(baseRates).forEach((rateType) => {
    const base = baseRates[rateType];
    ltvRates[rateType] = {
      under65: {
        rate: +(base + 0.0).toFixed(2),
        lender: getRandomLender(),
      },
      under70: {
        rate: +(base + 0.15).toFixed(2), // Higher premium for rental properties
        lender: getRandomLender(),
      },
      under75: {
        rate: +(base + 0.25).toFixed(2), // Higher premium for rental properties
        lender: getRandomLender(),
      },
      under80: {
        rate: +(base + 0.35).toFixed(2), // Higher premium for rental properties
        lender: getRandomLender(),
      },
      over80: {
        rate: +(base + 0.5).toFixed(2), // Significantly higher for rental >80% LTV
        lender: getRandomLender(),
      },
      refinance: {
        under25: {
          rate: +(base + 0.2).toFixed(2), // Higher refinance rates for rentals
          lender: getRandomLender(),
        },
        over25: {
          rate: +(base + 0.35).toFixed(2), // Higher refinance rates for rentals
          lender: getRandomLender(),
        },
      },
    };
  });

  // Create LTV structure for variable rates (using adjustments to prime)
  Object.keys(variableAdjustments).forEach((rateType) => {
    const baseAdjustment = variableAdjustments[rateType];
    ltvRates[rateType] = {
      under65: {
        adjustment: baseAdjustment,
        lender: getRandomLender(),
      },
      under70: {
        adjustment: +(baseAdjustment + 0.05).toFixed(2), // Less favorable for higher LTV
        lender: getRandomLender(),
      },
      under75: {
        adjustment: +(baseAdjustment + 0.1).toFixed(2),
        lender: getRandomLender(),
      },
      under80: {
        adjustment: +(baseAdjustment + 0.15).toFixed(2),
        lender: getRandomLender(),
      },
      over80: {
        adjustment: +(baseAdjustment + 0.25).toFixed(2), // Significantly less favorable for rental >80%
        lender: getRandomLender(),
      },
      refinance: {
        under25: {
          adjustment: +(baseAdjustment + 0.1).toFixed(2),
          lender: getRandomLender(),
        },
        over25: {
          adjustment: +(baseAdjustment + 0.2).toFixed(2),
          lender: getRandomLender(),
        },
      },
    };
  });

  return ltvRates;
}

async function insertTodayRentalRates() {
  try {
    console.log("🔌 Connecting to database...");
    await connectToDatabase();

    // Check if rental rates already exist for today
    const existingRates = await RentalRate.findOne({
      createdAt: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999),
      },
    });

    if (existingRates) {
      console.log(
        "⚠️  Rental rates for today already exist. Updating existing record..."
      );
    }

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

    // Generate rental rate data for all provinces
    const rateData = {};

    provinces.forEach((province) => {
      rateData[province] = generateRealisticRentalRates();
      console.log(`🏠 Generated rental rates for ${province}`);
      console.log(
        `   3-Yr Fixed <65% LTV: ${rateData[province].threeYrFixed.under65.rate}% (${rateData[province].threeYrFixed.under65.lender})`
      );
      console.log(
        `   5-Yr Fixed <65% LTV: ${rateData[province].fiveYrFixed.under65.rate}% (${rateData[province].fiveYrFixed.under65.lender})`
      );
      console.log(
        `   5-Yr Fixed >80% LTV: ${rateData[province].fiveYrFixed.over80.rate}% (${rateData[province].fiveYrFixed.over80.lender})`
      );
      console.log(
        `   3-Yr Variable Adjustment: ${rateData[province].threeYrVariable.under65.adjustment}% (${rateData[province].threeYrVariable.under65.lender})`
      );
      console.log(
        `   5-Yr Variable Adjustment: ${rateData[province].fiveYrVariable.under65.adjustment}% (${rateData[province].fiveYrVariable.under65.lender})`
      );
      console.log(
        `   3-Yr Variable Adjustment: Prime ${
          rateData[province].threeYrVariable.under65.adjustment >= 0 ? "+" : ""
        }${rateData[province].threeYrVariable.under65.adjustment}% (${
          rateData[province].threeYrVariable.under65.lender
        })`
      );
      console.log(
        `   5-Yr Variable Adjustment: Prime ${
          rateData[province].fiveYrVariable.under65.adjustment >= 0 ? "+" : ""
        }${rateData[province].fiveYrVariable.under65.adjustment}% (${
          rateData[province].fiveYrVariable.under65.lender
        })`
      );
    });

    console.log(`🏦 Sample rental property rates generated successfully!`);

    // Insert or update rental rates
    let savedRates;
    if (existingRates) {
      savedRates = await RentalRate.findByIdAndUpdate(
        existingRates._id,
        rateData,
        {
          new: true,
        }
      );
      console.log("✅ Rental rates updated successfully!");
    } else {
      const newRates = new RentalRate(rateData);
      savedRates = await newRates.save();
      console.log("✅ New rental rates inserted successfully!");
    }

    console.log(
      `📅 Rental rates effective date: ${savedRates.createdAt.toLocaleDateString()}`
    );
    console.log(`🆔 Document ID: ${savedRates._id}`);

    // Display a summary
    console.log("\n📈 RENTAL PROPERTY RATE SUMMARY:");
    console.log("==================================");
    console.log("NOTE: Variable rates show adjustments to Prime Rate\n");

    provinces.forEach((province) => {
      console.log(`\n${province} Province (Rental Properties):`);

      console.log(`  3-Year Fixed:`);
      console.log(
        `    <65% LTV: ${savedRates[province].threeYrFixed.under65.rate}% (${savedRates[province].threeYrFixed.under65.lender})`
      );
      console.log(
        `    65-70% LTV: ${savedRates[province].threeYrFixed.under70.rate}% (${savedRates[province].threeYrFixed.under70.lender})`
      );
      console.log(
        `    70-75% LTV: ${savedRates[province].threeYrFixed.under75.rate}% (${savedRates[province].threeYrFixed.under75.lender})`
      );
      console.log(
        `    75-80% LTV: ${savedRates[province].threeYrFixed.under80.rate}% (${savedRates[province].threeYrFixed.under80.lender})`
      );
      console.log(
        `    >80% LTV: ${savedRates[province].threeYrFixed.over80.rate}% (${savedRates[province].threeYrFixed.over80.lender})`
      );
      console.log(
        `    Refinance <25yr: ${savedRates[province].threeYrFixed.refinance.under25.rate}% (${savedRates[province].threeYrFixed.refinance.under25.lender})`
      );
      console.log(
        `    Refinance >25yr: ${savedRates[province].threeYrFixed.refinance.over25.rate}% (${savedRates[province].threeYrFixed.refinance.over25.lender})`
      );

      console.log(
        `  3-Year Variable (Prime ${
          savedRates[province].threeYrVariable.under65.adjustment >= 0
            ? "+"
            : ""
        }${savedRates[province].threeYrVariable.under65.adjustment}%):`
      );
      console.log(
        `    <65% LTV: Prime ${
          savedRates[province].threeYrVariable.under65.adjustment >= 0
            ? "+"
            : ""
        }${savedRates[province].threeYrVariable.under65.adjustment}% (${
          savedRates[province].threeYrVariable.under65.lender
        })`
      );
      console.log(
        `    65-70% LTV: Prime ${
          savedRates[province].threeYrVariable.under70.adjustment >= 0
            ? "+"
            : ""
        }${savedRates[province].threeYrVariable.under70.adjustment}% (${
          savedRates[province].threeYrVariable.under70.lender
        })`
      );
      console.log(
        `    Refinance <25yr: Prime ${
          savedRates[province].threeYrVariable.refinance.under25.adjustment >= 0
            ? "+"
            : ""
        }${
          savedRates[province].threeYrVariable.refinance.under25.adjustment
        }% (${savedRates[province].threeYrVariable.refinance.under25.lender})`
      );
      console.log(
        `    Refinance >25yr: Prime ${
          savedRates[province].threeYrVariable.refinance.over25.adjustment >= 0
            ? "+"
            : ""
        }${
          savedRates[province].threeYrVariable.refinance.over25.adjustment
        }% (${savedRates[province].threeYrVariable.refinance.over25.lender})`
      );

      console.log(`  4-Year Fixed:`);
      console.log(
        `    <65% LTV: ${savedRates[province].fourYrFixed.under65.rate}% (${savedRates[province].fourYrFixed.under65.lender})`
      );
      console.log(
        `    >80% LTV: ${savedRates[province].fourYrFixed.over80.rate}% (${savedRates[province].fourYrFixed.over80.lender})`
      );
      console.log(
        `    Refinance <25yr: ${savedRates[province].fourYrFixed.refinance.under25.rate}% (${savedRates[province].fourYrFixed.refinance.under25.lender})`
      );
      console.log(
        `    Refinance >25yr: ${savedRates[province].fourYrFixed.refinance.over25.rate}% (${savedRates[province].fourYrFixed.refinance.over25.lender})`
      );

      console.log(`  5-Year Fixed:`);
      console.log(
        `    <65% LTV: ${savedRates[province].fiveYrFixed.under65.rate}% (${savedRates[province].fiveYrFixed.under65.lender})`
      );
      console.log(
        `    >80% LTV: ${savedRates[province].fiveYrFixed.over80.rate}% (${savedRates[province].fiveYrFixed.over80.lender})`
      );
      console.log(
        `    Refinance <25yr: ${savedRates[province].fiveYrFixed.refinance.under25.rate}% (${savedRates[province].fiveYrFixed.refinance.under25.lender})`
      );
      console.log(
        `    Refinance >25yr: ${savedRates[province].fiveYrFixed.refinance.over25.rate}% (${savedRates[province].fiveYrFixed.refinance.over25.lender})`
      );

      console.log(
        `  5-Year Variable (Prime ${
          savedRates[province].fiveYrVariable.under65.adjustment >= 0 ? "+" : ""
        }${savedRates[province].fiveYrVariable.under65.adjustment}%):`
      );
      console.log(
        `    <65% LTV: Prime ${
          savedRates[province].fiveYrVariable.under65.adjustment >= 0 ? "+" : ""
        }${savedRates[province].fiveYrVariable.under65.adjustment}% (${
          savedRates[province].fiveYrVariable.under65.lender
        })`
      );
      console.log(
        `    65-70% LTV: Prime ${
          savedRates[province].fiveYrVariable.under70.adjustment >= 0 ? "+" : ""
        }${savedRates[province].fiveYrVariable.under70.adjustment}% (${
          savedRates[province].fiveYrVariable.under70.lender
        })`
      );
      console.log(
        `    Refinance <25yr: Prime ${
          savedRates[province].fiveYrVariable.refinance.under25.adjustment >= 0
            ? "+"
            : ""
        }${
          savedRates[province].fiveYrVariable.refinance.under25.adjustment
        }% (${savedRates[province].fiveYrVariable.refinance.under25.lender})`
      );
      console.log(
        `    Refinance >25yr: Prime ${
          savedRates[province].fiveYrVariable.refinance.over25.adjustment >= 0
            ? "+"
            : ""
        }${savedRates[province].fiveYrVariable.refinance.over25.adjustment}% (${
          savedRates[province].fiveYrVariable.refinance.over25.lender
        })`
      );
    });

    console.log(
      "\n🏠 NOTE: These are rental property mortgage rates, typically 0.4-0.6% higher than owner-occupied rates"
    );
    console.log(
      "💰 Variable rates show less favorable adjustments compared to primary residence mortgages"
    );
  } catch (error) {
    console.error("❌ Error inserting rental rates:", error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
console.log("🚀 Starting rental rate insertion script...");
console.log(`📅 Today's date: ${new Date().toLocaleDateString()}`);
console.log("🏠 Generating rates for rental/investment properties...");
insertTodayRentalRates();
