const mongoose = require("mongoose");
const businessAmenities = require("../../Model/amenities")
const amenitiesGlobalList = require("../../Model/amenitiesGlobalList")
const Booking = require("../../Model/booking");
const functions = require("../../../functions");
exports.amenities = {

  createAmenities: async (req, res) => {
    try {
      if (req.body.type) {
        // let check = await businessAmenities.findOne({ businessId: req.body.businessId, itemName: req.body.itemName });
        // if (check) {
        //   res.status(400).json({
        //     status: false,
        //     message: "Item name already exist",
        //   });
        // } else {

        const data = await new businessAmenities(req.body).save()
        res.status(200).json({
          status: true,
          message: "Successfully created Amenities",
          data: data
        });
        // }

      } else {
        await businessAmenities.deleteMany({ _id: { $in: req.body.deleteAmenities } });
        req.body.amenitiesArray.map(async amenity => {
          const payload = {
            _id: req.body._id,
            businessId: req.body.businessId,
            countryId: req.body.countryId,
            branchId: req.body.branchId,
            occupied: amenity.occupied,
            available: amenity.available,
            itemName: amenity.itemName,
            qty: amenity.qty,
            createdBy: req.user.firstName + ' ' + req.user.lastName,
            updatedBy: req.user.firstName + ' ' + req.user.lastName,
          };
          if (!amenity._id) {
            const check = await businessAmenities.findOne(
              {
                itemName: req.body.itemName,
                branchId: req.body.branchId
              });

            if (!check) {
              return await new businessAmenities(payload).save()
            }
          }
        })
        res.status(200).json({
          status: true,
          message: "Successfully created Amenities",
        });
      }

    } catch (err) {
      if (err) throw err;
    }
  },
  createGlobalAmenities: async (req, res) => {
    try {
      const { businessId, itemName } = req.body
      let existingAmen = await amenitiesGlobalList.findOne({ businessId, itemName });

      let response = {
        status: true,
        message: "Amenities created successfully",
      }

      if (existingAmen) {
        response.status = false
        response.message = "Amenities already exist"

      } else {
        response.data = await new amenitiesGlobalList({ businessId, itemName }).save()
      }

      res.status(200).json(response)

    } catch (err) {
      if (err) throw err;
    }
  },
  getGlobalAmenities: async (req, res) => {
    try {
      const { businessId } = req.query
      let data = await amenitiesGlobalList.find({ businessId });

      res.status(200).json({
        status: true,
        message: "Amenities created successfully",
        data
      })
    } catch (err) {
      if (err) throw err;
    }
  },
  updateAmenities: async (req, res) => {
    try {
      const { id, branchId, businessId } = req.query
      const payload = {
        occupied: req.body.occupied,
        available: req.body.available,
        itemName: req.body.itemName,
        qty: req.body.qty,
        status: req.body.status,
        isActive: req.body.isActive,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };
      let check;
      if (req.body.itemName) {
        check = await businessAmenities.findOne({ businessId, itemName: req.body.itemName });
      }

      if (check) {
        res.status(400).json({
          status: false,
          message: "Item name already exist",
        });
      } else {
        businessAmenities.findByIdAndUpdate(
          id,
          payload,
          { new: true },
          (err, data) => {
            if (err) throw err
            res.status(200).json({
              status: true,
              message: "Amenities details successfully updated",
              data: data,
            });
          }
        );
      }

    } catch (err) {
      throw err;
    }
  },
  getAmenities: async (req, res) => {
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

      let amenities = await businessAmenities.find(query)
        .populate([
          { path: "itemName", select: { itemName: 1 } },
          { path: "businessId", select: { businessName: 1 } },
          { path: "branchId", select: { branchName: 1 } }
        ])
        .sort({ _id: -1 })

      query.bookingStatus = 'Upcoming'

      let bookings = await Booking.find(query)
        .populate('services.amenitiesId')

      const filtered = await Promise.all(amenities?.map(amentie => {

        let occupied = 0
        let available = +amentie?.qty

        bookings?.map(book => {
          book?.services?.map(service => {
            service?.amenitiesId?.map(amen => {

              if (amen._id.toString() == amentie?._id.toString()) {
                occupied++
              }
            })
          })
        })

        amentie.occupied = occupied
        available = +amentie?.qty - occupied
        amentie.available = available

        // if (dataForBooking) {
        //   if (available != 0) {
        //     return amentie;
        //   }
        // } else {
        return amentie;
        // }
      }))


      res.status(200).json({
        status: true,
        message: "Listed amenities detail successfully",
        data: filtered
      })
    } catch (err) {
      if (err) throw err;
    }

  },
  deletedAmenities: async (req, res) => {
    try {
      const id = req.params.id;

      const deletedAmenities = await businessAmenities.findByIdAndDelete(id);
      if (deletedAmenities) {
        res.status(200).json({
          status: true,
          message: "Amenities details successfully deleted",
          data: deletedAmenities,
        });
      }
    } catch (err) {
      throw err
    }
  },
  amenitiesstatus: async (req, res) => {
    try {
      const upload = await functions.statusUpdate(req.params.id, businessAmenities);
      res.json(upload)
    } catch (err) {
      throw err
    }
  }
}