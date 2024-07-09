const mongoose = require("mongoose");
const businessCatagory = require("../../Model/businessCatagory");
const functions = require("../../../functions");

const multer = require('multer');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  "accessKeyId": process.env.accessKeyId,
  "secretAccessKey": process.env.secretAccessKey,
  "region": process.env.region,
});


exports.businessCatagory = {
  createCatagory: async (req, res) => {
    try {
      let Icon;
      let { BusinessCategoryName, BusinessCategoryNo, updatedBy, createdBy } = req.body
      let check = await businessCatagory.findOne({ BusinessCategoryName: BusinessCategoryName })
      if (check) {
        res.status(201).json({
          status: false,
          message: "business category already exists !",
        });
      } else {
        if (req.file) {
          const upload = await functions.Svg(req.file.buffer, req.file.originalname);
          Icon = upload.Location
        }
        const payload = {
          _id: new mongoose.Types.ObjectId(),
          BusinessCategoryName: BusinessCategoryName,
          Icon: Icon,
          BusinessCategoryNo: BusinessCategoryNo,
          createdBy: req.user.firstName + ' ' + req.user.lastName,
          updatedBy: req.user.firstName + ' ' + req.user.lastName,
        };
        const catagory = new businessCatagory(payload);
        const savedCatagory = await catagory.save();

        res.status(200).json({
          status: true,
          message: "Successfully created country",
          data: savedCatagory,
        });
      }
    } catch (err) {
      if (err) throw err;
    }
  },
  updateCatagory: async (req, res) => {
    try {
      const id = req.params.id;
      // const payload = {
      //   BusinessCategoryName: req.body.BusinessCategoryName,
      //   Icon: req.body.Icon,
      //   BusinessCategoryNo: req.body.BusinessCategoryNo,
      //   updatedBy: req.user.firstName + ' ' + req.user.lastName,
      // };
      req.body.updatedBy = req.user.firstName + ' ' + req.user.lastName
      let payload = req.body
      if (req.file) {
        const upload = await functions.Svg(req.file.buffer, req.file.originalname);
        payload.Icon = upload.Location
      } else {
        payload.Icon = req.body.Icon;
      }

      const updatedCatagory = await businessCatagory.findByIdAndUpdate(
        { _id: id },
        { $set: payload },
        { new: true }
      );

      if (!updatedCatagory) {
        return res.status(404).json({
          status: false,
          message: "Category not found",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Category Details successfully updated",
          data: updatedCatagory,
        });
      }

    } catch (err) {
      throw err;
    }
  },
  getCatagory: async (req, res) => {
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

      let value = await businessCatagory.find(query).sort({ _id: -1 });

      res.status(200).json({
        status: true,
        message: "Listed business catagory detail successfully",
        data: value
      })
    } catch (err) {
      if (err) throw err;
    }
  },
  deleteCatagory: async (req, res) => {
    try {
      const id = req.params.id;
      const deletedCategory = await businessCatagory.findByIdAndDelete(id);

      if (!deletedCategory) {
        return res.status(404).json({
          status: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Category Details successfully deleted",
        data: deletedCategory,
      });
    } catch (err) {
      throw err
    }
  },
  categoryStatus: async (req, res) => {
    try {
      const upload = await functions.statusUpdate(req.params.id, businessCatagory);
      res.json(upload)
    } catch (err) {
      throw err
    }
  }

};
