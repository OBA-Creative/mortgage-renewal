import dotenv from "dotenv";
import connectToDatabase from "../lib/db.js";
import Lender from "../models/lenderModel.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function initializeLenders() {
  try {
    console.log("🔌 Connecting to database...");
    await connectToDatabase();

    // Check if lenders already exist
    const existingLenders = await Lender.countDocuments();
    if (existingLenders > 0) {
      console.log(
        `⚠️  Found ${existingLenders} existing lenders. Skipping initialization.`
      );
      console.log(
        "If you want to reset, please clear the Lenders collection first."
      );
      return;
    }

    console.log("🏦 Initializing lenders collection...");

    // Base lenders (support regular mortgages)
    const baseLenders = [
      { lenderName: "TD Bank", category: "bank", displayOrder: 1 },
      { lenderName: "RBC", category: "bank", displayOrder: 2 },
      { lenderName: "BMO", category: "bank", displayOrder: 3 },
      { lenderName: "Scotiabank", category: "bank", displayOrder: 4 },
      { lenderName: "CIBC", category: "bank", displayOrder: 5 },
      { lenderName: "National Bank", category: "bank", displayOrder: 6 },
      { lenderName: "Credit Union", category: "credit_union", displayOrder: 7 },
      { lenderName: "First National", category: "monoline", displayOrder: 8 },
      { lenderName: "MCAP", category: "monoline", displayOrder: 9 },
      {
        lenderName: "Dominion Lending",
        category: "monoline",
        displayOrder: 10,
      },
      {
        lenderName: "Alternative Lender",
        category: "alternative",
        displayOrder: 11,
      },
    ];

    // Additional lenders that specialize in or offer rental properties
    const rentalOnlyLenders = [
      {
        lenderName: "B2B Bank",
        category: "alternative",
        displayOrder: 12,
        supportsRental: true,
      },
      {
        lenderName: "CMLS",
        category: "monoline",
        displayOrder: 13,
        supportsRental: true,
      },
      {
        lenderName: "Equitable Bank",
        category: "alternative",
        displayOrder: 14,
        supportsRental: true,
      },
    ];

    // Mark all base lenders as supporting rental properties too
    const allLenders = [
      ...baseLenders.map((lender) => ({ ...lender, supportsRental: true })),
      ...rentalOnlyLenders,
    ];

    console.log(`📊 Inserting ${allLenders.length} lenders...`);

    const insertedLenders = await Lender.insertMany(allLenders);
    console.log(`✅ Successfully inserted ${insertedLenders.length} lenders!`);

    // Display summary
    const activeLenders = await Lender.countDocuments({ isActive: true });
    const rentalLenders = await Lender.countDocuments({
      isActive: true,
      supportsRental: true,
    });
    const bankCount = await Lender.countDocuments({
      isActive: true,
      category: "bank",
    });
    const creditUnionCount = await Lender.countDocuments({
      isActive: true,
      category: "credit_union",
    });
    const monolineCount = await Lender.countDocuments({
      isActive: true,
      category: "monoline",
    });
    const alternativeCount = await Lender.countDocuments({
      isActive: true,
      category: "alternative",
    });

    console.log("\n📈 LENDERS SUMMARY:");
    console.log("==================");
    console.log(`Total active lenders: ${activeLenders}`);
    console.log(`Rental property lenders: ${rentalLenders}`);
    console.log(`Banks: ${bankCount}`);
    console.log(`Credit Unions: ${creditUnionCount}`);
    console.log(`Monolines: ${monolineCount}`);
    console.log(`Alternative: ${alternativeCount}`);

    console.log("\n🏦 LENDER LIST:");
    console.log("===============");
    const lendersList = await Lender.find({ isActive: true }).sort({
      displayOrder: 1,
    });
    lendersList.forEach((lender, index) => {
      const rentalIcon = lender.supportsRental ? "🏠" : "🏡";
      console.log(
        `${index + 1}. ${rentalIcon} ${lender.lenderName} (${lender.category})`
      );
    });
  } catch (error) {
    console.error("❌ Error initializing lenders:", error);
  } finally {
    process.exit(0);
  }
}

initializeLenders();
