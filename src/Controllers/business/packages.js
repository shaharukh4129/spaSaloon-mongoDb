const mongoose = require("mongoose");
const packages = require("../../Model/packages");
const businessPrice = require("../../Model/businessPrice");
const functions = require("../../../functions");
exports.packages = {
  createPackages: async (req, res) => {
    try {
      const existingPackages = await packages.findOne(
        {
          PackageName: req.body.PackageName,
          businessId: req.body.businessId
        });
      if (existingPackages) {
        return res.status(400).json({
          status: false,
          message: "Package name already exists",
        });
      } else {
        const payload = {
          businessId: req.body.businessId,
          countryId: req.body.countryId,
          serviceId: req.body.serviceId,
          branchId: req.body.branchId,
          priceId: req.body.priceId,
          PackageName: req.body.PackageName,
          PackageDescription: req.body.PackageDescription,
          TermsAndConditions: req.body.TermsAndConditions,
          ServiceAvailableFor: req.body.ServiceAvailableFor,
          PackageAfterCareDescription: req.body.PackageAfterCareDescription,
          typeOfService: req.body.typeOfService,
          Services: req.body.Services,
          totalPrice: req.body.totalPrice,
          finalPrice: req.body.finalPrice,
          createdBy: req.user.firstName + ' ' + req.user.lastName,
          updatedBy: req.user.firstName + ' ' + req.user.lastName,
        };

        // if (payload?.typeOfService?.type === 'duration') {

        //   payload?.Services?.map(async service => {
        //     const prices = await businessPrice.find({ serviceId: ObjectId(service?.serviceId) }).select({ _id: 1 });

        //     const priceArray = []
        //     let payload2 = JSON.parse(JSON.stringify(payload))

        //     prices?.map(price => {
        //       const priceObj = {
        //         serviceId: service?.serviceId,
        //         priceId: price._id,
        //         noOfServices: service.noOfServices,
        //       }
        //       priceArray.push(priceObj)
        //     })

        //     payload2.Services = priceArray
        //     await new packages(payload2).save();

        //   })
        // } else {
        // }

        const data = await new packages(payload).save();

        res.status(200).json({
          status: true,
          message: "Successfully created Packages",
          data: data
        });
      }

    } catch (err) {
      if (err) throw err;
    }
  },
  updatePackages: async (req, res) => {
    try {
      const id = req.params.id;
      let payload = {
        businessId: req.body.businessId,
        countryId: req.body.countryId,
        branchId: req.body.branchId,
        serviceId: req.body.serviceId,
        priceId: req.body.priceId,
        PackageName: req.body.PackageName,
        PackageDescription: req.body.PackageDescription,
        TermsAndConditions: req.body.TermsAndConditions,
        ServiceAvailableFor: req.body.ServiceAvailableFor,
        PackageAfterCareDescription: req.body.PackageAfterCareDescription,
        typeOfService: req.body.typeOfService,
        Services: req.body.Services,
        totalPrice: req.body.totalPrice,
        finalPrice: req.body.finalPrice,
        status: req.body.status,
        isActive: req.body.isActive,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };

      let response;
      if (payload?.typeOfService?.type === 'duration') {
        const priceArray = []

        let payload2 = JSON.parse(JSON.stringify(payload))

        await Promise.all(payload?.Services?.map(async service => {
          const prices = await businessPrice.find({ serviceId: ObjectId(service?.serviceId) }).select({ _id: 1 });


          await Promise.all(prices?.map(price => {
            const priceObj = {
              serviceId: service?.serviceId,
              priceId: price._id,
              noOfServices: service.noOfServices,
            }
            priceArray.push(priceObj)
          }))
        }))

        payload2.Services = priceArray

        response = await packages.findByIdAndUpdate(
          id,
          payload2,
          { new: true }
        );

      } else {
        response = await packages.findByIdAndUpdate(
          id,
          payload,
          { new: true }
        );
      }

      if (!response) {
        return res.status(404).json({
          status: false,
          message: "Packages not found",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Packages Details successfully updated",
          data: response,
        });
      }

    } catch (err) {
      throw err;
    }
  },
  getPackages: async (req, res) => {
    try {
      let { businessId, branchId, type, _id } = req.query
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

      let value = await packages.find(query).sort({ _id: -1 })
        .populate([
          {
            path: 'Services.priceId',
            model: 'businessPrice',
            populate: {
              path: 'serviceId',
              model: 'businessService',
              populate: {
                path: 'serviceCatagoryId',
                model: 'serviceCatagory',
              }
            }
          }, { path: "businessId", select: { businessName: 1, businessAccountNo: 1 } }
        ]).populate({
          path: "branchId",
          select: { branchName: 1 },
        })

      res.status(200).json({
        status: true,
        message: "Listed package detail successfully",
        data: value
      })

    } catch (err) {
      if (err) throw err;
    }

  },
  deletePackages: async (req, res) => {
    try {
      const id = req.params.id;
      const deletedPackages = await packages.findByIdAndDelete(id);

      if (!deletedPackages) {
        return res.status(404).json({
          status: false,
          message: "Packages not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Packages Details successfully deleted",
        data: deletedPackages,
      });
    } catch (err) {
      throw err
    }
  },
  updatePackageStatus: async (req, res) => {
    try {
      const upload = await functions.statusUpdate(req.params.id, packages);
      res.json(upload)
    } catch (err) {
      throw err
    }
  },
};