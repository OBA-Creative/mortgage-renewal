import mongoose from "mongoose";

const lenderSchema = new mongoose.Schema(
  {
    lenderName: {
      type: String,
      required: [true, "Lender must have a name"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "Lenders",
    timestamps: true,
  }
);

const Lender = mongoose.models.Lender || mongoose.model("Lender", lenderSchema);

export default Lender;
