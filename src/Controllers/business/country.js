const mongoose = require("mongoose");
const country = require("../../Model/country");

exports.country = {
  createCountry: async (req, res) => {
    try {
      const payload = {
        businessId: req.body.businessId,
        branchId: req.body.branchId,
        countryName: req.body.countryName,
        countryCode: req.body.countryCode,
        dialCode: req.body.dialCode,
        countryCurrency: req.body.countryCurrency,
        countryTaxRate: req.body.countryTaxRate,
        createdBy: req.user.firstName + ' ' + req.user.lastName,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };

      const Country = new country(payload);
      const savedCountry = await Country.save();

      res.status(200).json({
        status: true,
        message: "Successfully created country",
        data: savedCountry,
      });
    } catch (err) {
      if (err) throw err;
    }
  },
  updateCountry: async (req, res) => {
    try {
      const id = req.params.id;
      const payload = {
        businessId: req.body.businessId,
        branchId: req.body.branchId,
        countryName: req.body.countryName,
        countryCode: req.body.countryCode,
        dialCode: req.body.dialCode,
        countryCurrency: req.body.countryCurrency,
        countryTaxRate: req.body.countryTaxRate,
        status: req.body.status,
        isActive: req.body.isActive,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };

      const updatedCountry = await country.findByIdAndUpdate(
        id,
        payload,
        { new: true }
      );

      if (!updatedCountry) {
        return res.status(404).json({
          status: false,
          message: "Country not found",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Country Details successfully updated",
          data: updatedCountry,
        });
      }

    } catch (err) {
      throw err;
    }
  },
  getCountry: async (req, res) => {
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

      let value = await country.find(query).sort({ _id: -1 });
      res.status(200).json({
        status: true,
        message: "Listed country detail successfully",
        data: value
      })
    } catch (err) {
      if (err) throw err;
    }

  },
  deleteCountry: async (req, res) => {
    try {
      const id = req.params.id;

      const deletedCountry = await country.findByIdAndDelete(id);

      if (!deletedCountry) {
        return res.status(404).json({
          status: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Category details successfully deleted",
        data: deletedCountry,
      });
    } catch (err) {
      throw err
    }
  },
};
