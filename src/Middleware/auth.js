const jwt = require("jsonwebtoken");
const userModel = require("../Model/businessUser");
const adminModel = require("../Model/admin")
const teamMemberModel = require("../Model/teamMember")
const mongoose = require('mongoose');
ObjectId = mongoose.Types.ObjectId;

exports.generateAccessToken = (userPayload) => {
  return jwt.sign(userPayload, process.env.TOKEN_SECRET);
};

exports.authorization_user = (req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Authorization, Accept");

  const token = req.header("Authorization");
  if (!token) {
    res.status(200).json({
      status: false,
      message: "Authorization header is missing",
    });
    return;
  } else {
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;

      const Id = ObjectId(req.user._id);

      let model = userModel
      if (req.user.userType === 'teamMember') {
        model = teamMemberModel
      } else if (req.user.userType === 'superadmin') {
        model = adminModel
      }

      model.find({ _id: Id }, (err, rows) => {
        if (err) throw err
        if (rows.length > 0) {
          next();
        } else {
          res.status(401).json({
            status: false,
            message: "Invalid Token",
          });
          return;
        }
      });
    } catch (err) {
      res.status(401).json({
        status: false,
        message: "Invalid Token",
      });
      return;
    }
  }
};
exports.authorization_Admin = (req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Authorization, Accept");

  const token = req.header("Authorization");
  if (!token) {
    res.status(200).json({
      status: false,
      message: "Authorization header is missing",
    });
    return;
  } else {
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
      console.log(verified)   
      const Id = ObjectId(req.user._id);
      adminModel.find({ _id: Id }, (err, rows) => {
        if (err) throw err
        if (rows.length > 0) {
          next();
        } else {
          res.status(401).json({
            status: false,
            message: "Invalid Token",
          });
          return;
        }
      });
    } catch (err) {
      res.status(401).json({
        status: false,
        message: "Invalid Token",
      });
      return;
    }
  }
};

exports.getSecretToken = () => {
  return process.env.JWT_SECRET;
};
