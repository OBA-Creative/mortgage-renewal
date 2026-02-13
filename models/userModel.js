import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      enum: ["renew", "refinance", ""],
      default: "",
    },
    propertyUsage: {
      type: String,
      default: "",
    },
    downpaymentValue: {
      type: String,
      default: "",
    },
    heloc: {
      type: String,
      default: "",
    },
    helocBalance: {
      type: Number,
      default: null,
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    province: {
      type: String,
      trim: true,
      default: "",
    },
    propertyValue: {
      type: Number,
      default: null,
    },
    belowOneMillion: {
      type: String,
      default: "",
    },
    mortgageBalance: {
      type: Number,
      default: null,
    },
    borrowAdditionalFunds: {
      type: String,
      default: "",
    },
    borrowAdditionalAmount: {
      type: Number,
      default: null,
    },
    amortizationPeriod: {
      type: Number,
      default: null,
    },
    lender: {
      type: String,
      trim: true,
      default: "",
    },
    otherLender: {
      type: String,
      trim: true,
      default: "",
    },
    maturityDate: {
      type: String,
      default: "",
    },
    firstName: {
      type: String,
      trim: true,
      required: [true, "User must have a first name"],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "User must have a last name"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      required: [true, "User must have an email"],
      lowercase: true,
    },
    selectedRate: {
      term: {
        type: String,
        default: "",
      },
      percentage: {
        type: Number,
        default: null,
      },
      monthlyPayment: {
        type: Number,
        default: null,
      },
      lender: {
        type: String,
        default: "",
      },
    },
    isHighlighted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "Users",
    timestamps: true,
  },
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
