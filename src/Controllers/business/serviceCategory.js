const mongoose = require("mongoose");
const serviceCategory = require("../../Model/serviceCategory");
const businessService = require("../../Model/businessService");
const businessPrice = require("../../Model/businessPrice");
const functions = require("../../../functions");

exports.serviceCategory = {
  createServiceCatagory: async (req, res) => {
    try {
      const existingServiceCategory = await serviceCategory.findOne(
        {
          serviceCategoryName: req.body.serviceCategoryName,
          businessId: req.body.businessId
        });
      if (existingServiceCategory) {
        return res.status(400).json({
          status: false,
          message: "Service category already exists",
        });
      } else {
        let payload = {
          businessId: req.body.businessId,
          countryId: req.body.countryId,
          businessCatagoryId: req.body.businessCatagoryId,
          serviceCategoryName: req.body.serviceCategoryName,
          serviceCategoryDetails: req.body.serviceCategoryDetails,
          ServiceCategoryColor: req.body.ServiceCategoryColor,
          serviceCategoryTag: req.body.serviceCategoryTag,
          // createdBy: req.user.firstName + ' ' + req.user.lastName,
          // updatedBy: req.user.firstName + ' ' + req.user.lastName,
        };
        const latest = await serviceCategory.findOne({ businessId: req.body.businessId }, { ServiceCategoryIdNo: 1 }).sort({ _id: -1 });

        let count;
        if (latest) {
          count = Number((latest?.ServiceCategoryIdNo).slice(-3));
        } else {
          count = 0;
        }

        let ServiceCategoryIdNo = (String(count + 1).padStart(2, '0'))

        payload.ServiceCategoryIdNo = ServiceCategoryIdNo;

        const savedServiceCatagory = await new serviceCategory(payload).save()

        res.status(200).json({
          status: true,
          message: "Service category created successfully",
          data: savedServiceCatagory,
        });
      }

    } catch (err) {
      if (err) throw err;
    }
  },
  updateServiceCatagory: async (req, res) => {
    try {
      const id = req.params.id;
      const payload = {
        countryId: req.body.countryId,
        businessCatagoryId: req.body.businessCatagoryId,
        serviceCategoryName: req.body.serviceCategoryName,
        serviceCategoryDetails: req.body.serviceCategoryDetails,
        ServiceCategoryColor: req.body.ServiceCategoryColor,
        serviceCategoryTag: req.body.serviceCategoryTag,
        status: req.body.status,
        isActive: req.body.isActive,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };
      //   let payload = req.body
      const updatedServiceCatagory = await serviceCategory.findByIdAndUpdate(
        { _id: id },
        { $set: payload },
        { new: true }
      );

      if (!updatedServiceCatagory) {
        return res.status(404).json({
          status: false,
          message: "service Catagory not found",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Service category details have been successfully updated",
          data: updatedServiceCatagory,
        });
      }

    } catch (err) {
      throw err;
    }
  },
  getServiceCatagory: async (req, res) => {
    try {

      let { businessId, branchId, _id, type } = req.query
      let query = { status: true }
      if (type) {
        query = {}
      }
      if (_id) {
        query._id = _id
      }
      if (businessId) {
        query.businessId = businessId
      }
      if (branchId) {
        query.branchId = branchId
      }

      let value = await serviceCategory.find(query).sort({ _id: -1 }).populate([{ path: "businessCatagoryId", select: { Icon: 1, BusinessCategoryName: 1 } }, { path: "businessId", select: { businessAccountNo: 1, businessName: 1 } }]);

      res.status(200).json({
        status: true,
        message: "Listed service category detail successfully",
        data: value
      })

    } catch (err) {
      if (err) throw err;
    }

  },
  deleteServiceCatagory: async (req, res) => {
    try {
      const id = req.params.id;
      const deletedServiceCategory = serviceCategory.findByIdAndDelete(id);
      const deletedService = businessService.deleteMany({ serviceCatagoryId: id });
      const deletedPrice = businessPrice.deleteMany({ serviceCatagoryId: id });

      const [serviceCategor, service, price] = await Promise.all([deletedServiceCategory, deletedService, deletedPrice])

      res.status(200).json({
        status: true,
        message: "Service Category Details successfully deleted",
        data: serviceCategor,
      });
    } catch (err) {
      throw err
    }
  },
  serviceCatagorystatus: async (req, res) => {
    try {
      const upload = await functions.statusUpdate(req.params.id, serviceCategory);
      res.json(upload)
    } catch (err) {
      res.status(500).json({
        message: err.message,
        status: false
      });
    }

  },
};
