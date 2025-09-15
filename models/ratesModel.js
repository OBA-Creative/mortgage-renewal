import mongoose from "mongoose";

// Helper function to round numbers to 2 decimal places
const roundToTwoDecimals = (value) => {
  if (value == null) return value;
  return Math.round(parseFloat(value) * 100) / 100;
};

// Define a rate-lender pair schema
const rateLenderSchema = new mongoose.Schema({
  rate: {
    type: Number,
    set: roundToTwoDecimals,
    get: roundToTwoDecimals,
    required: true
  },
  lender: {
    type: String,
    default: "Default Lender",
    required: true
  }
}, { _id: false });

// Define refinance structure
const refinanceSchema = new mongoose.Schema({
  under25: rateLenderSchema,
  over25: rateLenderSchema,
}, { _id: false });

// Define LTV structure with refinance
const ltvRateSchema = new mongoose.Schema({
  under65: rateLenderSchema,
  under70: rateLenderSchema,
  under75: rateLenderSchema,
  under80: rateLenderSchema,
  over80: rateLenderSchema,
  refinance: refinanceSchema,
}, { _id: false });

// Define province structure
const provinceSchema = new mongoose.Schema({
  threeYrFixed: ltvRateSchema,
  fourYrFixed: ltvRateSchema,
  fiveYrFixed: ltvRateSchema,
  prime: rateLenderSchema,
}, { _id: false });

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
  },
  {
    collection: "Rates",
    timestamps: true,
  }
);

const Rate = mongoose.models.Rate || mongoose.model("Rate", rateSchema);

export default Rate;
