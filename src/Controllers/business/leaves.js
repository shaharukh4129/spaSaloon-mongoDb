const mongoose = require("mongoose");
const Leaves = require("../../Model/leaves")

exports.leaves = {

  createLeaves: async (req, res) => {
    try {
      const payload = {
        businessId: req.body.businessId,
        countryId: req.body.countryId,
        branchId: req.body.branchId,
        teamMemberId: req.body.teamMemberId,
        leaves: req.body.leaves,
        isActive: req.body.isActive,
        createdBy: req.user.firstName + ' ' + req.user.lastName,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };

      let leaves;
      const check = await Leaves.findOne({ teamMemberId: req.body.teamMemberId })

      if (check) {
        leaves = await Leaves.findOneAndUpdate(
          { teamMemberId: req.body.teamMemberId },
          { $set: { leaves: req.body.leaves } },
          { new: true }
        )
      } else {
        leaves = await new Leaves(payload).save()
      }

      res.status(200).json({
        status: true,
        message: "Leaves created successfully",
        data: leaves,
      });
    } catch (err) {
      if (err) throw err;
    }
  },
  updateLeaves: async (req, res) => {
    try {
      const id = req.params.id;
      const payload = {
        branchId: req.body.branchId,
        teamMemberId: req.body.teamMemberId,
        createdBy: req.body.createdBy,
        leaves: req.body.leaves,
        status: req.body.status,
        isActive: req.body.isActive,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };

      const updatedLeaves = await Leaves.findByIdAndUpdate(
        id,
        payload,
        { new: true }
      );
      if (!updatedLeaves) {
        return res.status(404).json({
          status: false,
          message: "Leaves not found",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Leaves Details successfully updated",
          data: updatedLeaves,
        });
      }

    } catch (err) {
      throw err;
    }
  },
  getLeaves: async (req, res) => {
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
      let value = await Leaves.find(query).sort({ _id: -1 });

      res.status(200).json({
        status: true,
        message: "Listed leaves detail successfully",
        data: value
      })
    } catch (err) {
      if (err) throw err;
    }

  },
  deletedLeaves: async (req, res) => {
    try {
      const id = req.params.id;

      const deletedLeaves = await Leaves.findByIdAndDelete(id);

      if (!deletedLeaves) {
        return res.status(404).json({
          status: false,
          message: "leaves not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Leaves Details successfully deleted",
        data: deletedLeaves,
      });
    } catch (err) {
      throw err
    }
  },
};