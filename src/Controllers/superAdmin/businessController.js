const businessModel = require("../../Model/business");
const businessUserModel = require("../../Model/businessUser");
const branchLocationModel = require("../../Model/branchLocation");
const businessCatagory = require("../../Model/businessCatagory");
const businessService = require("../../Model/businessService")
const businessServiceModel = require("../../Model/businessService");
const serviceCategoryModel = require("../../Model/serviceCategory");
const membershipModel = require("../../Model/membership");
const packagesModel = require("../../Model/packages");
const TeamMemberModel = require("../../Model/teamMember");
const TeamTitleModel = require("../../Model/teamTitle");
const businessAmenitiesModel = require("../../Model/amenities");
const clientModel = require("../../Model/client");
const functions = require("../../../functions");

exports.addbusiness = {
  createbusiness: async (req, res) => {
    try {
      let { businessName, country, businessCatagoryId } = req.body;
      const businessAccountNo = await functions.createBusinessId()

      let data = await businessModel.create({ businessName, country, businessCatagoryId, businessAccountNo });
      res.status(200).json({
        message: "createbusiness successfully !",
        status: true,
        data: data
      })
    } catch (err) {
      res.status(500).json({
        message: err.messaeg,
        status: false
      })
    }
  },
  getbusiness: async (req, res) => {
    try {
      let data = await businessModel.find({})
        .select({ originalAssignServiceArray: 0 })
        .populate({
          path: "businessCatagoryId",
          select: { BusinessCategoryName: 1 }
        }).sort({ _id: -1 });
      res.status(200).json({
        message: "businessCatagory successfully get!",
        status: true,
        data: data
      })
    } catch (err) {
      res.status(500).json({
        message: err.messaeg,
        status: false
      })
    }
  },
  deletebusiness: async (req, res) => {
    try {
      let userId = req.params.id
      let business = await businessModel.findByIdAndDelete(userId);
      let user = await businessUserModel.findOneAndDelete({ _id: business.userId });
      let branch = await branchLocationModel.deleteMany({ businessId: userId });
      let service = await businessServiceModel.deleteMany({ businessId: userId });
      let serviceCategory = await serviceCategoryModel.deleteMany({ businessId: userId });
      let membership = await membershipModel.deleteMany({ businessId: userId });
      let packages = await packagesModel.deleteMany({ businessId: userId });
      let teamMember = await TeamMemberModel.deleteMany({ businessId: userId });
      // let teamTitle = await TeamTitleModel.deleteMany({businessId:userId})
      let businessAmenities = await businessAmenitiesModel.deleteMany({ businessId: userId })
      let client = await clientModel.deleteMany({ businessId: userId })
      res.status(200).json({
        message: "delete data successfully",
        status: true
      })
      // Retrieve business data
      // try {
      //   const businessData = await businessModel.findByIdAndDelete(req.params.id).exec();
      //   if (!businessData) {
      //     return res.status(404).json({
      //       message: "Business data not found",
      //       status: false,
      //     });
      //   }
      //   await businessUserModel.findByIdAndDelete(businessData.userId);
      //   await branchLocationModel.findOneAndDelete({ businessId: req.params.id });
      //   await businessService.findOneAndDelete({ businessId: req.params.id });
      //   res.status(200).json({
      //     message: "Delete data successfully!",
      //     status: true,
      //   });
      // } catch (err) {
      //   console.error(err);
      //   res.status(500).json({
      //     message: "An error occurred while deleting data",
      //     status: false,
      //   });
      // }
    } catch (err) {
      throw err
    }



  },
  businessInfostatus: async (req, res) => {
    try {
      const upload = await functions.statusUpdate(req.params.id, businessModel);
      res.json(upload)
    } catch (err) {
      res.status(500).json({
        message: err.message,
        status: false
      });
    }

  },
  //   branch list
  getBranchList: async (req, res, next) => {
    try {
      const data = await branchLocationModel.find({})
        .populate([
          { path: "businessId", select: { businessName: 1, country: 1, businessAccountNo: 1 } },
        ]).sort({ _id: -1 }).lean().exec();

      res.status(200).json({
        status: true,
        message: "All Branch location details found successfully",
        data: data,
      });

    } catch (error) {
      throw error;
    }
  },
  //  category list api
  getCatagory_list: async (req, res) => {
    try {
      let value = await businessCatagory.find({});
      if (value.length > 0) {
        res.status(200).json({
          status: true,
          message: "gettig single case detail",
          data: value
        })
      } else {
        res.status(401).json({
          status: true,
          message: "gettig all case detail",
          data: value
        })
      }
    } catch (err) {
      if (err) throw err;
    }
  },


}
