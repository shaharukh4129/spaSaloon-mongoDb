const mongoose = require("mongoose");

const businessService = new mongoose.Schema({
  businessCatagoryId: { type: mongoose.Schema.Types.ObjectId, ref: "businessCatagory" },
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
  serviceCatagoryId: { type: mongoose.Schema.Types.ObjectId, ref: "serviceCatagory" },
  amenitiesId: [ { type: mongoose.Schema.Types.ObjectId, ref: "amenities" } ],
  branchId: [ { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" } ],
  status: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdBy: String,
  updatedBy: String,
  isServiceGlobal: Boolean,
  serviceName: String,
  serviceCategory: String,
  serviceDescription: String,
  serviceAvilableFor: String,
  ServiceAftercareDescription: String,
  serviceIdNo: { type: String },
  serviceTag: Array,
},
  { timestamps: true }
);

const service = mongoose.model("businessService", businessService);
module.exports = service;