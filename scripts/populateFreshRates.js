import mongoose from "mongoose";
import Rate from "../models/ratesModel.js";

// Use the same MongoDB connection as the app
const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME || "obradovicu_db_user"}:${process.env.MONGODB_PASSWORD || "ft1nUcqDK9X4fuNg"}@cluster0.newjce6.mongodb.net/MortgageRenewals?retryWrites=true&w=majority&appName=Cluster0`;

// Sample rate data with nested rental structure (under25/over25)
const sampleRatesData = {
  // Prime rate (reference rate for variable calculations)
  prime: 6.45,

  // Alberta rates
  AB: {
    threeYrFixed: {
      under65: { rate: 3.65, lender: "RBC" },
      under70: { rate: 3.7, lender: "BMO" },
      under75: { rate: 3.75, lender: "First National" },
      under80: { rate: 3.8, lender: "TD Bank" },
      over80: { rate: 3.85, lender: "Scotiabank" },
      refinance: {
        under25: { rate: 2.5, lender: "First National" },
        over25: { rate: 3.0, lender: "BMO" },
      },
      rental: {
        under25: { rate: 4.15, lender: "Alternative Lender" },
        over25: { rate: 4.35, lender: "Alternative Lender" },
      },
    },
    fourYrFixed: {
      under65: { rate: 5.12, lender: "Alternative Lender" },
      under70: { rate: 5.22, lender: "BMO" },
      under75: { rate: 5.32, lender: "Credit Union" },
      under80: { rate: 5.42, lender: "Scotiabank" },
      over80: { rate: 5.52, lender: "Scotiabank" },
      refinance: {
        under25: { rate: 5.27, lender: "National Bank" },
        over25: { rate: 5.37, lender: "National Bank" },
      },
      rental: {
        under25: { rate: 5.82, lender: "TD Bank" },
        over25: { rate: 6.02, lender: "TD Bank" },
      },
    },
    fiveYrFixed: {
      under65: { rate: 4.93, lender: "TD Bank" },
      under70: { rate: 5.03, lender: "CIBC" },
      under75: { rate: 5.13, lender: "Dominion Lending" },
      under80: { rate: 5.23, lender: "BMO" },
      over80: { rate: 5.33, lender: "MCAP" },
      refinance: {
        under25: { rate: 5.08, lender: "Dominion Lending" },
        over25: { rate: 5.18, lender: "First National" },
      },
      rental: {
        under25: { rate: 5.63, lender: "Credit Union" },
        over25: { rate: 5.83, lender: "Credit Union" },
      },
    },
    threeYrVariable: {
      under65: { adjustment: -0.76, lender: "MCAP" },
      under70: { adjustment: -0.81, lender: "Credit Union" },
      under75: { adjustment: -0.86, lender: "Scotiabank" },
      under80: { adjustment: -0.91, lender: "First National" },
      over80: { adjustment: -0.96, lender: "First National" },
      refinance: {
        under25: { adjustment: -0.81, lender: "CIBC" },
        over25: { adjustment: -0.86, lender: "National Bank" },
      },
      rental: {
        under25: { adjustment: -0.26, lender: "RBC" },
        over25: { adjustment: -0.16, lender: "RBC" },
      },
    },
    fiveYrVariable: {
      under65: { adjustment: -0.84, lender: "Credit Union" },
      under70: { adjustment: -0.89, lender: "BMO" },
      under75: { adjustment: -0.94, lender: "National Bank" },
      under80: { adjustment: -0.99, lender: "BMO" },
      over80: { adjustment: -1.04, lender: "Dominion Lending" },
      refinance: {
        under25: { adjustment: -0.89, lender: "MCAP" },
        over25: { adjustment: -0.94, lender: "Scotiabank" },
      },
      rental: {
        under25: { adjustment: -0.34, lender: "MCAP" },
        over25: { adjustment: -0.24, lender: "MCAP" },
      },
    },
  },
};

// Function to create province data with slight variations
const createProvinceRates = (baseRates, provinceName) => {
  const variation = Math.random() * 0.2 - 0.1; // Random variation between -0.1 and +0.1

  const adjustRate = (rate) => Math.round((rate + variation) * 100) / 100;
  const adjustAdjustment = (adjustment) =>
    Math.round((adjustment + variation * 0.5) * 100) / 100;

  return {
    threeYrFixed: {
      under65: {
        rate: adjustRate(baseRates.threeYrFixed.under65.rate),
        lender: baseRates.threeYrFixed.under65.lender,
      },
      under70: {
        rate: adjustRate(baseRates.threeYrFixed.under70.rate),
        lender: baseRates.threeYrFixed.under70.lender,
      },
      under75: {
        rate: adjustRate(baseRates.threeYrFixed.under75.rate),
        lender: baseRates.threeYrFixed.under75.lender,
      },
      under80: {
        rate: adjustRate(baseRates.threeYrFixed.under80.rate),
        lender: baseRates.threeYrFixed.under80.lender,
      },
      over80: {
        rate: adjustRate(baseRates.threeYrFixed.over80.rate),
        lender: baseRates.threeYrFixed.over80.lender,
      },
      refinance: {
        under25: {
          rate: adjustRate(baseRates.threeYrFixed.refinance.under25.rate),
          lender: baseRates.threeYrFixed.refinance.under25.lender,
        },
        over25: {
          rate: adjustRate(baseRates.threeYrFixed.refinance.over25.rate),
          lender: baseRates.threeYrFixed.refinance.over25.lender,
        },
      },
      rental: {
        under25: {
          rate: adjustRate(baseRates.threeYrFixed.rental.under25.rate),
          lender: baseRates.threeYrFixed.rental.under25.lender,
        },
        over25: {
          rate: adjustRate(baseRates.threeYrFixed.rental.over25.rate),
          lender: baseRates.threeYrFixed.rental.over25.lender,
        },
      },
    },
    fourYrFixed: {
      under65: {
        rate: adjustRate(baseRates.fourYrFixed.under65.rate),
        lender: baseRates.fourYrFixed.under65.lender,
      },
      under70: {
        rate: adjustRate(baseRates.fourYrFixed.under70.rate),
        lender: baseRates.fourYrFixed.under70.lender,
      },
      under75: {
        rate: adjustRate(baseRates.fourYrFixed.under75.rate),
        lender: baseRates.fourYrFixed.under75.lender,
      },
      under80: {
        rate: adjustRate(baseRates.fourYrFixed.under80.rate),
        lender: baseRates.fourYrFixed.under80.lender,
      },
      over80: {
        rate: adjustRate(baseRates.fourYrFixed.over80.rate),
        lender: baseRates.fourYrFixed.over80.lender,
      },
      refinance: {
        under25: {
          rate: adjustRate(baseRates.fourYrFixed.refinance.under25.rate),
          lender: baseRates.fourYrFixed.refinance.under25.lender,
        },
        over25: {
          rate: adjustRate(baseRates.fourYrFixed.refinance.over25.rate),
          lender: baseRates.fourYrFixed.refinance.over25.lender,
        },
      },
      rental: {
        under25: {
          rate: adjustRate(baseRates.fourYrFixed.rental.under25.rate),
          lender: baseRates.fourYrFixed.rental.under25.lender,
        },
        over25: {
          rate: adjustRate(baseRates.fourYrFixed.rental.over25.rate),
          lender: baseRates.fourYrFixed.rental.over25.lender,
        },
      },
    },
    fiveYrFixed: {
      under65: {
        rate: adjustRate(baseRates.fiveYrFixed.under65.rate),
        lender: baseRates.fiveYrFixed.under65.lender,
      },
      under70: {
        rate: adjustRate(baseRates.fiveYrFixed.under70.rate),
        lender: baseRates.fiveYrFixed.under70.lender,
      },
      under75: {
        rate: adjustRate(baseRates.fiveYrFixed.under75.rate),
        lender: baseRates.fiveYrFixed.under75.lender,
      },
      under80: {
        rate: adjustRate(baseRates.fiveYrFixed.under80.rate),
        lender: baseRates.fiveYrFixed.under80.lender,
      },
      over80: {
        rate: adjustRate(baseRates.fiveYrFixed.over80.rate),
        lender: baseRates.fiveYrFixed.over80.lender,
      },
      refinance: {
        under25: {
          rate: adjustRate(baseRates.fiveYrFixed.refinance.under25.rate),
          lender: baseRates.fiveYrFixed.refinance.under25.lender,
        },
        over25: {
          rate: adjustRate(baseRates.fiveYrFixed.refinance.over25.rate),
          lender: baseRates.fiveYrFixed.refinance.over25.lender,
        },
      },
      rental: {
        under25: {
          rate: adjustRate(baseRates.fiveYrFixed.rental.under25.rate),
          lender: baseRates.fiveYrFixed.rental.under25.lender,
        },
        over25: {
          rate: adjustRate(baseRates.fiveYrFixed.rental.over25.rate),
          lender: baseRates.fiveYrFixed.rental.over25.lender,
        },
      },
    },
    threeYrVariable: {
      under65: {
        adjustment: adjustAdjustment(
          baseRates.threeYrVariable.under65.adjustment,
        ),
        lender: baseRates.threeYrVariable.under65.lender,
      },
      under70: {
        adjustment: adjustAdjustment(
          baseRates.threeYrVariable.under70.adjustment,
        ),
        lender: baseRates.threeYrVariable.under70.lender,
      },
      under75: {
        adjustment: adjustAdjustment(
          baseRates.threeYrVariable.under75.adjustment,
        ),
        lender: baseRates.threeYrVariable.under75.lender,
      },
      under80: {
        adjustment: adjustAdjustment(
          baseRates.threeYrVariable.under80.adjustment,
        ),
        lender: baseRates.threeYrVariable.under80.lender,
      },
      over80: {
        adjustment: adjustAdjustment(
          baseRates.threeYrVariable.over80.adjustment,
        ),
        lender: baseRates.threeYrVariable.over80.lender,
      },
      refinance: {
        under25: {
          adjustment: adjustAdjustment(
            baseRates.threeYrVariable.refinance.under25.adjustment,
          ),
          lender: baseRates.threeYrVariable.refinance.under25.lender,
        },
        over25: {
          adjustment: adjustAdjustment(
            baseRates.threeYrVariable.refinance.over25.adjustment,
          ),
          lender: baseRates.threeYrVariable.refinance.over25.lender,
        },
      },
      rental: {
        under25: {
          adjustment: adjustAdjustment(
            baseRates.threeYrVariable.rental.under25.adjustment,
          ),
          lender: baseRates.threeYrVariable.rental.under25.lender,
        },
        over25: {
          adjustment: adjustAdjustment(
            baseRates.threeYrVariable.rental.over25.adjustment,
          ),
          lender: baseRates.threeYrVariable.rental.over25.lender,
        },
      },
    },
    fiveYrVariable: {
      under65: {
        adjustment: adjustAdjustment(
          baseRates.fiveYrVariable.under65.adjustment,
        ),
        lender: baseRates.fiveYrVariable.under65.lender,
      },
      under70: {
        adjustment: adjustAdjustment(
          baseRates.fiveYrVariable.under70.adjustment,
        ),
        lender: baseRates.fiveYrVariable.under70.lender,
      },
      under75: {
        adjustment: adjustAdjustment(
          baseRates.fiveYrVariable.under75.adjustment,
        ),
        lender: baseRates.fiveYrVariable.under75.lender,
      },
      under80: {
        adjustment: adjustAdjustment(
          baseRates.fiveYrVariable.under80.adjustment,
        ),
        lender: baseRates.fiveYrVariable.under80.lender,
      },
      over80: {
        adjustment: adjustAdjustment(
          baseRates.fiveYrVariable.over80.adjustment,
        ),
        lender: baseRates.fiveYrVariable.over80.lender,
      },
      refinance: {
        under25: {
          adjustment: adjustAdjustment(
            baseRates.fiveYrVariable.refinance.under25.adjustment,
          ),
          lender: baseRates.fiveYrVariable.refinance.under25.lender,
        },
        over25: {
          adjustment: adjustAdjustment(
            baseRates.fiveYrVariable.refinance.over25.adjustment,
          ),
          lender: baseRates.fiveYrVariable.refinance.over25.lender,
        },
      },
      rental: {
        under25: {
          adjustment: adjustAdjustment(
            baseRates.fiveYrVariable.rental.under25.adjustment,
          ),
          lender: baseRates.fiveYrVariable.rental.under25.lender,
        },
        over25: {
          adjustment: adjustAdjustment(
            baseRates.fiveYrVariable.rental.over25.adjustment,
          ),
          lender: baseRates.fiveYrVariable.rental.over25.lender,
        },
      },
    },
  };
};

async function populateRates() {
  try {
    console.log("🚀 Starting fresh rates population...");
    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas successfully");

    // Clear existing rates
    console.log("Clearing existing rates...");
    await Rate.deleteMany({});
    console.log("✅ Cleared existing data");

    // Create complete rates document with all provinces
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
    const completeRatesData = {
      prime: sampleRatesData.prime,
    };

    console.log("Generating rates for all provinces...");
    for (const province of provinces) {
      if (province === "AB") {
        // Use base data for Alberta
        completeRatesData[province] = sampleRatesData.AB;
      } else {
        // Create variations for other provinces
        completeRatesData[province] = createProvinceRates(
          sampleRatesData.AB,
          province,
        );
      }
      console.log(`✅ Generated rates for ${province}`);
    }

    // Insert the complete rates document
    console.log("Inserting rates into database...");
    const newRates = new Rate(completeRatesData);
    const savedRates = await newRates.save();

    console.log("✅ Successfully populated database with fresh rates!");
    console.log(`Document ID: ${savedRates._id}`);

    // Verify the data
    console.log("\n📊 Verification - Sample rental rates:");
    console.log("AB Fixed Rental Rates:");
    console.log(
      `  3-Year ≤25yr: ${savedRates.AB.threeYrFixed.rental.under25.rate}% (${savedRates.AB.threeYrFixed.rental.under25.lender})`,
    );
    console.log(
      `  3-Year >25yr: ${savedRates.AB.threeYrFixed.rental.over25.rate}% (${savedRates.AB.threeYrFixed.rental.over25.lender})`,
    );
    console.log(
      `  4-Year ≤25yr: ${savedRates.AB.fourYrFixed.rental.under25.rate}% (${savedRates.AB.fourYrFixed.rental.under25.lender})`,
    );
    console.log(
      `  5-Year ≤25yr: ${savedRates.AB.fiveYrFixed.rental.under25.rate}% (${savedRates.AB.fiveYrFixed.rental.under25.lender})`,
    );

    console.log("AB Variable Rental Rates:");
    console.log(
      `  3-Year ≤25yr: Prime ${savedRates.AB.threeYrVariable.rental.under25.adjustment >= 0 ? "+" : ""}${savedRates.AB.threeYrVariable.rental.under25.adjustment}% (${savedRates.AB.threeYrVariable.rental.under25.lender})`,
    );
    console.log(
      `  5-Year ≤25yr: Prime ${savedRates.AB.fiveYrVariable.rental.under25.adjustment >= 0 ? "+" : ""}${savedRates.AB.fiveYrVariable.rental.under25.adjustment}% (${savedRates.AB.fiveYrVariable.rental.under25.lender})`,
    );

    console.log(`\n✨ All ${provinces.length} provinces populated with rates!`);
  } catch (error) {
    console.error("❌ Failed to populate rates:", error);
    console.error("Error stack:", error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the population script
populateRates();
