const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
    createdBy: String,
    updatedBy: String,
    customerAccountNo: { type: String },
    userIp: String,
    deviceId: String,
    sessionId: String,
    location: String,
    deviceType: String,
    email: String,
    firstName: String,
    lastName: String,
    password: String,
    stepCompleted: Number,
    mobile: String,
    countryCode: String,
    dialCode: String,
    country: String,
    mobile_OTP: String,
    email_OTP: String,
    newEmail: String,
    type: String,
    emailVerified: { type: Boolean, default: true },
    mobileVerified: { type: Boolean, default: false },
    otp_sent: { type: Boolean, default: false },
    mobile_OTP_verify: { type: Boolean, default: false },
    email_OTP_verify: { type: Boolean, default: false },
    // reset: Object,
    reset: {
      mobileVerified: { type: Boolean, default: false },
      oldEmailVerified: { type: Boolean, default: false },
      newEmailVerified: { type: Boolean, default: false },
    },
    status: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    userType: String // Only needs to segreegate login
  },
  { timestamps: true }
);

module.exports = mongoose.model("businessUser", businessSchema);
