const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "client" },
  services: [{
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "packages" },
    promotionId: { type: mongoose.Schema.Types.ObjectId, ref: "promotion" },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "businessPrice" },
    TeamMemberId: [{ type: mongoose.Schema.Types.ObjectId, ref: "teamMember" }],
    amenitiesId: [{ type: mongoose.Schema.Types.ObjectId, ref: "amenities" }],
    startTime: String,
    bookingStatus: { type: String, enum: ['Completed', 'Upcoming', 'Cancelled', 'No Show'] },
  }],
  packageType: String,
  notes: String,
  salectDate: String,
  salectDateInFormat: Date,
  salectTime: String,
  total: String,
  finalPrice: String,
  bookingStatus: { type: String, enum: ['Completed', 'Upcoming', 'Cancelled', 'No Show'] },
  assigned: Boolean,
  status: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  bookingHistory: Array,
  createdBy: String,
  updatedBy: String,
},
  { timestamps: true }
);

module.exports = mongoose.model("booking", bookingSchema);