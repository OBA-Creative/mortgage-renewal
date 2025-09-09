import dotenv from "dotenv";
import connectToDatabase from "../lib/db.js";
import Rate from "../models/ratesModel.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Generate realistic mortgage rates with LTV adjustments (in percentages)
function generateRealisticRates() {
  const baseRate = 5.0; // Base rate around 5%
  const variableDiscount = 0.5; // Variable rates typically lower than fixed

  // Generate base rates for each term
  const baseRates = {
    threeYrFixed: +(baseRate + Math.random() * 0.6 - 0.3).toFixed(2),
    fourYrFixed: +(baseRate + Math.random() * 0.4 - 0.2).toFixed(2),
    fiveYrFixed: +(baseRate + Math.random() * 0.3 - 0.15).toFixed(2),
    threeYrVariable: +(
      baseRate -
      variableDiscount +
      Math.random() * 0.4 -
      0.2
    ).toFixed(2),
    fiveYrVariable: +(
      baseRate -
      variableDiscount +
      Math.random() * 0.3 -
      0.15
    ).toFixed(2),
  };

  // Create LTV structure for each rate type
  const ltvRates = {};

  Object.keys(baseRates).forEach((rateType) => {
    const base = baseRates[rateType];
    ltvRates[rateType] = {
      under65: +(base + 0.0).toFixed(2), // Best rate for lowest LTV
      under70: +(base + 0.1).toFixed(2), // Small premium
      under75: +(base + 0.2).toFixed(2), // Medium premium
      under80: +(base + 0.3).toFixed(2), // Higher premium
      over80: +(base + 0.4).toFixed(2), // Highest premium for high LTV
      refinance: +(base + 0.15).toFixed(2), // Special refinance rate (between under70 and under75)
    };
  });

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
      console.log(`📊 Generated LTV rates for ${province}`);
      console.log(
        `   5-Yr Fixed: ${rateData[province].fiveYrFixed.under65}% (best) to ${rateData[province].fiveYrFixed.over80}% (high LTV)`
      );
    });

    // Add prime rate
    rateData.prime = +(6.5 + Math.random() * 0.5 - 0.25).toFixed(2);
    console.log(`🏦 Prime rate: ${rateData.prime}%`);

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
      console.log(`  3-Year Fixed:`);
      console.log(
        `    <65% LTV: ${savedRates[province].threeYrFixed.under65}%`
      );
      console.log(
        `    65-70% LTV: ${savedRates[province].threeYrFixed.under70}%`
      );
      console.log(
        `    70-75% LTV: ${savedRates[province].threeYrFixed.under75}%`
      );
      console.log(
        `    75-80% LTV: ${savedRates[province].threeYrFixed.under80}%`
      );
      console.log(`    >80% LTV: ${savedRates[province].threeYrFixed.over80}%`);
      console.log(
        `    Refinance: ${savedRates[province].threeYrFixed.refinance}%`
      );

      console.log(`  5-Year Fixed:`);
      console.log(`    <65% LTV: ${savedRates[province].fiveYrFixed.under65}%`);
      console.log(`    >80% LTV: ${savedRates[province].fiveYrFixed.over80}%`);
      console.log(
        `    Refinance: ${savedRates[province].fiveYrFixed.refinance}%`
      );

      console.log(`  Variable Rates:`);
      console.log(
        `    3-Yr <65% LTV: ${savedRates[province].threeYrVariable.under65}%`
      );
      console.log(
        `    5-Yr >80% LTV: ${savedRates[province].fiveYrVariable.over80}%`
      );
      console.log(
        `    5-Yr Refinance: ${savedRates[province].fiveYrVariable.refinance}%`
      );
    });
    console.log(`\nPrime Rate: ${savedRates.prime}%`);
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
