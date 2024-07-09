const mongoose = require("mongoose");
const businessPrice = require("../../Model/businessPrice");
const businessService = require("../../Model/businessService");
const teamMemberModel = require("../../Model/teamMember");
const branchLocationModel = require("../../Model/branchLocation");
const functions = require("../../../functions");

exports.businessPrice = {
  createBusinessPrice: async (req, res) => {
    try {
      let responseArray = []
      let payload = {
        countryId: req.body.countryId,
        businessId: req.body.businessId,
        serviceId: req.body.serviceId,
        serviceCatagoryId: req.body.serviceCatagoryId,
        branchId: req.body.branchId,
        serviceProvider: req.body.serviceProvider,
        createdBy: req.user.firstName + ' ' + req.user.lastName,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };

      await businessPrice.deleteMany({ _id: { $in: req.body.deletePrices } });

      // req.body.array.map(async obj => {
      for (const obj of req.body.array) {

        payload.duration = obj.duration

        let payload2 = JSON.parse(JSON.stringify(payload))

        if (obj?.season?.length > 0) {
          // obj.season.map(async seas => {
          for (const seas of obj.season) {

            payload2.seasonType = seas.seasonType
            payload2.seasonPrice = seas.seasonPrice

            if (seas.priceId) {
              await businessPrice.findOneAndUpdate(
                { _id: seas.priceId },
                { $set: payload2 },
              );

            } else {
              let response = await new businessPrice(payload2).save()
              responseArray.push(response)
            }
          }
          // })
        }
        // })
      }
      res.status(200).json({
        status: true,
        message: "Successfully created Price",
        data: responseArray
      });
    } catch (err) {
      res.send(err.message)
    }
  },
  changePriceStatus: async (req, res) => {
    try {
      businessPrice.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: { isActive: req.body.isActive } },
        { new: true },
        (err, data) => {
          if (err) throw err
          res.status(200).json({
            status: true,
            message: "Price status changed successfully",
            data: data,
          })
        }
      )
    } catch (err) {
      throw err;
    }
  },
  getBusinessPrice: async (req, res) => {
    try {
      let { serviceId, businessId, branchId, _id, type, bookingDate, bookingTime } = req.query

      const branch = await branchLocationModel.findOne({ _id: branchId })

      let query = { status: true }
      if (type) {
        query = {}
      }

      let value;

      if (businessId) {
        query.businessId = ObjectId(businessId)
      }
      if (branchId) {
        query.branchId = ObjectId(branchId)
      }
      if (serviceId) {
        query.serviceId = ObjectId(serviceId)
      }
      if (_id) {
        query._id = ObjectId(_id)
      }


      if (type == "package") {
        value = await businessPrice.aggregate([
          {
            $match: query
          },
          {
            $lookup: {
              from: 'businessservices',
              localField: 'serviceId',
              foreignField: '_id',
              as: 'service',
            },
          },
          {
            $unwind: '$service',
          },
          {
            $lookup: {
              from: 'servicecatagories',
              localField: 'service.serviceCatagoryId',
              foreignField: '_id',
              as: 'serviceCatagory',
            },
          },
          {
            $unwind: '$serviceCatagory',
          },
          {
            $group: {
              _id: '$serviceCatagory._id',
              categoryName: { $first: '$serviceCatagory.serviceCategoryName' },
              count: { $sum: 1 },
              data: { $push: '$$ROOT' },
            },
          },
        ]);

        const requestedDay = functions.getRequestedDayName(bookingDate)
        let offPeakHours;

        branch?.offPeakHours?.map(day => {
          if (day?.dayName === requestedDay) {
            offPeakHours = {
              from: day?.from,
              to: day?.to
            }
          }
        })

        if (offPeakHours) {
          const bookingDateTime = new Date(`${bookingDate}T${bookingTime}:00.000Z`);
          const offPeakStart = new Date(`${bookingDate}T${offPeakHours?.from}:00.000Z`);
          const offPeakEnd = new Date(`${bookingDate}T${offPeakHours?.to}:00.000Z`);

          console.log("wwwwwwwwwwwwwwwwwwwwwwww", bookingDateTime, offPeakStart, offPeakEnd)

          if (!(bookingDateTime >= offPeakStart && bookingDateTime <= offPeakEnd)) {
            value = value?.map(service => {
              const prices = service?.data?.filter(obj => {
                return obj?.seasonType != 'offPeakPrice'
              })
              service.data = prices
              return service;
            })
          }
        }


      } else {
        value = await businessPrice.find(query).sort({ _id: -1 })
          .populate([
            {
              path: 'serviceId',
              model: 'businessService',
              populate: {
                path: 'serviceCatagoryId',
                model: 'serviceCatagory',
              },
            }
          ]).populate({
            path: 'businessId',
            select: { businessName: 1 },
          }).populate({
            path: 'branchId',
            select: { branchName: 1 },
          })
      }

      res.status(200).json({
        status: true,
        message: "Business price details fetched successfully",
        data: value
      })
    } catch (err) {
      if (err) throw err;
    }
  },
  deleteBusinessPrice: async (req, res) => {
    try {
      const id = req.params.id;

      businessPrice.findByIdAndDelete(id, async (err, data) => {
        if (err) throw err

        const remainingPrices = await businessPrice.findOne({ serviceId: data.serviceId })
        if (!remainingPrices) {
          const service = businessService.findOneAndDelete({ _id: data.serviceId })
          const teamMember = teamMemberModel.findOneAndUpdate(
            {},
            { $pull: { serviceId: data.serviceId } }
          )
          await Promise.all([service, teamMember])
        }

        res.status(200).json({
          status: true,
          message: "Price details successfully deleted",
          data: data,
        });
      });
    } catch (err) {
      throw err
    }
  },
  updateStatus: async (req, res) => {
    try {
      const upload = await functions.statusUpdate(req.params.id, businessPrice);
      res.json(upload)
    } catch (err) {
      throw err
    }
  },
}