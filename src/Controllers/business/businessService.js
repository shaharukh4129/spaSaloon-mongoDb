const mongoose = require("mongoose")
const businessService = require("../../Model/businessService")
const serviceCategory = require("../../Model/serviceCategory")
const businessPrice = require("../../Model/businessPrice")
const path = require("path");
const fs = require("fs");
const functions = require("../../../functions");

exports.businessService = {
  createBusinessService: async (req, res) => {
    try {
      const existingbusinessName = await businessService.findOne(
        {
          serviceName: req.body.serviceName,
          serviceCatagoryId: req.body.serviceCatagoryId,
          businessId: req.body.businessId
        });
      if (existingbusinessName) {
        return res.status(400).json({
          status: false,
          message: "Service name already exists",
        });
      } else {
        const payload = {
          businessCatagoryId: req.body.businessCatagoryId,
          countryId: req.body.countryId,
          businessId: req.body.businessId,
          serviceCatagoryId: req.body.serviceCatagoryId,
          branchId: req.body.branchId,
          isServiceGlobal: req.body.isServiceGlobal,
          serviceName: req.body.serviceName,
          introductionPrice: req.body.serviceCategory,
          serviceDescription: req.body.serviceDescription,
          serviceAvilableFor: req.body.serviceAvilableFor,
          ServiceAftercareDescription: req.body.ServiceAftercareDescription,
          serviceTag: req.body.serviceTag,
          createdBy: req.user._id,
          updatedBy: req.user._id,
        };
        const latest = await businessService.findOne({ businessId: req.body.businessId }, { serviceIdNo: 1 }).sort({ _id: -1 })

        let count;
        if (latest?.serviceIdNo) {
          count = +latest.serviceIdNo
        } else {
          count = 0
        }
        let serviceIdNo = (String(count + 1).padStart(3, '0'))

        payload.serviceIdNo = serviceIdNo;

        const Service = new businessService(payload);
        const savedService = await Service.save();

        res.status(200).json({
          status: true,
          message: "Successfully created business Service",
          data: savedService,
        });
      }

    } catch (err) {
      if (err) throw err;
    }
  },
  updateBusinessService: async (req, res) => {
    try {
      const id = req.params.id;
      const payload = {
        businessCatagoryId: req.body.businessCatagoryId,
        amenitiesId: req.body.amenitiesId,
        countryId: req.body.countryId,
        businessId: req.body.businessId,
        serviceCatagoryId: req.body.serviceCatagoryId,
        branchId: req.body.branchId,
        isServiceGlobal: req.body.isServiceGlobal,
        serviceName: req.body.serviceName,
        serviceCategory: req.body.serviceCategory,
        serviceDescription: req.body.serviceDescription,
        serviceAvilableFor: req.body.serviceAvilableFor,
        status: req.body.status,
        isActive: req.body.isActive,
        ServiceAftercareDescription: req.body.ServiceAftercareDescription,
        serviceTag: req.body.serviceTag,
        updatedBy: req.user._id,
      };


      const updatedBusinessService = await businessService.findByIdAndUpdate(
        { _id: id },
        { $set: payload },
        { new: true }
      );

      if (!updatedBusinessService) {
        return res.status(404).json({
          status: false,
          message: "Business Service not found",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Business service Details successfully updated",
          data: updatedBusinessService,
        });
      }

    } catch (err) {
      throw err;
    }
  },
  getBusinessService: async (req, res) => {
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

      let value = await businessService.find(query).sort({ _id: -1 })
        .populate("serviceCatagoryId").populate({ path: "businessId", select: { businessName: 1, businessAccountNo: 1 } })
        .populate({
          path: "branchId",
          select: { branchName: 1 },
        })
      res.status(200).json({
        status: true,
        message: "Listed business service detail successfully",
        data: value
      })
    } catch (err) {
      if (err) throw err;
    }
  },
  deleteBusinessService: async (req, res) => {
    try {
      const id = req.params.id;
      const deletedService = businessService.findByIdAndDelete(id);
      const deletedPrice = businessPrice.deleteMany({ serviceId: id });
      const [service, price] = await Promise.all([deletedService, deletedPrice])

      res.status(200).json({
        status: true,
        message: "Business Service Details successfully deleted",
        data: service,
      });

    } catch (err) {
      throw err
    }
  },
  uploadBusinessService: async (req, res) => {
    try {
      const { branchId, businessId } = req.query;
      let columnToKey = {
        A: 'isServiceGlobal',
        B: 'serviceName',
        C: 'serviceCategory',
        D: 'serviceDescription',
        E: 'serviceAvilableFor',
        F: 'ServiceAftercareDescription',
        G: 'serviceTag',
        H: 'duration',
        I: 'introductionPrice',
        J: 'memberPrice',
        K: 'regularPrice',
        L: 'offPeakPrice',
        // M: 'offPeakHoursFrom',
        // N: 'offPeakHoursTo',
      };

      let newData = functions.excelToJsonData(req.file.path, columnToKey);
      //Deleting uploaded excel
      const filePath = path.join(__dirname + `/../../../public/${req.file.filename}`)
      fs.unlinkSync(filePath)

      if (newData) {
        const filterdNewData = functions.checkMissingValues(columnToKey, newData?.sheet1)
        newData = filterdNewData.valid
        const invalid = filterdNewData.invalid


        let serviceIdNo = await functions.createCustomNumber(businessService, businessId, "serviceIdNo");
        let invalidServiceCategoryData = []

        await Promise.all(newData.map(async neww => {
          const checkServiceCategory = await serviceCategory.findOne({ serviceCategoryName: neww.serviceCategory })

          if (checkServiceCategory) {
            neww.isServiceGlobal = neww.isServiceGlobal.toLowerCase();
            neww.businessId = businessId;
            neww.branchId = branchId;
            neww.serviceIdNo = serviceIdNo
            neww.isActive = true
            neww.status = true
            neww.createdBy = req.user.firstName + ' ' + req.user.lastName
            neww.updatedBy = req.user.firstName + ' ' + req.user.lastName
            neww.serviceTag = neww.serviceTag.replace(/\s+/g, '').split(',');

            const payload = {
              isServiceGlobal: neww.isServiceGlobal,
              serviceName: neww.serviceName,
              serviceCatagoryId: checkServiceCategory._id,
              serviceDescription: neww.serviceDescription,
              serviceAvilableFor: neww.serviceAvilableFor,
              ServiceAftercareDescription: neww.ServiceAftercareDescription,
              serviceTag: neww.serviceTag,
            };
            const service = await new businessService(payload).save()

            if (service) {
              const payload2 = {
                businessId: neww.businessId,
                branchId: [neww.branchId],
                serviceId: service._id,
                serviceCatagoryId: checkServiceCategory._id,
                duration: neww.duration,
                // offPeakHours: {
                //   from: neww.offPeakHoursFrom,
                //   to: neww.offPeakHoursTo,
                // },
                isActive: true,
                status: true,
                createdBy: req.user.firstName + ' ' + req.user.lastName,
                updatedBy: req.user.firstName + ' ' + req.user.lastName,
              };

              const priceObject = {
                introductionPrice: neww.introductionPrice,
                memberPrice: neww.memberPrice,
                regularPrice: neww.regularPrice,
                offPeakPrice: neww.offPeakPrice
              }

              for (const key in priceObject) {
                let payload = {
                  seasonType: key,
                  seasonPrice: priceObject[key]
                }
                let payload3 = { ...payload, ...payload2 }

                await new businessPrice(payload3).save()
              }
            }
          } else {
            invalidServiceCategoryData.push(neww)
          }
        }))

        return res.status(200).json({
          status: true,
          message: 'File uploaded and data saved to the database.',
          invalidData: invalid,
          invalidServiceCategoryData,
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Did not find any data in excel.',
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error processing the file.' });
    }
  },
  updateServiceStatus: async (req, res) => {
    try {
      const upload = await functions.statusUpdate(req.params.id, businessPrice);
      res.json(upload)
    } catch (err) {
      throw err
    }
  },
}

