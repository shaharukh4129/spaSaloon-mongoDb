const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "business" },
    countryId: { type: mongoose.Schema.Types.ObjectId, ref: "country" },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "branchLocation" },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "client" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "booking" },
    comments: String,
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5]
    },
    replyArray: [
        {
            userId: mongoose.Schema.Types.ObjectId,
            userType: String,
            reply: String
        }
    ]
},
    { timestamps: true }
);
module.exports = mongoose.model("review", reviewSchema)