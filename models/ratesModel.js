import mongoose from "mongoose";

// Helper function to round numbers to 2 decimal places
const roundToTwoDecimals = (value) => {
  if (value == null) return value;
  return Math.round(parseFloat(value) * 100) / 100;
};

// Reusable rate field definition with 2 decimal place formatting
const rateField = {
  type: Number,
  set: roundToTwoDecimals,
  get: roundToTwoDecimals,
};

// Reusable LTV rate structure
const ltvRateStructure = {
  under65: rateField,
  under70: rateField,
  under75: rateField,
  under80: rateField,
  over80: rateField,
  refinance: rateField,
};

const rateSchema = new mongoose.Schema(
  {
    // Alberta
    AB: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },
    // British Columbia
    BC: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },
    // Manitoba
    MB: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },
    // New Brunswick
    NB: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },
    // Newfoundland and Labrador
    NL: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },
    // Nova Scotia
    NS: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },
    // Northwest Territories
    NT: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },
    // Nunavut
    NU: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },
    // Ontario
    ON: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },
    // Prince Edward Island
    PE: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },
    // Quebec
    QC: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },
    // Saskatchewan
    SK: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },
    // Yukon Territory
    YT: {
      threeYrFixed: ltvRateStructure,
      fourYrFixed: ltvRateStructure,
      fiveYrFixed: ltvRateStructure,
      threeYrVariable: ltvRateStructure,
      fiveYrVariable: ltvRateStructure,
    },

    prime: rateField,
  },
  {
    collection: "Rates",
    timestamps: true,
  }
);

const Rate = mongoose.models.Rate || mongoose.model("Rate", rateSchema);

export default Rate;
