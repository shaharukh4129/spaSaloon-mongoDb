const mongoose = require("mongoose");
const booking = require("../../Model/booking");
const branchLocation = require("../../Model/branchLocation");
const Promotion = require("../../Model/promotion");
const TeamMember = require("../../Model/teamMember");
const Membership = require("../../Model/membership");
const Client = require("../../Model/client");
const functions = require("../../../functions");
const oneHourMiliSec = 3600000

exports.booking = {
  createBooking: async (req, res) => {
    try {

      let requestedDay = functions.getRequestedDayName(req.body?.salectDate)

      const branch = await branchLocation
        .findOne({ _id: req.body?.branchId })
        .select('workingHours notWorkingHours')

      let check = true;
      const bookingStart = new Date(`${req.body?.salectDate}T${req.body?.salectTime}:00.000Z`);
      const bookingEnd = new Date(bookingStart.getTime() + (+req.body?.newBookingDuration * oneHourMiliSec / 60));

      if (branch?.notWorkingHours?.length > 0) {
        for (let date of branch.notWorkingHours) {
          const from = new Date(`${date?.fromDate}T${date?.from || "00:00"}:00.000Z`);
          const to = new Date(`${date?.toDate}T${date?.to || "00:00"}:00.000Z`);
          console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq", bookingStart, bookingEnd, from, to)

          if (
            (bookingStart >= from && bookingStart < to) ||
            (bookingEnd > from && bookingEnd <= to) ||
            (bookingStart <= from && bookingEnd >= to)
          ) {
            check = false;
            break;
          }
        }
      }


      if (branch?.workingHours?.length > 0) {
        if (check) {
          for (let day of branch.workingHours) {
            if (requestedDay === day?.dayName) {
              const from = new Date(`${req.body?.salectDate}T${day?.from}:00.000Z`);
              const to = new Date(`${req.body?.salectDate}T${day?.to}:00.000Z`);

              if (
                (bookingStart >= from && bookingStart <= to) &&
                (bookingEnd >= from && bookingEnd <= to)
              ) {
                check = true;
                break;
              } else {
                check = false;
                break;
              }
            }
          }
        }

        if (check) {

          const payload = {
            businessId: req.body.businessId,
            countryId: req.body.countryId,
            branchId: req.body.branchId,
            services: req.body.services,
            clientId: req.body.clientId,
            packageType: req.body.packageType,
            salectDate: req.body.salectDate,
            salectDateInFormat: new Date(req.body.salectDate),
            salectTime: req.body.salectTime,
            assigned: req.body.assigned,
            notes: req.body.notes,
            bookingStatus: req.body.bookingStatus,
            total: req.body.total,
            finalPrice: req.body.finalPrice,
            createdBy: req.user.firstName + ' ' + req.user.lastName,
            updatedBy: req.user.firstName + ' ' + req.user.lastName,
          };

          let generalAvailablity;
          let isPromotionEligible = true

          // if booking is created by calender for a particular team member
          if (req.body?.bookingFromCalender) {

            // Checking team member general Availablity

            const teamMember = await TeamMember.findOne({ _id: req.body?.services[0]?.TeamMemberId })

            let availablity = await functions.TeamMemberAvailablity(teamMember?.hoursDetail, req.body?.branchId, requestedDay, true)

            for (let obj of availablity) {

              const availableFrom = new Date(req.body.salectDate.concat("T", obj.from, ":00.000Z"));
              const availableTo = new Date(req.body.salectDate.concat("T", obj.to, ":00.000Z"));

              const newBookingTimeFrom = new Date(req.body.salectDate.concat("T", req.body?.salectTime, ":00.000Z"));
              const newBookingTimeTo = new Date(newBookingTimeFrom.getTime() + (+req.body?.newBookingDuration * oneHourMiliSec / 60));

              console.log("tttttttttttttttttttttttttttttttt", availableFrom, availableTo, newBookingTimeFrom, newBookingTimeTo)
              if (newBookingTimeFrom >= availableFrom && newBookingTimeTo <= availableTo) {
                generalAvailablity = true;
                break;
              }
            }


            if (generalAvailablity) {
              // Checking existing bookings
              const existingBooking = await functions.checkExistingBooking(req.body.salectDate, req.body.salectTime, req.body.newBookingDuration, teamMember)
              let isAvailable = existingBooking?.existingBookingCheck
              console.log("ttttttttttttttttttttttttttttttttttt existingBooking", existingBooking)

              if (isAvailable) {
                // Checking promotion eligibility

                const promotionEligibility = await functions.checkPromotionEligibility(req.body?.services, req.body?.businessId, req.body?.clientId)
                // console.log("ttttttttttttttttttttttttttttttttttt promotionEligibility", promotionEligibility)

                isPromotionEligible = promotionEligibility?.isPromotionEligible

                if (isPromotionEligible) {
                  // finally creating booking
                  const savedBooking = await new booking(payload).save();

                  // adding membership to client
                  const client = await Client.findOne({ _id: req.body.clientId })
                  await functions.applyMembershipToClient(req.body.businessId, client)

                  res.status(200).json({
                    status: true,
                    message: "Successfully created Booking",
                    data: savedBooking,
                  });

                } else if (!isPromotionEligible) {
                  res.status(400).json({
                    status: false,
                    message: "Promotion use exceeded",
                    conflict: promotionEligibility?.conflict
                  });
                }
              } else {
                res.status(400).json({
                  status: false,
                  message: "Please check team member existing bookings",
                  conflict: existingBooking?.conflict
                });
              }
            } else {
              res.status(400).json({
                status: false,
                message: "team member does not work on this booking time/duration",
              });
            }
          } else {
            // Checking promotion eligibility
            const promotionEligibility = await functions.checkPromotionEligibility(req.body?.services, req.body?.businessId, req.body?.clientId)
            // console.log("ttttttttttttttttttttttttttttttttttt promotionEligibility", promotionEligibility)

            isPromotionEligible = promotionEligibility?.isPromotionEligible

            if (isPromotionEligible) {
              // finally creating booking
              const savedBooking = await new booking(payload).save();

              // adding membership to client
              const client = await Client.findOne({ _id: req.body.clientId })
              await functions.applyMembershipToClient(req.body.businessId, client)

              res.status(200).json({
                status: true,
                message: "Successfully created Booking",
                data: savedBooking,
              });

            } else if (!isPromotionEligible) {
              res.status(400).json({
                status: false,
                message: "Promotion use exceeded",
                conflict: promotionEligibility?.conflict
              });
            }
          }

        } else {
          res.status(400).json({
            status: false,
            message: "This branch does not operate at this booking time",
          });
        }

      } else {
        res.status(400).json({
          status: false,
          message: "This branch does not operate at this booking time",
        });
      }
    } catch (err) {
      if (err) throw err;
    }
  },
  updateBooking: async (req, res) => {
    try {
      const id = req.params.id;
      let payload = {
        businessId: req.body.businessId,
        countryId: req.body.countryId,
        branchId: req.body.branchId,
        services: req.body.services,
        clientId: req.body.clientId,
        packageType: req.body.packageType,
        salectDate: req.body.salectDate,
        salectTime: req.body.salectTime,
        assigned: req.body.assigned,
        status: req.body.status,
        notes: req.body.notes,
        bookingStatus: req.body.bookingStatus,
        isActive: req.body.isActive,
        total: req.body.total,
        finalPrice: req.body.finalPrice,
        createdAt: new Date(),
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };

      if (req.body.salectDate) {
        payload.salectDateInFormat = new Date(req.body.salectDate)
      }


      let updateQuery = {}

      let oldData = await booking.findOne({ _id: id })
      let bookingHistory = {
        salectDate: oldData?.salectDate,
        salectTime: oldData?.salectTime,
        createdAt: oldData?.createdAt,
        createdBy: oldData?.createdBy,
        bookingStatus: oldData?.bookingStatus,
      }

      let check;
      let onlyReschedule;
      if (req.body?.salectDate) {
        if (req.body.salectDate != oldData?.salectDate) {
          check = true
          onlyReschedule = true
          bookingHistory.reschedule = true
        }
      }

      if (req.body?.salectTime) {
        if (req.body.salectTime != oldData?.salectTime) {
          check = true
          onlyReschedule = true
          bookingHistory.reschedule = true
        }
      }

      if (req.body?.bookingStatus) {
        if (req.body?.bookingStatus != oldData?.bookingStatus) {
          check = true
        }
      }

      if (oldData?.bookingHistory?.length === 0 && onlyReschedule) {
        await booking.findByIdAndUpdate(
          id,
          {
            $push: {
              bookingHistory: {
                salectDate: oldData?.salectDate,
                salectTime: oldData?.salectTime,
                createdAt: oldData?.createdAt,
                createdBy: oldData?.createdBy,
                bookingStatus: oldData?.bookingStatus,
              }
            }
          }
        );
      }

      if (check) {
        updateQuery.$push = { bookingHistory }
      }

      updateQuery.$set = payload
      // console.log("sssssssssssssssssssssssss", updateQuery)

      const updatedBooking = await booking.findByIdAndUpdate(
        id,
        updateQuery,
        { new: true }
      );
      if (!updatedBooking) {
        return res.status(404).json({
          status: false,
          message: "Booking not found",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Booking details successfully updated",
          data: updatedBooking,
        });
      }

    } catch (err) {
      throw err;
    }
  },
  updateSubBooking: async (req, res) => {
    try {
      const { id } = req.params

      // const updatedSubBooking = await booking.findOneAndUpdate(
      //   { _id: mainBookingId },
      //   {
      //     $push: {
      //       bookingHistory: {
      //         salectDate: oldData?.salectDate,
      //         salectTime: oldData?.salectTime,
      //         createdAt: oldData?.createdAt,
      //         createdBy: oldData?.createdBy,
      //         bookingStatus: oldData?.bookingStatus,
      //       }
      //     }
      //   }
      // )

      const updatedSubBooking = await booking.findOneAndUpdate(
        {
          _id: id,
          "services._id": ObjectId(req.body?.serviceObj?._id)
        },
        {
          $set: {
            "services.$": req.body.serviceObj,
            finalPrice: req.body.finalPrice,
          }
        },
        { new: true }
      );

      if (!updatedSubBooking) {
        return res.status(404).json({
          status: false,
          message: "Booking not found",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Booking details successfully updated",
          data: updatedSubBooking,
        });
      }

    } catch (err) {
      throw err;
    }
  },
  getBooking: async (req, res) => {
    try {
      let query = {}
      let { businessId, branchId, _id, startDate, endDate, desiredStatus, clientId } = req.query

      if (_id) {
        query._id = _id;
      }
      if (businessId) {
        query.businessId = businessId;
      }
      if (clientId) {
        query.clientId = clientId;
      }
      if (branchId) {
        query.branchId = branchId;
      }
      if (startDate && endDate) {
        startDate = new Date(startDate)
        endDate = new Date(endDate)
        endDate = new Date(endDate.setDate(endDate.getDate() + 1))

        query.salectDateInFormat = { $gte: startDate, $lte: endDate }
      }
      if (desiredStatus) {
        query.bookingStatus = desiredStatus;
      }

      const projection = functions.bookingProjection()
      let data = await booking.find(query).sort({ _id: -1 })
        .populate({
          path: 'businessId',
          select: { originalAssignServiceArray: 0 }
        })
        .populate('branchId')
        .populate(projection)

      res.status(200).json({
        status: true,
        message: "Listed booking detail successfully",
        data
      })
    } catch (err) {
      if (err) throw err;
    }
  },
  deletedBooking: async (req, res) => {
    try {
      const id = req.params.id;

      const deletedBooking = await booking.findByIdAndDelete(id);

      if (!deletedBooking) {
        return res.status(404).json({
          status: false,
          message: "Booking not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Booking Details successfully deleted",
        data: deletedBooking,
      });
    } catch (err) {
      throw err
    }
  },
  getUpcomingBooking: async (req, res) => {
    try {
      const currentDate = new Date();
      let sevenDaysFromNow = new Date();
      sevenDaysFromNow = new Date(sevenDaysFromNow.setDate(currentDate.getDate() - 7));

      const pipeline = [
        {
          $match: {
            salectDateInFormat: {
              $gte: sevenDaysFromNow, // Filter bookings scheduled for more than 7 days from now
            },
            bookStatus: 'Upcoming',
            bookStatus: 'Cancelled',
          },
        },
        {
          $count: 'upcomingCount',
        },
      ];
      const bookingCount = await booking.aggregate(pipeline);
      console.log(bookingCount, "bookingCountttttttttttttttttttt")

      res.status(200).json({
        status: true,
        message: 'Upcoming Booking Count After 7 Days',
        upcomingCount: bookingCount ? bookingCount.upcomingCount : 0,
      });
    } catch (err) {
      if (err) throw err;
    }
  },

  // getUpcomingBooking: async (req, res) => {
  //   try {
  //     const currentDate = new Date();
  //     const sevenDaysAgo = new Date();
  //     sevenDaysAgo.setDate(currentDate.getDate() - 7);

  //     const pipeline = [
  //       {
  //         $match: {
  //           salectDateInFormat: {
  //             $gte: currentDate, // Filter upcoming bookings scheduled for today or later
  //             $lte: sevenDaysAgo, // Filter bookings from the last 7 days
  //           },
  //           bookStatus: {
  //             $in: [ 'Upcoming', 'Completed', 'Cancelled', 'No Show' ],
  //           },
  //         },
  //       },
  //       {
  //         $group: {
  //           _id: "$bookStatus",
  //           count: { $sum: 1 },
  //         },
  //       },
  //     ];

  //     const bookingCount = await booking.aggregate(pipeline);
  //     console.log(bookingCount, "bookingCountttttttttttttttttttttttt")

  //     const response = {
  //       status: true,
  //       message: 'Booking Count',
  //       data: bookingCount
  //     };

  //     if (bookingCount.length > 0) {
  //       bookingCount.forEach((count) => {
  //         response[ count._id ] = count.count;
  //       });
  //     }

  //     res.status(200).json(response);
  //   } catch (err) {
  //     if (err) throw err;
  //   }
  // },


}