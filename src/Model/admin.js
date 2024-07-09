const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String,
  userType: { type: String, enum: ["sub", "superadmin"] },
  status: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  role: String,
  mobile_OTP: String,
  email_OTP: String,
  createdBy: String,
  updatedBy: String,
},
  { timestamps: true }
);

const User = mongoose.model("Admin", userSchema);

module.exports = User;
