const review = require("../../Model/review");

exports.review = {

    createReview: async (req, res) => {
        try {
            const payload = {
                businessId: req.body.businessId,
                countryId: req.body.countryId,
                branchId: req.body.branchId,
                bookingId: req.body.bookingId,
                clientId: req.body.clientId,
                comments: req.body.comments,
                rating: req.body.rating,
                replyArray: req.body.replyArray,
                createdBy: req.user.firstName + ' ' + req.user.lastName,
                updatedBy: req.user.firstName + ' ' + req.user.lastName,
            };

            const Review = new review(payload);
            const savedReview = await Review.save();

            res.status(200).json({
                status: true,
                message: "Review created successfully",
                data: savedReview,
            });
        } catch (err) {
            if (err) throw err;
        }
    },

    updateReview: async (req, res) => {
        try {
            const id = req.params.id;
            const payload = {
                businessId: req.body.businessId,
                countryId: req.body.countryId,
                branchId: req.body.branchId,
                bookingId: req.body.bookingId,
                clientId: req.body.clientId,
                comments: req.body.comments,
                rating: req.body.rating,
                replyArray: req.body.replyArray,
                updatedBy: req.user.firstName + ' ' + req.user.lastName,
            };

            const updatedReview = await review.findByIdAndUpdate(
                id,
                payload,
                { new: true }
            );
            if (!updatedReview) {
                return res.status(404).json({
                    status: false,
                    message: "Review not found",
                });
            } else {
                res.status(200).json({
                    status: true,
                    message: "Review Details successfully updated",
                    data: updatedReview,
                });
            }

        } catch (err) {
            throw err;
        }
    },
    addReply: async (req, res) => {
        try {
            const id = req.params.id;
            req.body.reply.userId = ObjectId(req.user._id)

            const updatedReply = await review.findByIdAndUpdate(
                id,
                { $push: { replyArray: req.body.reply } },
                { new: true }
            );
            if (!updatedReply) {
                return res.status(404).json({
                    status: false,
                    message: " replay not found",
                });
            } else {
                res.status(200).json({
                    status: true,
                    message: "reply successfully updated",
                    data: updatedReply,
                });
            }

        } catch (err) {
            throw err;
        }
    },
    getReview: async (req, res) => {
        try {
            let query = { status: true }
            let { businessId, branchId, _id } = req.query

            if (_id) {
                query._id = _id
            }
            if (businessId) {
                query.businessId = businessId
            }
            if (branchId) {
                query.branchId = branchId
            }
            let value = await review.find(query).sort({ _id: -1 });

            res.status(200).json({
                status: true,
                message: "Listed review detail successfully",
                data: value
            })
        } catch (err) {
            if (err) throw err;
        }

    },
    deletedReview: async (req, res) => {
        try {
            const id = req.params.id;

            const deletedReview = await review.findByIdAndDelete(id);

            if (!deletedReview) {
                return res.status(404).json({
                    status: false,
                    message: "Reviews not found",
                });
            }

            res.status(200).json({
                status: true,
                message: "Review Details successfully deleted",
                data: deletedReview,
            });
        } catch (err) {
            throw err
        }
    },
};