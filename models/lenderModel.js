import mongoose from "mongoose";

const lenderSchema = new mongoose.Schema(
  {
    lenderName: {
      type: String,
      required: [true, "Lender must have a name"],
      trim: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: ["bank", "credit_union", "alternative", "monoline", "other"],
      default: "other",
    },
    supportsRental: {
      type: Boolean,
      default: false, // Whether this lender offers rental property mortgages
    },
    displayOrder: {
      type: Number,
      default: 0, // For ordering in dropdowns
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    collection: "Lenders",
    timestamps: true,
  }
);

// Index for faster queries
lenderSchema.index({ isActive: 1, displayOrder: 1 });
lenderSchema.index({ supportsRental: 1, isActive: 1 });

const Lender = mongoose.models.Lender || mongoose.model("Lender", lenderSchema);

export default Lender;
