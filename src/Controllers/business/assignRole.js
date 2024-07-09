const assignRole = require("../../Model/assignRole");
const functions = require("../../../functions");
const businessUserModel = require("../../Model/businessUser");

exports.assignRole = {
    createAssignRole: async (req, res) => {
        try {

            const check = await assignRole.findOne({ businessId: req.body.businessId })
            let responseData;
            if (check) {
                responseData = await assignRole.findOneAndUpdate(
                    { businessId: ObjectId(req.body.businessId) },
                    { $set: { roles: req.body.roles } },
                    { new: true },
                )

            } else {

                const payload = {
                    businessId: req.body.businessId,
                    countryId: req.body.countryId,
                    roles: req.body.roles,
                    createdBy: req.user.firstName + ' ' + req.user.lastName,
                    updatedBy: req.user.firstName + ' ' + req.user.lastName,
                };

                responseData = await new assignRole(payload).save()
            }
            res.status(200).json({
                status: true,
                message: "Roles updated successfully",
                data: responseData,
            });
        } catch (err) {
            if (err) throw err;
        }
    },
    // updateAssignRole: async (req, res) => {
    //     try {
    //         const { businessId, userTypeObjId, categoryObjId, innerAccessObj } = req.body

    //         const keys = Object.keys(innerAccessObj);
    //         const value = Object.values(innerAccessObj);

    //         const updateObject = {};
    //         updateObject[`roles.$[outer].access.$[inner].access.${keys[0]}`] = value[0];

    //         assignRole.findOneAndUpdate(
    //             { businessId: ObjectId(businessId) },
    //             { $set: updateObject },
    //             {
    //                 arrayFilters: [
    //                     { 'outer._id': ObjectId(userTypeObjId) },
    //                     { 'inner._id': ObjectId(categoryObjId) }
    //                 ],
    //                 new: true
    //             },
    //             (err, data) => {
    //                 if (err) throw err
    //                 res.status(200).json({
    //                     status: true,
    //                     message: "Roles updated successfully",
    //                     data: data,
    //                 });
    //             }
    //         )
    //     } catch (err) {
    //         throw err;
    //     }
    // },
    getAssignRole: async (req, res) => {
        try {
            let query = {}
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

            let value = await assignRole.find(query);

            res.status(200).json({
                status: true,
                message: "Listed assign role detail successfully",
                data: value
            })
        } catch (err) {
            if (err) throw err;
        }
    },
    deleteAssignRole: async (req, res) => {
        try {
            const id = req.params.id;

            const data = await assignRole.findByIdAndDelete(id);
            res.status(200).json({
                status: true,
                message: "Assign role details successfully deleted",
                data: data,
            });
        } catch (err) {
            throw err
        }
    },
  
}