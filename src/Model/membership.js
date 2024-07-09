const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" },
  Membership: String,
  tier: Number,
  retailPrice: String,
  ValidityUnit: Number,
  ValidityFrequency: {
    type: String,
    enum: ['Week', 'Month', 'Year', null]
  },
  startDate: String,

  criteria: {
    type: String,
    enum: [
      'After customer registration',
      'After signup of membership',
      'From Date',
      'Start of current calender year',
      null
    ]
  },
  sell_Membership: Boolean,
  achievement_Membership: Boolean,
  criteriaUnit: Number,
  criteriaFrequency: String,
  criteriaStart: String, // This can be date of calender year as per the condition selected in membership
  criteriaExpiry: String,// This can be date of calender year as per the condition selected in membership
  amountSpent: String,
  hoursBooked: String,
  Points: String,
  status: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdBy: String,
  updatedBy: String,

},
  { timestamps: true }
)
module.exports = mongoose.model("membership", membershipSchema)