const mongoose = require("mongoose");

const packagesScehma = new mongoose.Schema({
      businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
      countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
      branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" },
      Services: [{
            priceId: { type: mongoose.Schema.Types.ObjectId, ref: "businessPrice" },
            serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "businessService" },
            noOfServices: String,
            noOfPerson: String,
            priceType: {
                  type: String,
                  enum: ['free', 'custom']
            },
            input: String,
      }],
      PackageName: String,
      PackageDescription: String,
      TermsAndConditions: String,
      ServiceAvailableFor: {
            type: String,
            enum: ['male', 'female', 'anyone']
      },
      PackageAfterCareDescription: String,
      typeOfService: {
            type: {
                  type: String,
                  enum: ['duration', 'bundle', 'noOfServices']
            },
            regularPrice: String,
            memberPrice: String,
      },
      totalPrice: String,
      finalPrice: String,
      status: { type: Boolean, default: true },
      isActive: { type: Boolean, default: true },
      createdBy: String,
      updatedBy: String,
},
      { timestamps: true }
)

module.exports = mongoose.model("packages", packagesScehma)