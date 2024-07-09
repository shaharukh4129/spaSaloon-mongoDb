const User = require("../../src/Model/admin");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const auth = require("../../src/Middleware/auth");
const sendEmail = require("../../src/service/sendMail");

// Function to generate a numeric OTP
function generateNumericOTP(length) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    otp += digits[randomIndex];
  }
  return otp;
}

let SubAdminController = {
  subAdminSignup: async (req, res) => {
    try {
      const { email, password, adminType, status, role } = req.body;

      // Check if an account with the given email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          status: false,
          message: "An account with this email already exists",
        });
      }

      if (existingUserByMobile) {
        return res.status(409).json({
          status: false,
          message: "An account with this mobile already exists",
        });
      }


      if (!isValidEmail(email)) {
        return res.status(400).json({
          status: false,
          message: "Invalid email format",
        });
      }

      if (!isValidMobile(mobile)) {
        return res.status(400).json({
          status: false,
          message: "Invalid mobile number format",
        });
      }

      const hashPassword = await bcrypt.hash(password, 10);
      const subAdminSignUp = new User({
        name: name,
        mobile: mobile,
        email: email,
        password: hashPassword,
        adminType: adminType,
        status: status,
        role: role,
      });

      await subAdminSignUp.save();
      return res.status(200).json({
        status: true,
        message: "Successfully Signed Up",
        data: subAdminSignUp,
      });
    } catch (error) {
      res.status(400).json({
        status: false,
        message: "Something went wrong",
        error: error.message,
      });
    }
  },

  subAdminLogin: async (req, res) => {
    try {
      let email = req.body.email;
      let findonequery = { email: email };
      let check = await User.findOne(findonequery);
      let adminType = req.body.adminType;

      if (check === null) {
        return res.status(401).json({
          status: false,
          message: "user not found",
        });
      } else {
        let result = await bcrypt.compare(req.body.password, check.password);
        if (result) {
          // if (req.body.adminType == check.adminType) {
          let payload = {
            _id: check._id,
            email: req.body.email,
            userType: check.userType,
          };
          let envsecret = auth.getSecretToken();
          let token = jwt.sign(payload, envsecret);
          return res.status(200).json({
            status: true,
            message: "successfully login",
            data: check,
            token: token,
          });
          // } else {
          //   return res.status(401).json({
          //     status: false,
          //     message: "Invalid admin type",
          //   });
          // }
        } else {
          return res.status(401).json({
            status: false,
            message: "Please Enter Valid Password",
          });
        }
      }
    } catch (error) {
      res.status(400).json({
        status: false,
        message: "somethig went wrong",
        error: error.message,
      });
    }
  },

  changePassword: async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await User.findOneAndUpdate(
        { email },
        { password: hashedNewPassword },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
        data: updatedUser,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Something went wrong", error: error.message });
    }
  },

  //   try {
  //     if (req.body.email) {
  //       let email = req.body.eamil;
  //       let findonequery = { email: email };
  //       let check = await User.findOne(findonequery);
  //       if (check) {
  //         res.status(200).json({
  //           status: true,
  //           message: " successfully this email is exist",
  //         });
  //       } else {
  //         res.status(401).json({
  //           status: false,
  //           message: "email doesn't exist",
  //         });
  //       }
  //     } else {
  //       let id = req.body.id;
  //       let result = await User.findOne({ _id: id });
  //       if (result) {
  //         let hashPassword = await bcrypt.hash(req.body.newPassword, 10);
  //         if (req.body.currentPassword) {
  //           // if(req.body.newPassword==req.body.confirmPassword){
  //           let validPassword = await bcrypt.compare(
  //             req.body.currentPassword,
  //             result.password
  //           );
  //           if (validPassword) {
  //             let result = await User.findByIdAndUpdate(
  //               { _id: id },
  //               { password: hashPassword },
  //               { new: true }
  //             );
  //             res.status(200).json({
  //               status: true,
  //               data: result,
  //               message: "successfully updated password",
  //             });
  //           } else {
  //             res.status(401).json({
  //               status: false,
  //               message: "current password is wrong",
  //             });
  //           }
  //           // }else{
  //           //     res.status(401).json({
  //           //         status:false,
  //           //         message:"newPassword and confirmPassword not matched",
  //           //     })
  //           // }
  //         }
  //       } else {
  //         res.status(401).json({
  //           status: false,
  //           message: "id doesn't exist",
  //         });
  //       }
  //     }
  //   } catch (error) {
  //     res.status(400).json({
  //       status: false,
  //       message: "somethig went wrong",
  //       error: error.message,
  //     });
  //   }
  // },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate a numeric OTP
      const otp = generateNumericOTP(6);

      // Save the OTP in the user object
      user.otp = otp;
      await user.save();

      await sendEmail({
        email: email,
        subject: "OTP to verify email",
        message: `Your OTP is: ${otp}`,
      });

      res.status(200).json({ message: "OTP sent for password reset" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred during password reset" });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      // Update the user's password with the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  },

  getadminApi: async (req, res, next) => {
    try {
      let id = req.query.id;
      if (id) {
        let findonequery = { _id: id };
        let record = await User.findOne(findonequery);
        res.status(200).json({
          status: true,
          message: "single admin data found",
          data: record,
        });
      } else {
        let record = await User.find();
        res.status(200).json({
          status: true,
          message: "all admin data found",
          data: record,
        });
      }
    } catch (error) {
      res.status(400).json({
        status: false,
        message: "something went wrong",
        error: error.message,
      });
    }
  },
};

module.exports = SubAdminController;
