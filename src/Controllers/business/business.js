const mongoose = require("mongoose");
const path = require("path");
const businessModel = require("../../Model/business");
const functions = require("../../../functions");
const businessUserModel = require("../../Model/businessUser");

exports.business = {
  createBusiness: async (req, res) => {
    try {
      const existingBusiness = await businessModel.findOne({
        businessName: req.body.businessName,
      });

      const url = req.body.businessName
        .replace(/\s+/g, ' ').trim().split(' ').join('-') + '/'

      if (existingBusiness) {
        return res.status(400).json({
          status: false,
          message: "Business name already exists",
        });
      } else {
        let payload = {
          userId: req.body.userId,
          countryId: req.body.countryId,
          countryCode: req.body.countryCode,
          dialCode: req.body.dialCode,
          country: req.body.country,
          businessCatagoryId: req.body.businessCatagoryId,
          businessName: req.body.businessName,
          businessURL: url,
          stepCompleted: req.body.stepCompleted,
        }

        //managing usique business account number
        // let check = await businessCounterModel.findOne()

        // let latest;
        // if (check) {
        //   latest = await businessCounterModel.findByIdAndUpdate(
        //     { _id: check._id },
        //     { $inc: { businessCount: 1 } },
        //     { new: true }
        //   );
        // }

        const businessCount = await functions.createBusinessId()


        // const latest = await businessModel.findOne({}, { businessAccountNo: 1 }).sort({ _id: -1 })

        // const format = req.body.dialCode
        let businessAccountNo = req.body?.dialCode + businessCount

        // if (latest?.businessAccountNo) {
        //   businessAccountNo = format + +latest?.businessCount
        //   // payload.counter = +latest?.counter + 1

        // } else {
        //   businessAccountNo = format + 11001
        //   // payload.counter = 11001
        // }

        payload.businessAccountNo = businessAccountNo;


        new businessModel(payload).save(async (err, data) => {
          if (err) throw err

          await businessUserModel.findByIdAndUpdate(
            { _id: req.body.userId },
            { stepCompleted: req.body.stepCompleted },
          );


          res.status(200).json({
            status: true,
            message: "successfully created business",
            data: data,
          });
        });
      }
    } catch (err) {
      if (err) throw err
    }
  },
  updateBusiness: async (req, res) => {
    try {
      console.log("Ttttttttttttttttttttttttttttttt", req.file)
      console.log("Ttttttttttttttttttttttttttttttt", req.files)
      let id = req.params.id;
      let payload = req.body
      payload.updatedBy = req.user._id

      if (req.files?.profileImage) {
        payload.profileImage = req.files.profileImage[0].location
      }

      let allImages = []
      if (req.files?.image) {
        allImages = req.files.image.map(file => file.location)

        if (req.body.oldImages) {
          const oldimages = JSON.parse(req.body.oldImages)
          allImages = [...oldimages, ...allImages]
        }

      } else if (req.body.oldImages) {
        allImages = JSON.parse(req.body.oldImages)
      }

      payload.image = allImages

      let existingBusiness;
      let existingBusinessURL;

      if (req.body.businessName) {
        existingBusiness = await businessModel.findOne({
          businessName: req.body.businessName,
        });

        if (!existingBusiness) {
          const url = req.body.businessName
            .replace(/\s+/g, ' ').trim().split(' ').join('-') + '/'

          existingBusinessURL = await businessModel.findOne({
            _id: { $ne: id },
            businessURL: url,
          });

          if (!existingBusinessURL) {
            payload.businessURL = url
          }
        }
      }


      if (req.body.businessURL) {
        existingBusinessURL = await businessModel.findOne({
          _id: { $ne: id },
          businessURL: req.body.businessURL,
        });
      }

      if (existingBusiness) {
        return res.status(400).json({
          status: false,
          message: "Business name already exists",
        });
      } else if (existingBusinessURL) {
        return res.status(400).json({
          status: false,
          message: "Business url already exists",
        });
      } {
        if (payload.businessCatagoryId) {
          payload.businessCatagoryId = JSON.parse(payload.businessCatagoryId)
        }

        businessModel.findByIdAndUpdate(
          { _id: id },
          { $set: payload },
          { new: true },
          async (err, data) => {
            if (err) throw err
            res.status(200).json({
              status: true,
              message: "Business details are updated successfully",
              data: data,
            });
          }
        );
      }
    } catch (err) {
      throw err
    }
  },
  updateBusinessCategory: async (req, res) => {
    try {
      let id = req.params.id;

      if (req.body.businessCatagoryId) {
        businessModel.findByIdAndUpdate(
          { _id: id },
          { $set: req.body },
          { new: true },
          async (err, data) => {
            if (err) throw err
            if (req.body.stepCompleted) {
              await businessUserModel.findByIdAndUpdate(
                { _id: req.body.userId },
                { stepCompleted: req.body.stepCompleted },
              );
            }
            res.status(200).json({
              status: true,
              message: "business Details successfully updated",
            });
          }
        );
      } else {
        res.status(400).json({
          status: false,
          message: "Please select atleast one category",
        });
      }
    } catch (err) {
      throw err
    }
  },
  getBusiness: async (req, res) => {
    try {
      let query = { status: true }
      const { id, businessId } = req.query;

      if (id) {
        query.userId = id
      }
      if (businessId) {
        query._id = businessId
      }

      let check = await businessModel.find(query).sort({ _id: -1 });

      return res.status(200).json({
        status: true,
        message: "Business details found successfully",
        data: check,
      });

    } catch (err) {
      throw err
    }
  },
  deleteBusiness: async (req, res) => {
    try {
      const id = req.params.id;

      const deletedBusiness = await businessModel.findByIdAndDelete(id);

      if (!deletedBusiness) {
        return res.status(404).json({
          status: false,
          message: "Business not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Business Details successfully deleted",
        data: deletedBusiness,
      });
    } catch (err) {
      throw err
    }
  },
};

