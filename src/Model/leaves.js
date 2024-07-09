const mongoose = require("mongoose");

const leaves = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
    branchId: [{ type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" }],
    teamMemberId: { type: mongoose.Schema.Types.ObjectId, ref: "teamMember" },
    createdBy: String,
    updatedBy: String,
    leaves: [{
      branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" },
      fromDate: String,
      toDate: String,
      fromTime: String,
      toTime: String,
    }],
    status: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("leaves", leaves);
