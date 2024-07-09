const branchLocationModel = require("../../Model/branchLocation");
const businessService = require("../../Model/businessService")
const Business = require("../../Model/business")
const TeamMember = require("../../Model/teamMember")
const businessPrice = require("../../Model/businessPrice")
const random = require("randomstring");
const functions = require("../../../functions");

let branchLocation = {
    addBranch: async (req, res) => {
        try {
            const existingBranch = await branchLocationModel.findOne({ branchName: req.body.branchName });
            if (existingBranch) {
                return res.status(400).json({
                    status: false,
                    message: "Branch name already exists",
                });
            } else {
                const latest = await branchLocationModel.findOne({ businessId: req.body.businessId }, { branchNo: 1 }).sort({ _id: -1 })

                let count;
                if (latest?.branchNo) {
                    count = +latest.branchNo
                } else {
                    count = 0
                }
                let branchNo = (String(count + 1).padStart(2, '0'))

                req.body.branchNo = branchNo;
                req.body.updatedBy = req.user.firstName + ' ' + req.user.lastName
                req.body.createdBy = req.user.firstName + ' ' + req.user.lastName
                if (req.body.businessCatagoryId) {
                    req.body.businessCatagoryId = JSON.parse(req.body.businessCatagoryId)
                }

                const newBranchLocation = new branchLocationModel(req.body);
                await newBranchLocation.save((err, data) => {
                    if (err) throw err
                    res.status(201).json({
                        status: true,
                        message: "Branch location added successfully",
                        data: data,
                    });
                });
            }
        } catch (error) {
            throw error
        }
    },
    getBranch: async (req, res) => {
        try {
            const { businessId, branchId, type, _id } = req.query
            let query = { status: true }
            let projection = {}

            if (_id) {
                query._id = _id;
            }
            if (businessId) {
                query.businessId = businessId
            }
            if (branchId) {
                query.branchId = branchId
            }
            if (type) {
                projection = { branchName: 1 }
            }

            branchLocationModel.find(
                query,
                projection,
            )
                .sort({ _id: -1 })
                .populate(
                    {
                        path: "businessId",
                        select: {
                            country: 1,
                            businessAccountNo: 1
                        }
                    })
                .populate("businessCatagoryId")
                .exec((err, data) => {
                    if (err) throw err
                    res.status(200).json({
                        status: true,
                        message: "All Branch location details found successfully",
                        data: data
                    });
                }
                )
        } catch (error) {
            throw error;
        }
    },
    updateBranch: async (req, res) => {
        try {
            let id = req.params.id;
            let check = true

            if (req.body.branchName) {
                const existingBranch = await branchLocationModel.findOne({ branchName: req.body.branchName });
                if (existingBranch) {
                    check = false
                    return res.status(203).json({
                        status: false,
                        message: "Branch name is already exist",
                    });
                } else {
                    check = true
                }
            }
            if (req.body.notWorkingHours) {
                req.body.notWorkingHours = JSON.parse(req.body.notWorkingHours)
            }
            if (req.body.workingHours) {
                req.body.workingHours = JSON.parse(req.body.workingHours)
            }
            if (req.body.businessCatagoryId) {
                req.body.businessCatagoryId = JSON.parse(req.body.businessCatagoryId)
            }
            if (req.body.sameEveryDay) {
                req.body.sameEveryDay = JSON.parse(req.body.sameEveryDay)
            }
            if (req.body.sameEveryDayOffPeakHours) {
                req.body.sameEveryDayOffPeakHours = JSON.parse(req.body.sameEveryDayOffPeakHours)
            }
            if (req.body.offPeakHours) {
                req.body.offPeakHours = JSON.parse(req.body.offPeakHours)
            }

            req.body.updatedBy = req.user.firstName + ' ' + req.user.lastName

            let allImages = []
            if (req.files?.length > 0) {
                allImages = req.files.map(file => file.location)

                if (req.body.oldImages) {
                    const oldimages = JSON.parse(req.body.oldImages)
                    allImages = [...oldimages, ...allImages]
                }

            } else if (req.body.oldImages) {
                allImages = JSON.parse(req.body.oldImages)
            }

            req.body.image = allImages

            if (check) {
                branchLocationModel.findByIdAndUpdate(
                    { _id: id },
                    req.body,
                    { new: true },
                    (err, data) => {
                        if (err) throw err
                        res.status(200).json({
                            status: true,
                            message: "Branch location updated successfully",
                            data: data,
                        });
                    }
                );
            }
        } catch (error) {
            throw error;
        }
    },
    deleteBranch: async (req, res) => {
        try {
            let id = req.query.id;
            branchLocationModel.deleteOne(
                { _id: id },
                (err, data) => {
                    if (err) throw err
                    res.status(200).json({
                        status: true,
                        message: "Branch location is permanently deleted",
                    });
                }
            )
        } catch (error) {
            throw error;
        }
    },
    branchstatus: async (req, res) => {
        try {
            const upload = await functions.statusUpdate(req.params.id, branchLocationModel);
            res.json(upload)
        } catch (err) {
            res.status(500).json({
                messgae: err.messaeg,
                status: false
            })
        }
    },
    assignBusinessService: async (req, res) => {
        try {
            const { businessId } = req.query

            req.body?.assignArray?.map(async obj => {
                await businessPrice.updateMany(
                    { _id: { $in: obj.priceIds } },
                    { $addToSet: { branchId: ObjectId(obj.branchId) } }
                )
                await businessService.updateMany(
                    { _id: { $in: obj.serviceIds } },
                    { $addToSet: { branchId: ObjectId(obj.branchId) } }
                )
            })

            req.body?.deleteArray?.map(async obj => {
                await businessPrice.updateMany(
                    { _id: { $in: obj.priceIds } },
                    { $pull: { branchId: ObjectId(obj.branchId) } }
                )
                await businessService.updateMany(
                    { _id: { $in: obj.serviceIds } },
                    { $pull: { branchId: ObjectId(obj.branchId) } }
                )
            })

            //Only need for frontend for assign service to branch task
            if (req.body.originalAssignServiceArray) {
                await Business.findOneAndUpdate(
                    { _id: businessId },
                    { $set: { originalAssignServiceArray: req.body.originalAssignServiceArray } },
                )
            }
            res.status(200).json({
                status: true,
                message: "Services are assigned successfully",
            });
        } catch (error) {
            throw error;
        }
    },
    assignTeamToBranch: async (req, res) => {
        try {
            let { branchId, teamMembers, deleteTeamMembers } = req.body

            //assigning team members to branch
            teamMembers?.forEach(async team =>
                await TeamMember.findByIdAndUpdate(
                    { _id: team.teamMemberId },
                    {
                        $addToSet: {
                            branchId: ObjectId(branchId),
                        },
                        $push: {
                            Role: {
                                branch: ObjectId(branchId),
                                role: team.branchRole,
                                teamMemberName: team.teamMemberName,
                                accessManager: team.accessManager
                            }
                        },
                    },
                    { new: true },
                )
            )

            //Unassigning team members to branch
            deleteTeamMembers?.map(async id =>
                await TeamMember.findByIdAndUpdate(
                    { _id: id },
                    {
                        $pull: {
                            branchId: ObjectId(branchId),
                            Role: {
                                branch: ObjectId(branchId)
                            }
                        },
                    },
                    { new: true },
                )
            )

            res.status(200).json({
                status: true,
                message: "Team member successfully assigned to branch",
            });
        } catch (error) {
            throw error;
        }
    },
    assignServiceToTeam: async (req, res) => {
        try {
            let { serviceId, teamMembers, deleteTeamMembers } = req.body

            //assigning team members to service
            teamMembers?.forEach(async id =>
                await TeamMember.findByIdAndUpdate(
                    { _id: id },
                    { $addToSet: { serviceId: ObjectId(serviceId) } },
                    { new: true },
                )
            )

            //Unassigning team members to service
            deleteTeamMembers?.map(async id =>
                await TeamMember.findByIdAndUpdate(
                    { _id: id },
                    { $pull: { serviceId: ObjectId(serviceId) } },
                    { new: true },
                )
            )

            res.status(200).json({
                status: true,
                message: "Team member successfully assigned to branch",
            });
        } catch (error) {
            throw error;
        }
    },
}

module.exports = branchLocation;
