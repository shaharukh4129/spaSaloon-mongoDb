const mongoose = require("mongoose")

const clientSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" },
  firstName: String,
  lastName: String,
  mobile: Number,
  email: String,
  dateOfBirth: String,
  gender: String,
  country: String,
  state: String,
  city: String,
  postalCode: String,
  adderss1: String,
  adderss2: String,
  landmark: String,
  Membership: {
    type: String,
    enum: ['Regular', 'Silver', 'Gold', 'Diamond', 'Platinum', 'Solitaire'],
    default: 'Regular'
  },
  membershipHistory: Array,
  membershipStartDate: Date,
  membershipExpiryDate: Date,
  clientAccountNo: { type: String },
  status: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdBy: String,
  updatedBy: String,
},
  { timestamps: true }
);
const client = mongoose.model("client", clientSchema);
module.exports = client;