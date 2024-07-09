const mongoose = require("mongoose")

const businessCatagorySchema = new mongoose.Schema({
    BusinessCategoryName: String,
    Icon: { type: String, default: "https://spa-saloon-images.s3.amazonaws.com/business/images/default%20%281%29.svg" },
    BusinessCategoryNo: String,
    status: { type: Boolean, default: true },
    createdBy: String,
    updatedBy: String,
    status: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
},
    { timestamps: true }
);
module.exports = mongoose.model("businessCatagory", businessCatagorySchema); 