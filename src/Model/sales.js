const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" },
  clientId: [{ type: mongoose.Schema.Types.ObjectId, ref: "client" }],
  serviceId: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "businessService" },
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: "promotion" }
  }],
  packagesId: [{ type: mongoose.Schema.Types.ObjectId, ref: "packages" }],
  membershipId: [{ type: mongoose.Schema.Types.ObjectId, ref: "membership" }],
  totalServiceAmount: String,
  totalpackageAmount: String,
  totalMembershipAmount: String,
  discount: String,
  discountType: {
    type: String,
    enum: ['percentage', 'fixed']
  },
  grossAmount: String,
  netAmount: String,
  createdBy: String,
  updatedBy: String,
  status: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
},
  { timestamps: true }
)

module.exports = mongoose.model("sales", salesSchema);    