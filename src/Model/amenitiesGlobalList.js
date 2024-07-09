const mongoose = require("mongoose")

const amenitiesGlobalList = new mongoose.Schema(
    {
        businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
        itemName: String,
    },
    { timestamps: true }
);
module.exports = mongoose.model("amenitiesGlobalList", amenitiesGlobalList);