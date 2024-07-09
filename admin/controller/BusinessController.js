const BusinessModel = require('../../src/Model/business');

const BusinessController = {
    getBusinesslist: async (req, res) => {
        try {
            const data = await BusinessModel.find({}).select({ originalAssignServiceArray: 0 })
            res.status(200).json({
                message: "Data retrieved successfully",
                status: true,
                data: data
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = BusinessController;
