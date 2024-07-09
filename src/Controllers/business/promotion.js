const mongoose = require("mongoose");
const moment = require('moment-timezone');
const promotion = require("../../Model/promotion");

exports.promotion = {
  createPromotion: async (req, res) => {
    try {
      let payload = {
        businessId: req.body.businessId,
        branchId: req.body.branchId,
        countryId: req.body.countryId,
        promotionType: req.body.promotionType,
        promotionName: req.body.promotionName,
        unit: req.body.unit,
        frequency: req.body.frequency,
        dateFrom: req.body.dateFrom,
        dateTo: req.body.dateTo,
        startTimeFrom: req.body.startTimeFrom,
        endTimeTo: req.body.endTimeTo,
        regularPrice: req.body.regularPrice,
        discount: req.body.discount,
        discountCode: req.body.discountCode,
        promotionalPrice: req.body.promotionalPrice,
        LimitUsePerClient: req.body.LimitUsePerClient,
        details: req.body.details,
        termsAndCondition: req.body.termsAndCondition,
        redemptionInstruction: req.body.redemptionInstruction,
        cancellationPolicy: req.body.cancellationPolicy,
        createdBy: req.user.firstName + ' ' + req.user.lastName,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };

      if (req.files?.length > 0) {
        const newImages = req.files.map(file => file.location)
        payload.image = newImages
      }
      if (req.body.priceId) {
        payload.priceId = JSON.parse(req.body.priceId)
      }
      if (req.body.serviceCategory) {
        payload.serviceCategory = JSON.parse(req.body.serviceCategory)
      }
      if (req.body.minimumPurchaseAmount) {
        payload.minimumPurchaseAmount = JSON.parse(req.body.minimumPurchaseAmount)
      }
      if (req.body.LimitNumberOfUses) {
        payload.LimitNumberOfUses = JSON.parse(req.body.LimitNumberOfUses)
      }

      const Promotion = new promotion(payload);
      const savedPromotion = await Promotion.save();

      res.status(200).json({
        status: true,
        message: "Successfully created Promotion",
        data: savedPromotion,
      });
    } catch (err) {
      if (err) throw err;
    }
  },
  updatePromotion: async (req, res) => {
    try {
      const id = req.params.id;
      let payload = {
        businessId: req.body.businessId,
        countryId: req.body.countryId,
        branchId: req.body.branchId,
        promotionType: req.body.promotionType,
        promotionName: req.body.promotionName,
        unit: req.body.unit,
        frequency: req.body.frequency,
        dateFrom: req.body.dateFrom,
        dateTo: req.body.dateTo,
        startTimeFrom: req.body.startTimeFrom,
        endTimeTo: req.body.endTimeTo,
        regularPrice: req.body.regularPrice,
        discount: req.body.discount,
        discountCode: req.body.discountCode,
        LimitUsePerClient: req.body.LimitUsePerClient,
        promotionalPrice: req.body.promotionalPrice,
        details: req.body.details,
        termsAndCondition: req.body.termsAndCondition,
        redemptionInstruction: req.body.redemptionInstruction,
        cancellationPolicy: req.body.cancellationPolicy,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
        isActive: req.body.isActive,
      };

      if (req.body.priceId) {
        payload.priceId = JSON.parse(req.body.priceId)
      }
      if (req.body.serviceCategory) {
        payload.serviceCategory = JSON.parse(req.body.serviceCategory)
      }
      if (req.body.minimumPurchaseAmount) {
        payload.minimumPurchaseAmount = JSON.parse(req.body.minimumPurchaseAmount)
      }
      if (req.body.LimitNumberOfUses) {
        payload.LimitNumberOfUses = JSON.parse(req.body.LimitNumberOfUses)
      }


      // if (req.files?.length > 0) {
      //   const newImages = req.files.map(file => file.location)
      //   let allImages = newImages

      //   if (req.body.oldImages) {
      //     if (req.body.oldImages) {
      //       const oldimages = JSON.parse(req.body.oldImages)
      //       allImages = [...oldimages, ...newImages]
      //     }
      //   }

      //   payload.image = allImages
      // }

      let allImages = []
      if (req.files?.length > 0) {
        allImages = req.files.map(file => file.location)

        if (req.body.oldImages) {
          const oldimages = JSON.parse(req.body.oldImages)
          allImages = [...oldimages, ...allImages]
        }
        payload.image = allImages

      } else if (req.body.oldImages) {
        allImages = JSON.parse(req.body.oldImages)
        payload.image = allImages
      }

      promotion.findByIdAndUpdate(
        id,
        payload,
        { new: true },
        (err, data) => {
          if (err) throw err
          res.status(200).json({
            status: true,
            message: "Promotion Details successfully updated",
            data: data,
          });
        }
      );
    } catch (err) {
      throw err;
    }
  },
  getPromotion: async (req, res) => {
    try {
      let query = { status: true }
      let { businessId, branchId, _id, priceId, bookingDate, bookingTime, timeZone } = req.query

      if (_id) {
        query._id = _id
      }
      if (businessId) {
        query.businessId = businessId
      }
      if (branchId) {
        query.branchId = branchId
      }
      if (priceId) {
        query['priceId.id'] = priceId
      }


      let promotions = await promotion.find(query).sort({ _id: -1 })
        .populate([
          {
            path: 'businessId',
            model: 'business',
          },
          {
            path: 'serviceCategory.id',
            model: 'serviceCatagory',
          },
          {
            path: 'priceId.id',
            model: 'businessPrice',
            populate: {
              path: 'serviceId',
              model: 'businessService',
              populate: {
                path: 'serviceCatagoryId',
                model: 'serviceCatagory',
              }
            }
          },
        ])

      const filteredPromotions = []
      await Promise.all(promotions.map(async promotion => {

        let check = true;
        if (bookingDate && bookingTime && timeZone) {

          const bookTime = new Date(bookingDate.concat("T", bookingTime, ":00.000Z"));
          const start = new Date(promotion?.dateFrom.concat("T", promotion?.startTimeFrom || '00:00', ":00.000Z"));
          const end = new Date(promotion?.dateTo.concat("T", promotion?.endTimeTo || '00:00', ":00.000Z"));

          if (!(bookTime >= start && bookTime <= end)) {
            check = false;
          }


          if (promotion?.promotionType === 'Last minute offer') {
            let start = new Date()
            let end = new Date(start)
            // console.log("tttttttttttttttttttt", end, promotion?.unit)

            if (promotion?.frequency === 'Minutes') {
              end = new Date(end.setMinutes(end.getMinutes() + +promotion?.unit))

            } else if (promotion?.frequency === 'Hours') {
              end = new Date(end.setHours(end.getHours() + +promotion?.unit))

            } else if (promotion?.frequency === 'Days') {
              end = new Date(end.setDate(end.getDate() + +promotion?.unit))
            }

            const userDateTime = `${bookingDate}T${bookingTime}`;
            let newBookingUtcDateTime = moment.tz(userDateTime, timeZone).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
            newBookingUtcDateTime = new Date(newBookingUtcDateTime)

            // console.log("qqqqqqqqqqqqqqqqq", newBookingUtcDateTime, start, end)

            if (!(newBookingUtcDateTime >= start && newBookingUtcDateTime <= end)) {
              check = false;
              // console.log("tttttttttttttt check first", check)
            }

          } else if (promotion?.promotionType === 'Dynamic pricing') {

            let bookingDat = new Date(bookingDate)
            let start = new Date(new Date().toISOString().split('T')[0])
            let end = new Date(start)

            promotion?.priceId?.map(priceObj => {

              let discount = priceObj?.discount
              const sorted = priceObj?.discountCriteria?.sort((a, b) => b.discount - a.discount)

              for (let discountObj of sorted) {

                if (discountObj?.frequency === 'Days') {
                  end = new Date(end.setDate(end.getDate() + +discountObj?.unit))

                } else if (discountObj?.frequency === 'Weeks') {
                  end = new Date(end.setDate(end.getDate() + +discountObj?.unit * 7))

                } else if (discountObj?.frequency === 'Months') {
                  end = new Date(end.setMonth(end.getMonth() + +discountObj?.unit))

                } else if (discountObj?.frequency === 'Years') {
                  end = new Date(end.setFullYear(end.getFullYear() + +discountObj?.unit))
                }

                console.log("aaaaaaaaaaaaaaaaaaa", bookingDat, start, end)

                if (bookingDat >= start && bookingDat <= end) {
                  discount = `${discountObj.discount} %`
                  break;
                }
              }

              priceObj.discount = discount
            })
          }

          if (check) {
            if (promotion?.LimitNumberOfUses?.active) {
              if (promotion?.redeemCount >= promotion?.LimitNumberOfUses?.maxUser) {
                check = false
              }
            }
          }
        }

        if (check) {
          filteredPromotions.push(promotion)
        }
      }))

      res.status(200).json({
        status: true,
        message: "Listed promotion detail successfully",
        data: filteredPromotions
      })
    } catch (err) {
      if (err) throw err;
    }

  },
  deletedPromotion: async (req, res) => {
    try {
      const id = req.params.id;

      const deletedPromotion = await promotion.findByIdAndDelete(id);

      if (!deletedPromotion) {
        return res.status(404).json({
          status: false,
          message: "Promotion not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Promotion Details successfully deleted",
        data: deletedPromotion,
      });
    } catch (err) {
      throw err
    }
  },
}