const express = require("express");
const router = express.Router();
const { authorization_user: auth } = require("../Middleware/auth");
const functions = require("../../functions");
const teamMembers = require("../Controllers/business/teamMembers").teamMembers
const userData = require("../Controllers/business/businessUser");
const business = require("../Controllers/business/business").business
const country = require("../Controllers/business/country").country
const businessCatagory = require("../Controllers/business/businessCatagory").businessCatagory
const amenities = require("../Controllers/business/amenities").amenities
const branchLocation = require("../Controllers/business/branchLocation");
const leaves = require("../Controllers/business/leaves").leaves
const serviceCategory = require("../Controllers/business/serviceCategory").serviceCategory
const businessService = require("../Controllers/business/businessService").businessService
const membership = require("../Controllers/business/membership").membership
const Sales = require("../Controllers/business/sales").Sales
const packages = require("../Controllers/business/packages").packages
const Client = require("../Controllers/business/client").Client
const booking = require("../Controllers/business/booking").booking
const businessPrice = require("../Controllers/business/businessPrice").businessPrice
const promotion = require("../Controllers/business/promotion").promotion
const assignRole = require("../Controllers/business/assignRole").assignRole
const review = require("../Controllers/business/review").review
const serviceTag = require("../Controllers/business/serviceTag").serviceTag
const multer = require("multer");
const storage = multer.memoryStorage(); // Store the file in memory
const uploadcategory = multer({ storage: storage });
const upload = functions.Multer("spa-saloon-images/business/images")
const upload2 = multer({ storage: multer.memoryStorage() });
const localmul = functions.localMulter()

const upload3 = multer({ storage: localmul })


//user Router
router.post("/signup", userData.signUp);
router.get("/approveEmail/:id", userData.approveEmail);
router.get("/approveReset", userData.approveReset);
router.post("/editSetting", auth, userData.editSetting);
router.get("/getSetting", auth, userData.getSetting);
router.post("/verifyotp/:id", userData.verifyOTP);
router.post("/verifyEmailAndMobileOTP/:id", auth, userData.verifyEmailAndMobileOTP);
router.post("/resendOTP/:id", userData.resendOTP);
router.post("/login", userData.login);
router.post("/forgotpassword", userData.forgotPassword);
router.patch("/changepassword/:id", userData.changePassword);
router.patch("/updateprofile/:id", userData.updateProfile);
router.get("/getprofile", userData.getProfile);
router.post("/resetPassword", userData.resetPassword)


//business setting Routes
router.post("/createBusiness", upload.single("image"), business.createBusiness);
router.get("/getBusiness", auth, business.getBusiness);
router.patch("/updateBusiness/:id", auth, upload.fields([{ name: 'image' }, { name: 'profileImage' }]), business.updateBusiness);
router.patch("/updateBusinessCategory/:id", business.updateBusinessCategory);//1
router.delete("/deleteBusiness/:id", auth, business.deleteBusiness);

//team Routes
router.post("/addTeamTitle", auth, teamMembers.addTeamTitle);
router.patch("/updateTeamTitle/:id", auth, teamMembers.updateTeamTitle);//2
router.delete("/deleteTeamTitle/:id", auth, teamMembers.deleteTeamTitle);
router.get("/getTeamTitle", auth, teamMembers.getTeamTitle);

router.post("/addTeamMember", upload.single("image"), auth, teamMembers.addTeamMember);
router.post("/uploadTeamMember", upload3.single("file"), teamMembers.uploadTeamMembers);
router.patch("/updateTeamMember/:id", upload.single("image"), auth, teamMembers.updateTeamMember);
router.delete("/deleteTeamMember/:id", auth, teamMembers.deleteTeamMember);
router.get("/getAllTeamMembers", auth, teamMembers.getAllTeamMembers);
router.get("/getTeamMembersBooking", auth, teamMembers.getTeamMembersBooking);
router.get("/getAvailableTeamMember", auth, teamMembers.getAvailableTeamMember);
router.get("/getTeamMembersCalender", auth, teamMembers.getTeamMembersCalender);
router.get("/viewBookingHistory", auth, teamMembers.viewBookingHistory);
router.patch("/assignTeamToBooking", auth, teamMembers.assignTeamToBooking);

//country Routes
router.post("/createCountry", country.createCountry);
router.patch("/updateCountry/:id", country.updateCountry);
router.get("/getCountry", country.getCountry);
router.delete("/deleteCountry/:id", country.deleteCountry);

//business Catagory Routess
router.post("/createCatagory", auth, uploadcategory.single("Icon"), businessCatagory.createCatagory);
router.patch("/updateCatagory/:id", auth, uploadcategory.single("Icon"), businessCatagory.updateCatagory);
router.get("/getCatagory", businessCatagory.getCatagory);
router.delete("/deleteCatagory/:id", auth, businessCatagory.deleteCatagory);

