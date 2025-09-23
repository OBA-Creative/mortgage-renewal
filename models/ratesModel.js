import mongoose from "mongoose";

// Helper function to round numbers to 2 decimal places
const roundToTwoDecimals = (value) => {
  if (value == null) return value;
  return Math.round(parseFloat(value) * 100) / 100;
};

// Define a rate-lender pair schema
const rateLenderSchema = new mongoose.Schema(
  {
    rate: {
      type: Number,
      set: roundToTwoDecimals,
      get: roundToTwoDecimals,
      required: true,
    },
    lender: {
      type: String,
      default: "Default Lender",
      required: true,
    },
  },
  { _id: false }
);

// Define a variable rate adjustment schema (stores percentage to add/subtract from prime)
const variableRateSchema = new mongoose.Schema(
  {
    adjustment: {
      type: Number,
      set: roundToTwoDecimals,
      get: roundToTwoDecimals,
      required: true,
      // Can be positive (premium) or negative (discount)
      // Example: -0.8 means Prime - 0.8%, +0.2 means Prime + 0.2%
    },
    lender: {
      type: String,
      default: "Default Lender",
      required: true,
    },
  },
  { _id: false }
);

// Define refinance structure for fixed rates
const refinanceSchema = new mongoose.Schema(
  {
    under25: rateLenderSchema,
    over25: rateLenderSchema,
  },
  { _id: false }
);

// Define refinance structure for variable rates (using adjustments)
const variableRefinanceSchema = new mongoose.Schema(
  {
    under25: variableRateSchema,
    over25: variableRateSchema,
  },
  { _id: false }
);

// Define LTV structure for fixed rates
const ltvRateSchema = new mongoose.Schema(
  {
    under65: rateLenderSchema,
    under70: rateLenderSchema,
    under75: rateLenderSchema,
    under80: rateLenderSchema,
    over80: rateLenderSchema,
    refinance: refinanceSchema,
  },
  { _id: false }
);

// Define LTV structure for variable rates (using prime adjustments)
const variableLtvSchema = new mongoose.Schema(
  {
    under65: variableRateSchema,
    under70: variableRateSchema,
    under75: variableRateSchema,
    under80: variableRateSchema,
    over80: variableRateSchema,
    refinance: variableRefinanceSchema,
  },
  { _id: false }
);

// Define province structure
const provinceSchema = new mongoose.Schema(
  {
    threeYrFixed: ltvRateSchema,
    fourYrFixed: ltvRateSchema,
    fiveYrFixed: ltvRateSchema,
    threeYrVariable: variableLtvSchema, // Stores adjustments to prime
    fiveYrVariable: variableLtvSchema, // Stores adjustments to prime
  },
  { _id: false }
);

const rateSchema = new mongoose.Schema(
  {
    // Alberta
    AB: provinceSchema,
    // British Columbia
    BC: provinceSchema,
    // Manitoba
    MB: provinceSchema,
    // New Brunswick
    NB: provinceSchema,
    // Newfoundland and Labrador
    NL: provinceSchema,
    // Nova Scotia
    NS: provinceSchema,
    // Northwest Territories
    NT: provinceSchema,
    // Nunavut
    NU: provinceSchema,
    // Ontario
    ON: provinceSchema,
    // Prince Edward Island
    PE: provinceSchema,
    // Quebec
    QC: provinceSchema,
    // Saskatchewan
    SK: provinceSchema,
    // Yukon Territory
    YT: provinceSchema,
    // Prime Rate (for reference, not tied to any lender)
    prime: {
      type: Number,
      set: roundToTwoDecimals,
      get: roundToTwoDecimals,
      required: true,
    },
  },
  {
    collection: "Rates",
    timestamps: true,
  }
);

const Rate = mongoose.models.Rate || mongoose.model("Rate", rateSchema);

export default Rate;
