import dotenv from "dotenv";
import connectToDatabase from "../lib/db.js";
import Rate from "../models/ratesModel.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Generate realistic mortgage rates with LTV adjustments and lender info
function generateRealisticRates() {
  const baseRate = 5.0; // Base rate around 5%
  const variableDiscount = 0.5; // Variable rates typically lower than fixed

  // Sample lenders for variety
  const lenders = [
    "TD Bank",
    "RBC",
    "BMO",
    "Scotiabank",
    "CIBC",
    "National Bank",
    "Credit Union",
    "Alternative Lender",
  ];

  // Generate base rates for each term
  const baseRates = {
    threeYrFixed: +(baseRate + Math.random() * 0.6 - 0.3).toFixed(2),
    fourYrFixed: +(baseRate + Math.random() * 0.4 - 0.2).toFixed(2),
    fiveYrFixed: +(baseRate + Math.random() * 0.3 - 0.15).toFixed(2),
  };

  // Create LTV structure for each rate type
  const ltvRates = {};

  Object.keys(baseRates).forEach((rateType) => {
    const base = baseRates[rateType];
    ltvRates[rateType] = {
      under65: {
        rate: +(base + 0.0).toFixed(2),
        lender: lenders[Math.floor(Math.random() * lenders.length)],
      },
      under70: {
        rate: +(base + 0.1).toFixed(2),
        lender: lenders[Math.floor(Math.random() * lenders.length)],
      },
      under75: {
        rate: +(base + 0.2).toFixed(2),
        lender: lenders[Math.floor(Math.random() * lenders.length)],
      },
      under80: {
        rate: +(base + 0.3).toFixed(2),
        lender: lenders[Math.floor(Math.random() * lenders.length)],
      },
      over80: {
        rate: +(base + 0.4).toFixed(2),
        lender: lenders[Math.floor(Math.random() * lenders.length)],
      },
      refinance: {
        under25: {
          rate: +(base + 0.15).toFixed(2),
          lender: lenders[Math.floor(Math.random() * lenders.length)],
        },
        over25: {
          rate: +(base + 0.25).toFixed(2),
          lender: lenders[Math.floor(Math.random() * lenders.length)],
        },
      },
    };
  });

  // Add prime rate with lender (separate from LTV structure)
  ltvRates.prime = {
    rate: +(6.5 + Math.random() * 0.5 - 0.25).toFixed(2),
    lender: lenders[Math.floor(Math.random() * lenders.length)],
  };

  return ltvRates;
}

async function insertTodaysRates() {
  try {
    console.log("🔌 Connecting to database...");
    await connectToDatabase();

    // Check if rates already exist for today
    const existingRates = await Rate.findOne({
      createdAt: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999),
      },
    });

    if (existingRates) {
      console.log(
        "⚠️  Rates for today already exist. Updating existing record..."
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

    // Generate rate data for all provinces
    const rateData = {};

    provinces.forEach((province) => {
      rateData[province] = generateRealisticRates();
      console.log(`📊 Generated rates for ${province}`);
      console.log(
        `   5-Yr Fixed <65% LTV: ${rateData[province].fiveYrFixed.under65.rate}% (${rateData[province].fiveYrFixed.under65.lender})`
      );
      console.log(
        `   5-Yr Fixed >80% LTV: ${rateData[province].fiveYrFixed.over80.rate}% (${rateData[province].fiveYrFixed.over80.lender})`
      );
      console.log(
        `   Prime Rate: ${rateData[province].prime.rate}% (${rateData[province].prime.lender})`
      );
    });

    console.log(`🏦 Sample province rates generated successfully!`);

    // Insert or update rates
    let savedRates;
    if (existingRates) {
      savedRates = await Rate.findByIdAndUpdate(existingRates._id, rateData, {
        new: true,
      });
      console.log("✅ Rates updated successfully!");
    } else {
      const newRates = new Rate(rateData);
      savedRates = await newRates.save();
      console.log("✅ New rates inserted successfully!");
    }

    console.log(
      `📅 Rates effective date: ${savedRates.createdAt.toLocaleDateString()}`
    );
    console.log(`🆔 Document ID: ${savedRates._id}`);

    // Display a summary
    console.log("\n📈 RATE SUMMARY:");
    console.log("================");
    provinces.forEach((province) => {
      console.log(`\n${province} Province:`);
      console.log(
        `  Prime Rate: ${savedRates[province].prime.rate}% (${savedRates[province].prime.lender})`
      );

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
    });
  } catch (error) {
    console.error("❌ Error inserting rates:", error.message);
  } finally {
    process.exit(0);
  }
}

// Run the script
console.log("🚀 Starting rate insertion script...");
console.log(`📅 Today's date: ${new Date().toLocaleDateString()}`);
insertTodaysRates();
