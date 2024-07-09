const mongosoe = require("mongoose");
const sales = require("../../Model/sales");

exports.Sales = {
  createSales: async (req, res) => {
    try {
      const payload = {
        businessId: req.body.businessId,
        branchId: req.body.branchId,
        countryId: req.body.countryId,
        clientId: req.body.clientId,
        serviceId: req.body.serviceId,
        packagesId: req.body.packagesId,
        membershipId: req.body.membershipId,
        totalServiceAmount: req.body.totalServiceAmount,
        totalpackageAmount: req.body.totalpackageAmount,
        totalMembershipAmount: req.body.totalMembershipAmount,
        discount: req.body.discount,
        discountType: req.body.discountType,
        grossAmount: req.body.grossAmount,
        netAmount: req.body.netAmount,
        createdBy: req.user.firstName + ' ' + req.user.lastName,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };


      const savedSales = await new sales(payload).save()

      res.status(200).json({
        status: true,
        message: "Successfully created Sales",
        data: savedSales,
      });
    } catch (err) {
      if (err) throw err;
    }
  },
  updateSales: async (req, res) => {
    try {
      const id = req.params.id;
      const payload = {
        businessId: req.body.businessId,
        countryId: req.body.countryId,
        branchId: req.body.branchId,
        clientId: req.body.clientId,
        serviceId: req.body.serviceId,
        packagesId: req.body.packagesId,
        status: req.body.status,
        isActive: req.body.isActive,
        membershipId: req.body.packagesId,
        totalServiceAmount: req.body.totalServiceAmount,
        totalpackageAmount: req.body.totalpackageAmount,
        totalMembershipAmount: req.body.totalMembershipAmount,
        discount: req.body.discount,
        discountType: req.body.discountType,
        grossAmount: req.body.grossAmount,
        netAmount: req.body.netAmount,
        updatedBy: req.user.firstName + ' ' + req.user.lastName,
      };

      const updatedSales = await sales.findByIdAndUpdate(
        id,
        payload,
        { new: true }
      );

      if (!updatedSales) {
        return res.status(404).json({
          status: false,
          message: "Sales not found",
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Sales Details successfully updated",
          data: updatedSales,
        });
      }

    } catch (err) {
      throw err;
    }
  },
  getSales: async (req, res) => {
    try {
      let query = { status: true }
      let { businessId, branchId, clientId, _id } = req.query

      if (_id) {
        query._id = _id
      }
      if (businessId) {
        query.businessId = businessId
      }
      if (branchId) {
        query.branchId = branchId
      }
      if (clientId) {
        query.clientId = clientId
      }

      let value = await sales.find(query).sort({ _id: -1 })
        .populate([
          {
            path: 'businessId',
            model: 'business',
          },
          {
            path: 'clientId',
            model: 'client',
          },
          {
            path: 'serviceId.promotionId',
            model: 'promotion',
          },
          {
            path: 'serviceId.serviceId',
            model: 'businessPrice',
            populate: [
              {
                path: 'serviceId',
                model: 'businessService',
              },
              {
                path: 'serviceCatagoryId',
                model: 'serviceCatagory',
              }
            ]
          },
          {
            path: 'packagesId',
            model: 'packages',
          },
          {
            path: 'membershipId',
            model: 'membership',
          },
        ])

      res.status(200).json({
        status: true,
        message: "Listed sales detail successfully",
        data: value
      })
    } catch (err) {
      if (err) throw err;
    }

  },
  deleteSales: async (req, res) => {
    try {
      const id = req.params.id;
      const deletedSales = await sales.findByIdAndDelete(id);

      if (!deletedSales) {
        return res.status(404).json({
          status: false,
          message: "Sales not found",
        });
      }

      res.status(200).json({
        status: true,
        message: "Sales Details successfully deleted",
        data: deletedSales,
      });
    } catch (err) {
      throw err
    }
  },
  uploadSales: async (req, res) => {
    let blankname = [];
    let blankpassword = [];
    let blankStatus = [];
    let email = [];
    let Duplicateemail = [];
    let resultingarraystage2 = [];
    let blankemail = []
    let wrongEmailFormat = [];
    let emailAlreadyExist = [];
    let wrongstatus = [];
    let allData = [];
    let WrongmobileNoformat = [];
    let WrongcountryCodeformat = [];

    const newSheet = req.file.path;

    let result = excelToJson({
      sourceFile: newSheet,
      header: { rows: 1 },
      columnToKey: {
        A: 'name',
        B: 'email',
        C: 'password',
        D: 'mobileNo',
        E: 'countryCode',
        F: 'status',
        G: 'extraone',
        H: 'extratwo',
        I: 'extrathree',
        J: 'extrafour',
        K: 'extrafive',
        L: 'isverified',
        AA: 'claimStatus'
      },
    });

    result.Worksheet.map(v => {
      email.push(v.email);
    });

    let duplicateemail = email.filter((val, index) => index !== email.indexOf(val));
    let duplicat_email_sorted = duplicateemail.filter((val, index) => index == duplicateemail.indexOf(val));
    console.log(duplicat_email_sorted, "branchaname")


    let resultingarray = email.filter(function (e) {
      return duplicateemail.indexOf(e) == -1;
    });
    console.log(resultingarray, "resultingarrayresultingarray")
    duplicat_email_sorted.map((duplicates) => {
      result.Worksheet.map((e) => {
        if (duplicates == e.email) {

          Duplicateemail.push(e);
        }
      });
    });

    resultingarray.map(unique => {
      result.Worksheet.map(j => {
        if (unique == j.email) {
          resultingarraystage2.push(j);
        }
      });
    });



    let resulthere = await Promise.all(
      resultingarraystage2.map(async (value) => {
        const emailPattern = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
        console.log(!emailPattern.test(value.email), "ddddddddddd")
        if (
          value.name == undefined ||
          value.email == undefined ||
          value.password == undefined ||
          value.status == undefined ||
          typeof value.countryCode == "string" ||
          typeof value.mobileNo == "string" ||
          !emailPattern.test(value.email) ||
          value.status !== "true" && value.status !== "false" && value.status !== undefined
        ) {
          if (value.name == undefined) {

            blankname.push(value)
          } if (value.email == undefined) {

            blankemail.push(value)
          }
          if (value.password == undefined) {
            blankpassword.push(value)
          }

          if (value.status == undefined) {
            blankStatus.push(value)
          } if (!emailPattern.test(value.email) && value.email !== undefined) {
            wrongEmailFormat.push(value)
          } if (value.status !== "true" && value.status !== "false" && value.status !== undefined) {
            wrongstatus.push(value)

          } if (typeof value.mobileNo == "string") {
            WrongmobileNoformat.push(value)
          }
          if (typeof value.countryCode == "string") {
            WrongcountryCodeformat.push(value)
          }
        }
        else {

          let checkemail = await userModel.findOne({ email: value.email });
          if (checkemail) {
            emailAlreadyExist.push(value)
          } else {
            let salt = await bcrypt.genSalt(10)
            let hash = await bcrypt.hash(value.password.toString(), salt)

            value.password = hash
            value.claimStatus = 2
            value.isverified = true
            value.type = "student"
            allData.push(value)
          }
        }
      }
      ))

    userModel.insertMany(allData, (err, result) => {
      if (err) throw err;
      res.status(200).json({
        status: true,
        message: 'Bulk upload Complete successfully',
        uploaded: result,
        emailAlreadyExist: emailAlreadyExist,
        Duplicateemail: Duplicateemail,
        wrongstatus: wrongstatus,
        blankpassword: blankpassword,
        blankname: blankname,
        blankemail: blankemail,
        blankStatus: blankStatus,
        WrongmobileNoformat: WrongmobileNoformat,
        WrongcountryCodeformat: WrongcountryCodeformat,
        wrongEmailFormat: wrongEmailFormat
      });
    });
  },
}