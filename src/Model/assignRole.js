const mongoose = require("mongoose")

const assignRoleSchema = new mongoose.Schema(
    { businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" } },
    { timestamps: true, strict: false }
)

module.exports = mongoose.model("assignRole", assignRoleSchema)
