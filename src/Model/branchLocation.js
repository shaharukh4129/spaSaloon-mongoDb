const mongoose = require("mongoose");

const branchLocationSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
  serviceCatagoryId: [{ type: mongoose.Schema.Types.ObjectId, ref: "serviceCatagory" }],
  serviceId: [{ type: mongoose.Schema.Types.ObjectId, ref: "businessService" }],
  priceId: [{ type: mongoose.Schema.Types.ObjectId, ref: "businessPrice" }],
  businessCatagoryId: [{ type: mongoose.Schema.Types.ObjectId, ref: "businessCatagory" }],
  createdBy: String,
  updatedBy: String,
  branchNo: String,
  businessCountry: String,
  branchName: String,
  email: String,
  phoneNumber1: String,
  phoneNumber2: String,
  whatsAppNumber: String,
  city: String,
  postalCode: String,
  address1: String,
  address2: String,
  landmark: String,
  website: String,
  instagram: String,
  facebook: String,
  about: String,
  image: [String],
  workingHours: [
    {
      dayName: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      from: String,
      to: String,
    }
  ],
  offPeakHours: [
    {
      dayName: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      from: String,
      to: String,
    }
  ],
  sameEveryDay: {
    isSameEveryDay: Boolean,
    from: String,
    to: String,
  },
  sameEveryDayOffPeakHours: {
    isSameEveryDay: Boolean,
    from: String,
    to: String,
  },
  notWorkingHours: [
    {
      fromDate: String,
      toDate: String,
      isFullDay: String,
      from: String,
      to: String,
    },
  ],
  Amenities: String,
  status: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
},
  { timestamps: true }
);

const branchLocation = mongoose.model("branchLocation", branchLocationSchema);
module.exports = branchLocation;

