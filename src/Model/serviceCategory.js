const mongoose = require("mongoose")

const serviceCatagorySchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" },
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
    businessCatagoryId: { type: mongoose.Schema.Types.ObjectId, ref: "businessCatagory" },
    serviceCategoryName: String,
    serviceCategoryDetails: String,
    ServiceCategoryColor: String,
    ServiceCategoryIdNo: { type: String },
    serviceCategoryTag: Array,
    status: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: String,
    updatedBy: String,
},
    { timestamps: true }
);
module.exports = mongoose.model("serviceCatagory", serviceCatagorySchema); 