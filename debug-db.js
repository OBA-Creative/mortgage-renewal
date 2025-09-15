const mongoose = require("mongoose");

// Define schema inline
const rateField = {
  type: Number,
  set: (value) => {
    if (value == null) return value;
    return Math.round(parseFloat(value) * 100) / 100;
  },
  get: (value) => {
    if (value == null) return value;
    return Math.round(parseFloat(value) * 100) / 100;
  },
};

const lenderField = {
  type: String,
  default: "Default Lender",
};

const ltvRateStructure = {
  under65: { rate: rateField, lender: lenderField },
  under70: { rate: rateField, lender: lenderField },
  under75: { rate: rateField, lender: lenderField },
  under80: { rate: rateField, lender: lenderField },
  over80: { rate: rateField, lender: lenderField },
  refinance: {
    under25: { rate: rateField, lender: lenderField },
    over25: { rate: rateField, lender: lenderField },
  },
};

const rateSchema = new mongoose.Schema(
  {
    AB: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
    BC: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
    MB: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
    NB: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
    NL: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
    NS: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
    NT: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
    NU: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
    ON: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
    PE: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
    QC: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
    SK: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
    YT: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      prime: { rate: rateField, lender: lenderField },
    },
  },
  {
    collection: "Rates",
    timestamps: true,
  }
);

const Rate = mongoose.models.Rate || mongoose.model("Rate", rateSchema);

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mortgage-renewals";

async function debugDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get the latest rates document
    const latestRates = await Rate.findOne().sort({ createdAt: -1 });

    if (!latestRates) {
      console.log("No rates found in database");
      return;
    }

    console.log("Latest rates document structure:");
    console.log("Document ID:", latestRates._id);
    console.log("Created At:", latestRates.createdAt);

    // Check specific province data
    console.log("\n--- Ontario (ON) Data ---");
    console.log("ON object:", JSON.stringify(latestRates.ON, null, 2));

    console.log("\n--- ON threeYrFixed Data ---");
    console.log(
      "threeYrFixed:",
      JSON.stringify(latestRates.ON?.threeYrFixed, null, 2)
    );

    console.log("\n--- ON prime Data ---");
    console.log("prime:", JSON.stringify(latestRates.ON?.prime, null, 2));

    // Check all province codes available
    const provinceKeys = Object.keys(latestRates.toObject()).filter(
      (key) => !["_id", "__v", "createdAt", "updatedAt"].includes(key)
    );
    console.log("\nAvailable province codes:", provinceKeys);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

debugDatabase();
