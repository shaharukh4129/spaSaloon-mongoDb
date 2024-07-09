const mongoose = require("mongoose");
const businessUserModel = require("../../Model/businessUser")
const TeamMemberModel = require("../../Model/teamMember")
const businessModel = require("../../Model/business")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const auth = require("../../Middleware/auth");
const functions = require("../../../functions");
const randomstring = require("randomstring");

let userData = {
  signUp: async (req, res) => {
    try {
      const email = req.body.email;
      const check = await businessUserModel.findOne({ email });

      if (check) {
        return res.status(208).json({
          status: false,
          message: "Email Already Exist",
          data: check
        });
      } else {
        // const latest = await businessUserModel.findOne({}, { customerAccountNo: 1 }).sort({ _id: -1 })
        // const format = 'CUST'
        // let count;
        // if (latest?.customerAccountNo) {
        //   count = Number((latest.customerAccountNo).slice(-12))
        // } else {
        //   count = 0
        // }
        // let customerAccountNo = format + (String(count + 1).padStart(12, '0'))

        //managing usique business user account number
        // const check = await businessCounterModel.findOne();
        // let latest;
        // if (check) {
        //   latest = await businessCounterModel.findByIdAndUpdate(
        //     { _id: check._id },
        //     { $inc: { businessUserCount: 1 } },
        //     { new: true }
        //   );
        // } else {
        //   const payload = {
        //     businessUserCount: 2001001,
        //     businessCount: 11000
        //   }
        //   latest = await new businessCounterModel(payload).save()
        // }

        const customerAccountNo = await functions.createBusinessUserId()

        let payload = {
          countryId: req.body.countryId,
          customerAccountNo,
          userIp: req.body.userIp,
          deviceId: req.body.deviceId,
          sessionId: req.body.sessionId,
          location: req.body.location,
          deviceType: req.body.deviceType,
          email: req.body.email,
          userType: 'businessUser',
          stepCompleted: 1
        }
        const signUp = await new businessUserModel(payload).save()

        if (signUp) {
          //send email
          // const templateId = 56
          // const approveEmail = `${process.env.domain}/API/api/v1/approveEmail/${signUp._id}`
          // const data = {
          //   templateId: templateId,
          //   email: req.body.email,
          //   approveEmail: approveEmail,
          // };

          // await functions.sendEmail(data, async (data, error) => {
          //   if (error) console.log(error)
          //   console.log(`Email send successfully\n${JSON.stringify(data)}`)
          // })

          return res.status(200).json({
            status: true,
            message: "Successfully Register",
            data: signUp,
          });
        }
      }
    } catch (err) {
      throw err
    }
  },
  approveEmail: async (req, res) => {
    try {
      const id = req.params.id;

      businessUserModel.findByIdAndUpdate(
        { _id: id },
        { emailVerified: true },
        { new: true },
        (err, data) => {
          if (err) throw err
          // return res.status(200).json({
          //   status: true,
          //   message: "Email Verified successfully",
          // });
          res.render("emailSuccess", {
            title: "Email verified",
            layout: "",
            message: "Email Verified successfully",
          });
        }
      );
    } catch (error) {
      if (error) throw error
    }
  },
  approveReset: async (req, res) => {
    try {
      const { id, userType, newEmail, whichEmail } = req.query
      let model;
      let response;

      if (userType === 'businessUser') {
        model = businessUserModel

      } else if (userType === 'teamMember') {
        model = TeamMemberModel
      }


      let payload = { newEmail }
      if (whichEmail === 'old') {
        payload['reset.oldEmailVerified'] = true

      } else if (whichEmail === 'new') {
        payload['reset.newEmailVerified'] = true

      }

      const check = await model.findOne({ _id: id })
      let { mobileVerified, oldEmailVerified, newEmailVerified } = check?.reset
      if (
        mobileVerified && (!oldEmailVerified || !newEmailVerified)
      ) {

        if ((oldEmailVerified && whichEmail === 'new') || (newEmailVerified && whichEmail === 'old')) {

          payload = {
            $set: {
              email: newEmail,
              emailVerified: true,
              reset: {
                mobileVerified: false,
                oldEmailVerified: false,
                newEmailVerified: false
              }
            },
            $unset: { newEmail: '' }
          }
        }

        if (oldEmailVerified && whichEmail === 'old' || newEmailVerified && whichEmail === 'new') {
          response = "already"
        }
      } else {
        response = "already"
      }


      if (response === 'already') {
        return res.status(200).json({
          status: false,
          message: "You have already verified this email",
        });
      } else {

        await model.findOneAndUpdate({ _id: id }, payload)

        res.render("emailSuccess", {
          title: "Email verified",
          layout: "",
          message: "Email Verified successfully",
        });
      }
    } catch (error) {
      if (error) throw error
    }
  },
  editSetting: async (req, res) => {
    try {
      const { userId, oldEmail, newEmail, password, oldPassword, newMobile, firstName, lastName, nickName, isPublic, isBooking, about } = req.body

      let model;
      let response = 'Profile updated successfully'
      let check = true
      let payload = {
        firstName, lastName, nickName, isPublic, isBooking, about
      }

      if (req.user?.userType === "businessUser") {
        model = businessUserModel

      } else if (req.user?.userType === "teamMember") {
        model = TeamMemberModel
      }


      const user = await model.findOne({ _id: userId })

      if (newEmail) {
        response = "Verification link sent successfully on your email"
        //send email
        const templateId = 56
        const approveOldEmail = `${process.env.domain}/API/api/v1/approveReset?id=${userId}&userType=${req.user?.userType}&newEmail=${newEmail}&whichEmail=old`
        const approveNewEmail = `${process.env.domain}/API/api/v1/approveReset?id=${userId}&userType=${req.user?.userType}&newEmail=${newEmail}&whichEmail=new`

        let params = {
          templateId: templateId,
          email: user.email,
          approveEmail: approveOldEmail,
        };

        await functions.sendEmail(params, async (data, error) => {
          console.log(`Email send successfully\n${JSON.stringify(data)}`)

          params.email = newEmail
          params.approveEmail = approveNewEmail

          await functions.sendEmail(params, async (data, error) => {
            console.log(`Email send successfully\n${JSON.stringify(data)}`)
          })
        })
      }

      if (password && oldPassword) {
        response = 'Password updated successfully'

        const hash_result = await bcrypt.compare(oldPassword, user?.password)

        if (hash_result) {
          const hashedPassword = await bcrypt.hash(password, 10);
          payload.password = hashedPassword
        } else if (!hash_result) {
          check = false
        }

      }

      if (newMobile) {

        const mobile_OTP = functions.sendOtp(newMobile)
        const email_OTP = functions.generateOtp()

        const templateId = 4
        let params = {
          templateId: templateId,
          email: user?.email,
          randomcode: email_OTP,
        };

        await functions.sendEmail(params, async (data, error) => {
          console.log(`Email send successfully\n${JSON.stringify(data)}`)
        })

        // payload.mobile_OTP = "1234"
        // payload.email_OTP = "1234"
        payload.otp_sent = true

        payload.mobile_OTP = mobile_OTP
        payload.email_OTP = email_OTP

        response = "Verify the otp sent to your registered email and new mobile number"
      }

      if (check) {
        model.findOneAndUpdate(
          { _id: userId },
          payload,
          { new: true },
          (err, data) => {
            if (err) throw err
            return res.status(200).json({
              status: true,
              message: response,
              data: data,
            });
          }
        );
      } else {
        return res.status(200).json({
          status: false,
          message: "Old password is wrong",
        });
      }
    } catch (err) {
      throw err
    }
  },
  getSetting: async (req, res) => {
    try {
      const { userId } = req.query
      console.log("tttttttttttttttttttttttt", req.user)
      let model;
      if (req.user?.userType === "businessUser") {
        model = businessUserModel

      } else if (req.user?.userType === "teamMember") {
        model = TeamMemberModel
      }

      const data = await model.findOne({ _id: userId }).select({ hoursDetail: 0, Role: 0 })
      return res.status(200).json({
        status: true,
        message: "User setting fetched successfully",
        data: data,
      });

    } catch (err) {
      throw err
    }
  },
  updateProfile: async (req, res, next) => {
    try {
      const id = req.params.id;

      let token;
      let check;
      if (req.body.stepCompleted === 2) {
        const existingBusiness = await businessUserModel.findOne({ mobile: req.body.mobile });
        if (existingBusiness) {
          check = false
          return res.status(400).json({
            status: false,
            message: "Mobile Already Exists",
          });
        } else {
          check = true
          // const otp = functions.sendOtp(req.body.mobile)
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          const latest = await businessUserModel.findOne({ stepCompleted: { $gte: 2 } }, { customerAccountNo: 1 }).sort({ _id: -1 })

          const format = 2001000
          let customerAccountNo;
          if (latest?.customerAccountNo) {
            customerAccountNo = +latest.customerAccountNo + 1
          } else {
            customerAccountNo = format + 1
          }

          // req.body.mobile_OTP = otp
          req.body.mobile_OTP = "1234"
          req.body.password = hashedPassword
          req.body.customerAccountNo = customerAccountNo;
          req.body.createdBy = id
          req.body.updatedBy = id

          let payload = {
            _id: id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hashedPassword,
            userType: 'businessUser',
          };

          let envsecret = auth.getSecretToken();
          token = jwt.sign(payload, envsecret);
        }
      } else {
        let query;
        let res;
        if (req.body.email) {
          res = 'Email'
          query = { email: req.body.email }
        } else if (req.body.mobile) {
          res = 'Mobile'
          query = { mobile: req.body.mobile }
        }

        const existingBusiness = await businessUserModel.findOne(query);
        if (existingBusiness) {
          check = false;
          return res.status(400).json({
            status: false,
            message: `${res} Already Exists`,
          });
        } else {
          check = true;
        }
      }

      if (check) {
        businessUserModel.findByIdAndUpdate(
          { _id: id },
          req.body,
          { new: true },
          (err, data) => {
            if (err) throw err
            res.status(200).json({
              status: true,
              message: "Profile updated successfully",
              token: token,
              data: data,
            });
          }
        );
      }
    } catch (error) {
      if (error) throw error
    }
  },
  resendOTP: async (req, res) => {
    try {
      const id = req.params.id;
      // const otp = functions.sendOtp(req.body.mobile)

      let model = businessUserModel
      if (req.body?.userType) {
        if (req.body?.userType === 'teamMember') {
          model = TeamMemberModel
        }
      }
      const otp = "1234"
      model.findByIdAndUpdate(
        { _id: id },
        { mobile_OTP: otp },
        { new: true },
        (err, data) => {
          if (err) throw err
          res.status(200).json({
            status: true,
            message: "Otp resent successfully",
          });
        }
      );
    } catch (error) {
      if (error) throw error
    }
  },
  verifyOTP: async (req, res) => {
    try {
      const { enteredOTP, userType } = req.body;

      //Send userType if changing email

      const id = req.params.id;

      if (userType) {
        let model;
        if (userType === 'businessUser') {
          model = businessUserModel

        } else if (userType === 'teamMember') {
          model = TeamMemberModel
        }

        const data = await model.findOne({ _id: id });

        if (data?.mobile_OTP == enteredOTP) {
          model.findByIdAndUpdate(
            { _id: id },
            { 'reset.mobileVerified': true },
            { new: true },
            (err, data) => {
              if (err) throw err
              return res.status(200).json({
                status: true,
                message: "OTP Verified successfully",
              });
            }
          );
        } else {
          return res.status(401).json({
            status: false,
            message: "Incorrect OTP",
          });
        }

      } else {

        const business = await businessUserModel.findOne({ _id: id });

        if (business?.mobile_OTP == enteredOTP) {
          businessUserModel.findByIdAndUpdate(
            { _id: id },
            { stepCompleted: req.body.stepCompleted, mobileVerified: true },
            { new: true },
            (err, data) => {
              if (err) throw err
              return res.status(200).json({
                status: true,
                message: "OTP Verified successfully",
              });
            }
          );
        } else {
          return res.status(401).json({
            status: false,
            message: "Incorrect OTP",
          });
        }
      }
    } catch (error) {
      if (error) throw error
    }
  },
  verifyEmailAndMobileOTP: async (req, res) => {
    try {
      const { otpType, enteredOTP, userType, newMobile } = req.body;
      const id = req.params.id;

      let model;
      if (userType === 'businessUser') {
        model = businessUserModel

      } else if (userType === 'teamMember') {
        model = TeamMemberModel
      }

      const data = await model.findOne({ _id: id });

      let payload = { mobile_OTP_verify: true }
      let query = data?.mobile_OTP == enteredOTP

      if (otpType === 'email') {
        payload = { email_OTP_verify: true }
        query = data?.email_OTP == enteredOTP
      }

      if (query) {

        model.findByIdAndUpdate(
          { _id: id },
          payload,
          { new: true },
          async (err, data) => {
            if (err) throw err

            if (data?.mobile_OTP_verify && data?.email_OTP_verify) {
              await model.findByIdAndUpdate(
                { _id: id },
                {
                  mobile: newMobile,
                  mobile_OTP_verify: false,
                  email_OTP_verify: false,
                  otp_sent: false
                })
            }

            return res.status(200).json({
              status: true,
              message: "OTP Verified successfully",
            });
          }
        );
      } else {
        return res.status(401).json({
          status: false,
          message: "Incorrect OTP",
        });
      }
    } catch (error) {
      if (error) throw error
    }
  },
  login: async (req, res) => {
    try {
      let { email } = req.body;
      let query = { status: true }
      if (email.includes('@')) {
        query.email = email
      } else {
        query.mobile = email
      }

      let check = await businessUserModel.findOne(query);
      let userType = "businessUser"

      if (!check) {
        check = await TeamMemberModel.findOne(query);
        if (check) {
          userType = "teamMember"
        } else {
          userType = "notRegistered"
        }
      }

      if (userType === 'notRegistered') {
        return res.status(400).json({
          status: false,
          message: "Invalid credentials",
        });
      } else {
        if (check.password) {
          if (check.status) {
            if (check.emailVerified) {
              const validPassword = await bcrypt.compare(
                req.body.password,
                check.password
              );
              if (validPassword) {
                const payload = {
                  _id: check._id,
                  firstName: check.firstName,
                  lastName: check.lastName,
                  password: check.password,
                  userType: userType,
                };
                let envsecret = auth.getSecretToken();
                let token = jwt.sign(payload, envsecret);

                //login response
                check.userType = userType
                let resObj = {
                  status: true,
                  message: "Successfully Logged in",
                  token: token,
                  data: check,
                }

                if (userType === 'teamMember') {
                  return res.status(200).json(resObj);

                } else if (userType === 'businessUser') {
                  const business = await businessModel.findOne({ userId: check._id });
                  resObj.businessData = business
                  return res.status(200).json(resObj);
                }
              } else {
                return res.status(400).json({
                  status: false,
                  message: "Invalid credentials",
                });
              }

            } else {
              return res.status(400).json({
                status: false,
                message: "Please verfiy your email first",
              });
            }
          } else {
            return res.status(400).json({
              status: false,
              message: "Your account is not active",
            });
          }
        } else {
          return res.status(400).json({
            status: false,
            message: "Please complete the signup process first",
          });
        }
      }
    } catch (error) {
      if (error) throw error
    }
  },
  forgotPassword: async (req, res) => {
    try {
      let email = req.body.email;
      let data = await businessUserModel.findOne({ email: email });
      if (!data) {
        return res.status(201).json({
          status: false,
          message: "This email is not registered",
        });
      } else {
        // const resetLink = `${process.env.domain}/business/resetPassword/${data._id}`;
        // const payload = {
        //   templateId: 57,
        //   email: email,
        //   resetLink: resetLink,
        // };

        // await functions.sendEmail(payload, (data, error) => {
        //   if (error) throw error.message
        //   console.log(`Email send successfully\n${JSON.stringify(data)}`)
        //   res.status(200).json({
        //     status: true,
        //     message: `Password reset link has been sent to your email`,
        //   });
        // })

        res.status(200).json({
          status: true,
          message: `Password reset link has been sent to your email`,
        });
      }
    } catch (error) {
      if (error) throw error
    }
  },
  changePassword: async (req, res) => {
    try {
      const id = req.params.id;
      const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

      let model;
      const check = await businessUserModel.findOne({ _id: id })
      if (check) {
        model = businessUserModel

      } else {
        const check2 = await TeamMemberModel.findOne({ _id: id })
        if (check2) {
          model = TeamMemberModel
        }
      }

      model.findOneAndUpdate(
        { _id: id },
        { password: hashedPassword },
        { new: true },
        (err, data) => {
          if (err) throw err
          return res.status(200).json({
            status: true,
            message: " Password updated successfully",
            data: data,
          });
        }
      );
    } catch (error) {
      if (error) throw error
    }
  },
  getProfile: async (req, res, next) => {
    try {
      let query = { status: true }
      const id = req.query.id;

      if (id) {
        query._id = id
      }
      let check = await businessUserModel.find(query);

      return res.status(200).json({
        status: true,
        message: "Admin details found successfully",
        data: check,
      });
    } catch (error) {
      if (error) throw error
    }
  },
  resetPassword: async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    try {
      const businessUser = await businessUserModel.findOne({ email });

      if (!businessUser) {
        return res.status(404).json({
          status: false,
          message: 'businessUser not found'
        });
      }
      const isOldPasswordValid = await bcrypt.compare(oldPassword, businessUser.password);

      if (!isOldPasswordValid) {
        return res.status(401).json({
          status: false,
          message: 'Invalid old password'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      businessUser.password = hashedPassword;
      await businessUser.save();

      return res.status(200).json({
        status: true,
        message: 'Password reset successful',
        data: businessUser
      });
    } catch (err) {
      if (err) throw err;

    }
  },
};

module.exports = userData;
