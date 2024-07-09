const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  businessCount: Number,
  businessUserCount: Number,
},
  { timestamps: true }
);

module.exports = mongoose.model("businessCounter", schema);

