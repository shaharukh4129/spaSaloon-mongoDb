const mongoose = require("mongoose");

const businessPrice = new mongoose.Schema({
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "businessService" },
  serviceCatagoryId: { type: mongoose.Schema.Types.ObjectId, ref: "serviceCatagory" },
  branchId: [{ type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" }],
  status: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdBy: String,
  updatedBy: String,
  serviceProvider: [{ type: mongoose.Schema.Types.ObjectId, ref: "teamMember" }],
  // priceType: {
  //   type: String,
  //   enum: ['fixed', 'complementary']
  // },
  duration: String,
  seasonType: {
    type: String,
    enum: ['introductionPrice', 'memberPrice', 'regularPrice', 'offPeakPrice', 'complementaryPrice']
  },
  seasonPrice: String,
},
  { timestamps: true }
);

const service = mongoose.model("businessPrice", businessPrice);
module.exports = service;