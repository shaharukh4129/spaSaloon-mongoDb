const router = require("express").Router();
const auth = require("../../src/Middleware/auth");
const SubAdminController = require("../controller/AdminController");
const BusinesslistController = require("../controller/BusinessController")
//subAdmin SignUp & login
router.post("/adminsignup", SubAdminController.subAdminSignup);

//login
router.post("/adminlogin", SubAdminController.subAdminLogin);

//change password
router.patch("/changepassword", SubAdminController.changePassword);

//forgot password
router.post("/forgotpassword", SubAdminController.forgotPassword);

//reset pasword
router.post("/resetpassword", SubAdminController.resetPassword)

//get details
router.get("/getadminApi", SubAdminController.getadminApi);

// bussiness controller 
router.get("/getBussinesslist",BusinesslistController.getBusinesslist)

//resetpassword
// router.post("/resetpassword", SubAdminController.resetPassword)

module.exports = router;
