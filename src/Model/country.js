const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" },
    countryName: String,
    countrycode: String,
    dialCode: String,
    countryCurrency: String,
    countryTaxRate: String,
    status: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: String,
    updatedBy: String,
  },
  { timestamps: true }
);
module.exports = mongoose.model("country", countrySchema);