//branchLocation route
router.post("/addbranch", upload.any('image'), auth, branchLocation.addBranch);
router.get("/getbranch", auth, branchLocation.getBranch);
router.patch("/updatebranch/:id", upload.any('image'), auth, branchLocation.updateBranch);
router.delete("/deleteBranch", auth, branchLocation.deleteBranch);
router.patch("/assignBusinessService", auth, branchLocation.assignBusinessService);
router.patch("/assignTeamToBranch", auth, branchLocation.assignTeamToBranch);
router.patch("/assignServiceToTeam", auth, branchLocation.assignServiceToTeam);

//Aminities Routes
router.post("/createAmenities", auth, amenities.createAmenities);
router.post("/createGlobalAmenities", auth, amenities.createGlobalAmenities);
router.get("/getGlobalAmenities", auth, amenities.getGlobalAmenities);
router.patch("/updateAmenities", auth, amenities.updateAmenities);
router.get("/getAmenities", auth, amenities.getAmenities);
router.delete("/deleteAmenities/:id", auth, amenities.deletedAmenities);

//Leaves Routes 
router.post("/createLeaves", auth, leaves.createLeaves);
router.patch("/updateLeaves/:id", auth, leaves.updateLeaves);
router.get("/getLeaves", auth, leaves.getLeaves);
router.delete("/deleteLeaves/:id", auth, leaves.deletedLeaves);

//Service Catagory Routes
router.post("/createServiceCatagory", auth, serviceCategory.createServiceCatagory);
router.patch("/updateServiceCatagory/:id", auth, serviceCategory.updateServiceCatagory);
router.get("/getServiceCatagory", auth, serviceCategory.getServiceCatagory);
router.delete("/deleteServiceCatagory/:id", auth, serviceCategory.deleteServiceCatagory);

// Business Service Routes
router.post("/createBusinessService", auth, businessService.createBusinessService);
router.post("/uploadBusinessService", auth, upload3.single("file"), businessService.uploadBusinessService);
router.patch("/updateBusinessService/:id", auth, businessService.updateBusinessService);
router.get("/getBusinessService", auth, businessService.getBusinessService);
router.delete("/deleteBusinessService/:id", auth, businessService.deleteBusinessService);

//Membership Routes
router.post("/createMembership", auth, membership.createMembership);
router.patch("/updateMembership/:id", auth, membership.updateMembership);
router.get("/getMembership", auth, membership.getMembership);
router.delete("/deleteMembership/:id", auth, membership.deletedMembership);

//Sales Routes 
router.post("/createSales", auth, Sales.createSales);
router.post("/uploadSales", auth, upload.single("file"), Sales.uploadSales);
router.patch("/updateSales/:id", auth, Sales.updateSales);
router.get("/getSales", auth, Sales.getSales);
router.delete("/deleteSales/:id", auth, Sales.deleteSales);

//packages Routes
router.post("/createPackages", auth, packages.createPackages);
router.patch("/updatePackages/:id", auth, packages.updatePackages);
router.get("/getPackages", auth, packages.getPackages);
router.delete("/deletePackages/:id", auth, packages.deletePackages);

//client Routes
router.post("/createClient", auth, Client.createClient);
router.post("/uploadClient", auth, upload3.single("file"), Client.uploadClient);
router.patch("/updateClient/:id", auth, Client.updateClient);
router.get("/getClient", auth, Client.getClient);
router.delete("/deleteClient/:id", auth, Client.deleteClient);

//Booking Router
router.post("/createBooking", auth, booking.createBooking);
router.patch("/updateBooking/:id", auth, booking.updateBooking);
router.patch("/updateSubBooking/:id", auth, booking.updateSubBooking);
router.get("/getBooking", auth, booking.getBooking);
router.get("/getUpcomingBooking", auth, booking.getUpcomingBooking);
router.delete("/deleteBooking/:id", auth, booking.deletedBooking);

//service price
router.post("/createBusinessPrice", auth, businessPrice.createBusinessPrice);
router.patch("/changePriceStatus/:id", auth, businessPrice.changePriceStatus);
router.get("/getBusinessPrice", auth, businessPrice.getBusinessPrice);
router.delete("/deleteBusinessPrice/:id", auth, businessPrice.deleteBusinessPrice);

//promotion routes
router.post("/createPromotion", auth, upload.any('image'), promotion.createPromotion);
router.patch("/updatePromotion/:id", auth, upload.any('image'), promotion.updatePromotion);
router.get("/getPromotion", auth, promotion.getPromotion);
router.delete("/deletePromotion/:id", auth, promotion.deletedPromotion);

//Assign Role Routes
router.post("/createAssignRole", auth, assignRole.createAssignRole);
// router.patch("/updateAssignRole/:id", auth, assignRole.updateAssignRole);
router.get("/getAssignRole", auth, assignRole.getAssignRole);
router.delete("/deleteAssignRole/:id", auth, assignRole.deleteAssignRole);

//Assign Role Routes
router.post("/createReview", auth, review.createReview);
router.patch("/updateReview/:id", auth, review.updateReview);
router.patch("/addReply/:id", auth, review.addReply);
router.get("/getReview", auth, review.getReview);
router.delete("/deleteReview/:id", auth, review.deletedReview);

//serviceTags
router.get("/get_ServiceTag", serviceTag.getServicetag);



module.exports = router;
