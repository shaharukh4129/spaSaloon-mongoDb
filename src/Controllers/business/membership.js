const mongoose = require("mongoose");
const membership = require("../../Model/membership")

exports.membership = {
  createMembership: async (req, res) => {
    try {
      const payload = {
        businessId: req.body.businessId,
        branchId: req.body.branchId,
        countryId: req.body.countryId,
        Membership: req.body.Membership,
        ValidityUnit: req.body.ValidityUnit,
        ValidityFrequency: req.body.ValidityFrequency,
        tier: req.body.tier,
        sell_Membership: req.body.sell_Membership,
        achievement_Membership: req.body.achievement_Membership,
        criteria: req.body.criteria,
        criteriaUnit: req.body.criteriaUnit,
        criteriaFrequency: req.body.criteriaFrequency,
        criteriaStart: req.body.criteriaStart,
        amountSpent: req.body.amountSpent,
        retailPrice: req.body.retailPrice,
        startDate: req.body.startDate,
        hoursBooked: req.body.hoursBooked,
        Points: req.body.Points,
        createdBy: req.user.firstName + ' ' + req.user.lastName,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };

      const Membership = new membership(payload);
      const savedMembership = await Membership.save();

      res.status(200).json({
        status: true,
        message: "Successfully created Membership",
        data: savedMembership,
      });
    } catch (err) {
      if (err) throw err;
    }
  },
  updateMembership: async (req, res) => {
    try {
      const id = req.params.id;
      const payload = {
        businessId: req.body.businessId,
        branchId: req.body.branchId,
        countryId: req.body.countryId,
        Membership: req.body.Membership,
        ValidityUnit: req.body.ValidityUnit,
        ValidityFrequency: req.body.ValidityFrequency,
        tier: req.body.tier,
        sell_Membership: req.body.sell_Membership,
        achievement_Membership: req.body.achievement_Membership,
        criteria: req.body.criteria,
        criteriaUnit: req.body.criteriaUnit,
        criteriaFrequency: req.body.criteriaFrequency,
        criteriaStart: req.body.criteriaStart,
        amountSpent: req.body.amountSpent,
        retailPrice: req.body.retailPrice,
        startDate: req.body.startDate,
        hoursBooked: req.body.hoursBooked,
        Points: req.body.Points,
        status: req.body.status,
        isActive: req.body.isActive,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };

      const updatedMembership = await membership.findByIdAndUpdate(
        id,
        payload,
        { new: true }
      );
      if (!updatedMembership) {
        return res.status(404).json({
          status: false,
          message: "Membership not found",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Membership details successfully updated",
          data: updatedMembership,
        });
      }

    } catch (err) {
      throw err;
    }
  },
  getMembership: async (req, res) => {
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

      let value = await membership.find(query).populate({ path: "businessId", select: { businessName: 1 } }).populate({
        path: "branchId",
        select: { branchName: 1 },
      }).sort({ _id: -1 });
      res.status(200).json({
        status: true,
        message: "Listed membership detail successfully",
        data: value
      })
    } catch (err) {
      if (err) throw err;
    }
  },
  deletedMembership: async (req, res) => {
    try {
      const id = req.params.id;

      const deletedMembership = await membership.findByIdAndDelete(id);

      if (!deletedMembership) {
        return res.status(404).json({
          status: false,
          message: "Membership not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Membership Details successfully deleted",
        data: deletedMembership,
      });
    } catch (err) {
      throw err
    }
  },
}