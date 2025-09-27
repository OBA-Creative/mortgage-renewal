import dotenv from "dotenv";
import connectToDatabase from "../lib/db.js";
import Lender from "../models/lenderModel.js";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Initial lenders to load into the database
const initialLenders = [
  "Royal Bank of Canada (RBC)",
  "Toronto-Dominion Bank (TD)",
  "Scotiabank",
  "Bank of Montreal (BMO)",
  "Canadian Imperial Bank of Commerce (CIBC)",
  "National Bank of Canada",
  "HSBC Canada",
  // Note: "Other" is not included as it's a UI option, not a real lender
];

async function insertInitialLenders() {
  try {
    // Connect to database
    console.log("🔌 Connecting to database...");
    await connectToDatabase();
    console.log("✅ Database connected successfully!");

    // Check if lenders already exist
    const existingLendersCount = await Lender.countDocuments();
    if (existingLendersCount > 0) {
      console.log(
        `⚠️  Database already contains ${existingLendersCount} lenders.`
      );
      console.log(
        "Do you want to continue and add/update lenders? (This will skip duplicates)"
      );
    }

    console.log("🏦 Starting lender insertion...");

    let insertedCount = 0;
    let skippedCount = 0;

    for (const lenderName of initialLenders) {
      try {
        // Check if lender already exists (case-insensitive)
        const existingLender = await Lender.findOne({
          lenderName: { $regex: new RegExp(`^${lenderName}$`, "i") },
        });

        if (existingLender) {
          console.log(`⏭️  Skipped: ${lenderName} (already exists)`);
          skippedCount++;
          continue;
        }

        // Create new lender
        const lender = new Lender({
          lenderName,
          isActive: true,
        });

        await lender.save();
        console.log(`✅ Inserted: ${lenderName}`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Error inserting ${lenderName}:`, error.message);
      }
    }

    console.log("\n🎉 Lender insertion completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Inserted: ${insertedCount} lenders`);
    console.log(`   - Skipped: ${skippedCount} lenders`);
    console.log(`   - Total in DB: ${await Lender.countDocuments()} lenders`);

    // Display all lenders in database
    console.log("\n📋 Current lenders in database:");
    const allLenders = await Lender.find({}).sort({ lenderName: 1 });
    allLenders.forEach((lender, index) => {
      const status = lender.isActive ? "✅ Active" : "❌ Inactive";
      console.log(`   ${index + 1}. ${lender.lenderName} - ${status}`);
    });
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  } finally {
    // Close the connection
    console.log("\n🔌 Closing database connection...");
    process.exit(0);
  }
}

// Run the script
console.log("🚀 Starting Initial Lenders Setup Script");
console.log("==========================================\n");
insertInitialLenders();
