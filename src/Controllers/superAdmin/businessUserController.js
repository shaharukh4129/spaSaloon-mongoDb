const businessModel = require("../../Model/business");
const businessUserModel = require("../../Model/businessUser");
const branchLocationModel = require("../../Model/branchLocation");
const businessServiceModel = require("../../Model/businessService");
const serviceCategoryModel = require("../../Model/serviceCategory");
const membershipModel = require("../../Model/membership");
const packagesModel = require("../../Model/packages");
const TeamMemberModel = require("../../Model/teamMember");
const TeamTitleModel = require("../../Model/teamTitle");
const businessAmenitiesModel = require("../../Model/amenities");
const clientModel = require("../../Model/client");
const functions = require("../../../functions");

let businessUserController = {
  addnewbusinessuser: async (req, res) => {
    try {
      let { firstName, lastName, email, mobile, stepCompleted, emailVerified, countryCode, dialCode, country } = req.body;
      let check = await businessUserModel.findOne({ email: email });
      // const latest = await businessUserModel.findOne({ stepCompleted: { $gte: 2 } }, { customerAccountNo: 1 }).sort({ _id: -1 })
      // let count;
      // if (latest?.customerAccountNo) {
      //   count = Number((latest.customerAccountNo).slice(-5))
      // } else {
      //   count = 0
      // }
      // let customerAccountNo = dialCode + (String(count + 1).padStart(5, '0'))

      const customerAccountNo = await functions.createBusinessUserId()

      let payload = {
        firstName,
        lastName,
        email,
        country,
        mobile,
        stepCompleted: 5,
        emailVerified: true,
        customerAccountNo,
      }
      if (!check) {
        let data = await businessUserModel.create({ firstName, lastName, email, mobile, stepCompleted, emailVerified, customerAccountNo, country, userType: "businessUser" })
        res.status(200).json({ message: "Add newbusinessuser succesfully", status: true, data: data })
      } else {
        res.status(201).json({ message: "email already exists !", status: false, })
      }
    } catch (err) {
      res.status(500).json({
        message: err.message,
        status: false
      })
    }
  },
  getbusinessUser: async (req, res) => {
    try {
      const data = await businessUserModel.find({}).sort({ _id: -1 });

      res.status(200).json({
        message: "get business user list succesfully ",
        status: true,
        data: data
      })
    } catch (err) {
      res.status(500).json({
        messgae: err.messaeg,
        status: false
      })
    }
  },
  deletebusiness: async (req, res) => {
    try {
      const userId = req.params.id;
      // let user = await businessUserModel.findById({_id:userId});
      // console.log(user,"asdsad11111111111");
      let user = await businessUserModel.findByIdAndDelete({ _id: userId });
      let business = await businessModel.findOneAndDelete({ userId: userId });
      let branch = await branchLocationModel.deleteMany({ businessId: business?._id });
      let service = await businessServiceModel.deleteMany({ businessId: business?._id });
      let serviceCategory = await serviceCategoryModel.deleteMany({ businessId: business?._id });
      let membership = await membershipModel.deleteMany({ businessId: business?._id });
      let packages = await packagesModel.deleteMany({ businessId: business?._id });
      let teamMember = await TeamMemberModel.deleteMany({ businessId: business?._id });
      // let teamTitle = await TeamTitleModel.deleteMany({businessId:business._id})
      let businessAmenities = await businessAmenitiesModel.deleteMany({ businessId: business?._id })
      let client = await clientModel.deleteMany({ businessId: business?._id })
      res.status(200).json({
        message: "delete data successfully",
        status: true
      })
    } catch (err) {
      throw err
    }
    // try {
    //   const userId = req.params.id;
    //   const [businessUser, business] = await Promise.all([
    //     businessUserModel.findOneAndDelete({ _id: userId }),
    //     businessModel.findOneAndDelete({ userId }),
    //   ]);
    //   if (business === null) {
    //     res.status(200).json({
    //       message: "Delete data successfully",
    //       status: true,
    //     })
    //   } else {
    //     await branchLocationModel.findOneAndDelete({ businessId: business._id });
    //     res.status(200).json({
    //       message: "Delete data successfully",
    //       status: true
    //     })
    //   }
    // } catch (err) {
    //   res.status(500).json({
    //     message: err.message,
    //     status: false,
    //   });
    // }

  },
  statusUpdateBusinessUser: async (req, res) => {
    try {
      const upload = await functions.statusUpdate(req.params.id, businessUserModel);
      res.json(upload)
    } catch (err) {
      res.status(500).json({
        messgae: err.messaeg,
        status: false
      })
    }
  },
  businessUserUpdateData: async (req, res) => {
    try {
      const { firstName, lastName, email, mobile } = req.body;
      const businessId = req.params.id; const existingBusiness = await businessUserModel.findById(businessId);
      if (!existingBusiness) {
        return res.status(404).json({
          message: "No data found",
          status: false,
        });
      }
      let payload = { firstName, lastName, email, mobile };
      const updatedUserData = await businessUserModel.findByIdAndUpdate({ _id: businessId }, { $set: payload }, { new: true });
      res.status(200).json({
        message: "Update data successfully",
        status: true,
        data: updatedUserData,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
        status: false,
      });
    }

  },

}
module.exports = businessUserController;
