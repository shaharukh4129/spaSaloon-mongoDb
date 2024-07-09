const mongoose = require("mongoose");

const TeamTitleSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
  titleID: { type: String },
  teamTitle: String,
  status: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdBy: String,
  updatedBy: String,
},
  { timestamps: true }
);

const teamTitle = mongoose.model("teamTitle", TeamTitleSchema);
module.exports = teamTitle;