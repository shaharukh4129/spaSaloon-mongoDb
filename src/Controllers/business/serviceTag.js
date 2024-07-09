const tags = require("../../Model/serviceTag")
const mongoose = require("mongoose");


exports.serviceTag = {
    createServiceTag: async (req, res) => {
        try {

            const data = await new tags(req.body).save()

            res.status(200).json({
                status: true,
                message: "Successfully created serviceTags",
                data: data,
            });
        }
        catch (err) {
            if (err) throw err;
        }
    },

     updateServiceTag :async (req, res) => {
        try {
          const { id } = req.params; 
          const updatedData = await tags.findByIdAndUpdate(id, req.body, {
            new: true,
          });
      
          if (updatedData) {
            res.status(200).json({
              status: true,
              message: "Successfully updated serviceTag",
              data: updatedData,
            });
          } else {
            res.status(404).json({
              status: false,
              message: "ServiceTag not found",
            });
          }
        } catch (err) {
          console.error(err);
          res.status(500).json({
            status: false,
            message: "Internal Server Error",
          });
        }
      },
 
       deleteServiceTag :async (req, res) => {
        try {
          const { id } = req.params; 
          const deletedData = await tags.findByIdAndDelete(id);
      
          if (deletedData) {
            res.status(200).json({
              status: true,
              message: "Successfully deleted serviceTag",
              data: deletedData,
            });
          } else {
            res.status(404).json({
              status: false,
              message: "ServiceTag not found",
            });
          }
        } catch (err) {
          console.error(err);
          res.status(500).json({
            status: false,
            message: "Internal Server Error",
          });
        }
      },
      
      getServicetag: async (req, res) => {
        try {
          let query =  { _id } = req.query
    
          if (_id) {
            query._id = _id
          }
    
    
          let value = await tags.find(query).sort({ _id: -1 });
          res.status(200).json({
            status: true,
            message: "Listed serviceTag detail successfully",
            data: value
          })
        } catch (err) {
          if (err) throw err;
        }
      },



};