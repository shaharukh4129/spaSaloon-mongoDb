const mongoose = require("mongoose")


const amenitiesSchema = new mongoose.Schema(
    {
        businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
        countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" },
        itemName: { type: mongoose.Schema.Types.ObjectId, ref: "amenitiesGlobalList" },
        qty: String,
        occupied: String,
        available: String,
        status: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);
module.exports = mongoose.model("amenities", amenitiesSchema);