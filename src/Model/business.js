const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "businessUser" },
    businessCatagoryId: [{ type: mongoose.Schema.Types.ObjectId, ref: "businessCatagory" }],
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
    stepCompleted: Number,
    businessName: String,
    profileImage: String,
    businessAccountNo: { type: String },
    counter: { type: String },
    businessURL: String,
    businessCategory: String,
    businessType: String,
    mobile: String,
    email: String,
    country: String,
    countryCode: String,
    dialCode: String,
    website: String,
    instagram: String,
    facebook: String,
    about: String,
    image: Array,
    taxRate: String,
    employeeIdPrefix: String,
    teamCount: { type: Number, default: 0 },
    clientCount: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: String,
    updatedBy: String,
    originalAssignServiceArray: Array, //Only need to perform assign services to branch task for frontend
  },
  { timestamps: true }
);

module.exports = mongoose.model("business", businessSchema);
