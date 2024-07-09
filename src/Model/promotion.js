const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
    priceId: [{
        id: { type: mongoose.Schema.Types.ObjectId, ref: "businessPrice" },
        serviceCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "serviceCatagory" },
        priceType: String,
        regularPrice: String,
        discount: String,
        promotionalPrice: String,
        // Below parameter for dynamic pricing only
        discountCriteria: [{
            unit: Number,
            frequency: String,
            discount: Number,
        }]
    }],
    serviceCategory: [{
        id: { type: mongoose.Schema.Types.ObjectId, ref: "serviceCatagory" },
        priceType: String,
        regularPrice: String,
        discount: String,
        promotionalPrice: String,
        // Below parameter for dynamic pricing only
        discountCriteria: [{
            unit: Number,
            frequency: String,
            discount: Number,
        }]
    }],
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" },
    promotionType: String,
    promotionName: String,
    unit: Number,
    frequency: { type: String, enum: ['Minutes', 'Hours', 'Days', ''] },
    dateFrom: String,
    dateTo: String,
    startTimeFrom: String,
    endTimeTo: String,
    // regularPrice: String,
    // discount: String,
    // promotionalPrice: String,
    minimumPurchaseAmount: {
        active: Boolean,
        minimumAmount: String,
    },
    LimitUsePerClient: Number,
    discountCode: String,
    LimitNumberOfUses: {
        active: Boolean,
        maxUser: String
    },
    image: Array,
    details: String,
    termsAndCondition: String,
    redemptionInstruction: String,
    cancellationPolicy: String,
    redeemCount: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    updatedBy: String,
    createdBy: String,
},
    { timestamps: true }
)

module.exports = mongoose.model("promotion", promotionSchema)