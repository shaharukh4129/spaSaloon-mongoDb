const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
    branchId: [{ type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" }],
    teamTitleId: { type: mongoose.Schema.Types.ObjectId, ref: "teamTitle" },
    serviceId: [{ type: mongoose.Schema.Types.ObjectId, ref: "businessService" }],
    createdBy: String,
    updatedBy: String,
    firstName: String,
    lastName: String,
    password: String,
    emailVerified: Boolean,
    nickName: String,
    email: String,
    mobile: String,
    isPublic: Boolean,
    isBooking: Boolean,
    about: String,
    image: String,
    newEmail: String,
    // date: String,
    teamMemberIdNo: { type: String },
    imageVisibleToPublic: Boolean,
    isAvilableForBooking: Boolean,
    mobile_OTP: String,
    email_OTP: String,
    status: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: true },
    mobileVerified: { type: Boolean, default: false },
    otp_sent: { type: Boolean, default: false },
    mobile_OTP_verify: Boolean,
    email_OTP_verify: Boolean,
    hoursDetail: [
      {
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" },
        shift: [
          {
            shiftNo: {
              type: String,
              enum: ['shift1', 'shift2', 'shift3']
            },
            workingHours: [{
              day: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
              },
              from: String,
              to: String,
            }],
          },
        ],
        isSameEveryday: {
          status: Boolean,
          shift: [{
            shiftNo: String,
            from: String,
            to: String
          }],
        }, // for frontend use only
      },
    ],
    Role: [
      {
        isGlobal: Boolean,
        branches: [],
        branch: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" }, // global
        role: [{ type: mongoose.Schema.Types.ObjectId, ref: "teamTitle" }],
        accessManager: String
      }
    ],
    reset: {
      mobileVerified: { type: Boolean, default: false },
      oldEmailVerified: { type: Boolean, default: false },
      newEmailVerified: { type: Boolean, default: false },
    },
    bookingDetails: Array, // Only needs to perform query
    availablity: String, // Only needs to perform query
    userType: String // Only needs to segreegate login
  },
  { timestamps: true, versionKey: false }
);

const TeamMember = mongoose.model("teamMember", teamMemberSchema);

module.exports = TeamMember;
