const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const client = require("../../Model/client");
const businessModel = require("../../Model/business");
const functions = require("../../../functions");
const Membership = require("../../Model/membership");

exports.Client = {
  createClient: async (req, res) => {
    try {
      const existingEmail = await client.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({
          status: false,
          message: "Email already exists",
        });
      } else {
        const payload = {
          businessId: req.body.businessId,
          branchId: req.body.branchId,
          countryId: req.body.countryId,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          mobile: req.body.mobile,
          email: req.body.email,
          dateOfBirth: req.body.dateOfBirth,
          gender: req.body.gender,
          country: req.body.country,
          state: req.body.state,
          city: req.body.city,
          postalCode: req.body.postalCode,
          adderss1: req.body.adderss1,
          adderss2: req.body.adderss2,
          landmark: req.body.landmark,
          createdBy: req.user.firstName + ' ' + req.user.lastName,
          updatedBy: req.user.firstName + ' ' + req.user.lastName,
        };
        // const latest = await client.findOne({ businessId: req.body.businessId }, { clientAccountNo: 1 }).sort({ _id: -1 });
        // let clientAccountNo;
        // if (latest?.clientAccountNo) {
        //   clientAccountNo = (+latest.clientAccountNo + 1)
        // } else {

        //   clientAccountNo = 2001001
        // }

        const latest = await businessModel.findByIdAndUpdate(
          { _id: req.body.businessId },
          { $inc: { clientCount: 1 } },
          { new: true },
        );

        payload.clientAccountNo = String(latest?.clientCount).padStart(8, '0')

        const savedClient = await new client(payload).save()

        res.status(200).json({
          status: true,
          message: "Successfully created client",
          data: savedClient,
        });
      }
    } catch (err) {
      if (err) throw err;
    }
  },
  updateClient: async (req, res) => {
    try {
      const id = req.params.id;
      const payload = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobile: req.body.mobile,
        email: req.body.email,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        postalCode: req.body.postalCode,
        adderss1: req.body.adderss1,
        adderss2: req.body.adderss2,
        landmark: req.body.landmark,
        status: req.body.status,
        isActive: req.body.isActive,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };

      const updatedClient = await client.findByIdAndUpdate(
        { _id: id },
        { $set: payload },
        { new: true }
      );

      if (!updatedClient) {
        return res.status(404).json({
          status: false,
          message: "Client not found",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Client details successfully updated",
          data: updatedClient,
        });
      }

    } catch (err) {
      throw err;
    }
  },
  getClient: async (req, res) => {
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

      let clients = await client.find(query)
        .populate([
          {
            path: "businessId",
            select: { businessName: 1, businessAccountNo: 1 },
          },
          {
            path: "branchId",
            select: { branchName: 1 },
          }])
        .sort({ _id: -1 });



      res.status(200).json({
        status: true,
        message: "Listed client detail successfully",
        data: clients
      })
    } catch (err) {
      if (err) throw err;
    }

  },
  deleteClient: async (req, res) => {
    try {
      const id = req.params.id;

      const deletedClient = await client.findByIdAndDelete(id);

      if (!deletedClient) {
        return res.status(404).json({
          status: false,
          message: "Client  not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Client Details successfully deleted",
        data: deletedClient,
      });
    } catch (err) {
      throw err
    }
  },
  updateStatus: async (req, res) => {
    try {
      const upload = await functions.statusUpdate(req.params.id, client);
      res.json(upload)
    } catch (err) {
      res.status(500).json({
        messgae: err.messaeg,
        status: false
      })
    }
  },
  uploadClient: async (req, res) => {
    try {
      const { branchId, businessId } = req.query
      let columnToKey = {
        A: 'firstName',
        B: 'lastName',
        C: 'mobile',
        D: 'email',
        E: 'dateOfBirth',
        F: 'gender',
        G: 'country',
        H: 'state',
        I: 'city',
        J: 'postalCode',
        K: 'adderss1',
        L: 'adderss2',
        M: 'landmark',
      }

      let newData = functions.excelToJsonData(req.file.path, columnToKey)

      if (newData) {
        //Deleting uploaded excel
        const filePath = path.join(__dirname + `/../../../public/${req.file.filename}`)
        fs.unlinkSync(filePath)

        const filterdNewData = functions.checkMissingValues(columnToKey, newData?.sheet1)
        newData = filterdNewData.valid
        const invalid = filterdNewData.invalid

        const oldData = await client.find({ branchId }).select('email mobile')

        const duplicateEmails = []
        const uniqueData = []
        let clientAccountNo = await functions.createCustomNumber(client, businessId, "clientAccountNo")

        newData?.map(async neww => {
          let check;
          let unique;

          if (oldData.length > 0) {
            oldData.map(old => {
              if (old.email == neww.email) {
                check = true
              } else {
                unique = neww
              }
            });
          } else {
            unique = neww
          }

          if (check) {
            duplicateEmails.push(neww.email);

          } else if (unique) {
            unique.businessId = businessId
            unique.branchId = branchId
            unique.clientAccountNo = clientAccountNo + 1
            unique.isActive = true
            unique.status = true
            unique.createdBy = req.user.firstName + ' ' + req.user.lastName
            unique.updatedBy = req.user.firstName + ' ' + req.user.lastName
            uniqueData.push(unique);
            clientAccountNo++;
          }
        })
        if (uniqueData.length > 0) {
          await client.insertMany(uniqueData)
        }
        return res.status(200).json({
          status: true,
          message: 'File uploaded and data saved to the database.',
          duplicateEmails: duplicateEmails,
          invalidData: invalid
        });
      } else {
        return res.status(400).json({
          status: false,
          message: 'Did not find any data in excel.',
        });
      }
    } catch (error) {
      throw error
    }
  },
};

