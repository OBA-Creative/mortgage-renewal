import dotenv from "dotenv";
import connectToDatabase from "../lib/db.js";
import Lender from "../models/lenderModel.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function updateAndExpandLenders() {
  try {
    console.log("🔌 Connecting to database...");
    await connectToDatabase();

    // First, update existing lenders with new fields
    console.log("🔧 Updating existing lenders...");

    const updates = [
      {
        name: "Royal Bank of Canada (RBC)",
        updates: {
          lenderName: "RBC",
          category: "bank",
          supportsRental: true,
          displayOrder: 2,
        },
      },
      {
        name: "Toronto-Dominion Bank (TD)",
        updates: {
          lenderName: "TD Bank",
          category: "bank",
          supportsRental: true,
          displayOrder: 1,
        },
      },
      {
        name: "Scotiabank",
        updates: { category: "bank", supportsRental: true, displayOrder: 4 },
      },
      {
        name: "Bank of Montreal (BMO)",
        updates: {
          lenderName: "BMO",
          category: "bank",
          supportsRental: true,
          displayOrder: 3,
        },
      },
      {
        name: "Canadian Imperial Bank of Commerce (CIBC)",
        updates: {
          lenderName: "CIBC",
          category: "bank",
          supportsRental: true,
          displayOrder: 5,
        },
      },
      {
        name: "National Bank of Canada",
        updates: {
          lenderName: "National Bank",
          category: "bank",
          supportsRental: true,
          displayOrder: 6,
        },
      },
      {
        name: "HSBC Canada",
        updates: {
          lenderName: "HSBC",
          category: "bank",
          supportsRental: true,
          displayOrder: 7,
        },
      },
    ];

    for (const update of updates) {
      const result = await Lender.updateOne(
        { lenderName: update.name },
        { $set: update.updates }
      );
      console.log(
        `✅ Updated ${update.name}: ${result.modifiedCount} documents`
      );
    }

    // Add missing lenders
    console.log("\n📦 Adding missing lenders...");

    const newLenders = [
      {
        lenderName: "Credit Union",
        category: "credit_union",
        supportsRental: true,
        displayOrder: 8,
        isActive: true,
      },
      {
        lenderName: "First National",
        category: "monoline",
        supportsRental: true,
        displayOrder: 9,
        isActive: true,
      },
      {
        lenderName: "MCAP",
        category: "monoline",
        supportsRental: true,
        displayOrder: 10,
        isActive: true,
      },
      {
        lenderName: "Dominion Lending",
        category: "monoline",
        supportsRental: true,
        displayOrder: 11,
        isActive: true,
      },
      {
        lenderName: "Alternative Lender",
        category: "alternative",
        supportsRental: true,
        displayOrder: 12,
        isActive: true,
      },
      {
        lenderName: "B2B Bank",
        category: "alternative",
        supportsRental: true,
        displayOrder: 13,
        isActive: true,
      },
      {
        lenderName: "CMLS",
        category: "monoline",
        supportsRental: true,
        displayOrder: 14,
        isActive: true,
      },
      {
        lenderName: "Equitable Bank",
        category: "alternative",
        supportsRental: true,
        displayOrder: 15,
        isActive: true,
      },
    ];

    for (const lender of newLenders) {
      const existing = await Lender.findOne({ lenderName: lender.lenderName });
      if (!existing) {
        const created = await Lender.create(lender);
        console.log(`✅ Added ${lender.lenderName} (${lender.category})`);
      } else {
        console.log(`⚠️  ${lender.lenderName} already exists, skipping`);
      }
    }

    // Display final summary
    console.log("\n📊 FINAL LENDERS SUMMARY:");
    console.log("=========================");

    const allLenders = await Lender.find({ isActive: true }).sort({
      displayOrder: 1,
    });
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

    console.log(`Total active lenders: ${allLenders.length}`);
    console.log(`Rental property lenders: ${rentalLenders}`);
    console.log(`Banks: ${bankCount}`);
    console.log(`Credit Unions: ${creditUnionCount}`);
    console.log(`Monolines: ${monolineCount}`);
    console.log(`Alternative: ${alternativeCount}`);

    console.log("\n🏦 COMPLETE LENDER LIST:");
    console.log("========================");
    allLenders.forEach((lender, index) => {
      const rentalIcon = lender.supportsRental ? "🏠" : "🏡";
      console.log(
        `${lender.displayOrder}. ${rentalIcon} ${lender.lenderName} (${lender.category})`
      );
    });
  } catch (error) {
    console.error("❌ Error updating lenders:", error);
  } finally {
    process.exit(0);
  }
}

updateAndExpandLenders();
