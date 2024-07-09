const router = require("express").Router();
const multer = require("multer");
const { authorization_user: auth } = require("../Middleware/auth");

// require Controller
const BusinesslistController = require("../Controllers/superAdmin/businessUserController");
const superAdminController = require("../Controllers/superAdmin/superAdmin");
const businessCatagory = require("../Controllers/business/businessCatagory").businessCatagory;
const booking = require("../Controllers/business/booking").booking
const addbusiness = require("../Controllers/superAdmin/businessController").addbusiness;
const business = require("../Controllers/business/business").business;
const membership = require("../Controllers/business/membership").membership;
const branchLocation = require("../Controllers/business/branchLocation");
const serviceCategory = require("../Controllers/business/serviceCategory").serviceCategory;
const teamController = require("../Controllers/superAdmin/teamController").listteam;
const amenities = require("../Controllers/business/amenities").amenities
const businessService = require("../Controllers/business/businessService").businessService
const client = require("../Controllers/business/client").Client
const teamMembers = require("../Controllers/business/teamMembers").teamMembers
const packages = require("../Controllers/business/packages").packages
const Sales = require("../Controllers/business/sales").Sales
const businessPrice = require("../Controllers/business/businessPrice").businessPrice
const promotion = require("../Controllers/business/promotion").promotion
const serviceTag = require("../Controllers/business/serviceTag").serviceTag
const functions = require("../../functions");
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });
const upload2 = functions.Multer("spa-saloon-images/business/images")

// const upload = functions.Multer("spa-saloon-images")
// superAdmin onBoarding Router
router.post("/superAdmin_signup", superAdminController.superAdminsignUp)
router.post("/superAdmin_login", superAdminController.superAdmin_login)
router.post("/superAdmin_updateProfile", upload.single("image"), superAdminController.updateProfile)
// businessUser Router
router.post("/addnewbusiness_user", auth, BusinesslistController.addnewbusinessuser)
router.get("/getbusinessUser", auth, BusinesslistController.getbusinessUser);
router.delete("/delete_business_user/:id", auth, BusinesslistController.deletebusiness);
router.patch("/updateStatus/:id", auth, BusinesslistController.statusUpdateBusinessUser);
router.patch("/businessuser_update/:id", auth, BusinesslistController.businessUserUpdateData);

// business category Router 
router.post("/create_Catagory", auth, upload.single("Icon"), businessCatagory.createCatagory);
router.patch("/update_Catagory/:id", auth, upload.single("Icon"), businessCatagory.updateCatagory);
router.get("/get_Catagory", auth, addbusiness.getCatagory_list);
router.delete("/delete_Catagory/:id", auth, businessCatagory.deleteCatagory);
router.patch("/update_Catagory_status/:id", auth, businessCatagory.categoryStatus)

// business info
router.post("/add_business", auth, addbusiness.createbusiness);
router.get("/get_BusinessInfo", auth, addbusiness.getbusiness);
router.delete("/deltete_business_info/:id", auth, addbusiness.deletebusiness)
router.patch("/business_Info_status/:id", auth, addbusiness.businessInfostatus)
router.patch("/updateBusiness/:id", auth,
    upload2.fields([
        { name: 'image' },
        { name: 'profileImage' }
    ]), business.updateBusiness);

//branch Router
router.get("/branch_list", auth, addbusiness.getBranchList);
router.delete("/delete_Branch", auth, branchLocation.deleteBranch);
router.patch("/branch_status/:id", branchLocation.branchstatus);

// business serviceCategory Router
router.get("/get_Service_Catagory", auth, serviceCategory.getServiceCatagory);
router.delete("/delete_Service_Catagory/:id", auth, serviceCategory.deleteServiceCatagory);
router.patch("/service_category_status/:id", auth, serviceCategory.serviceCatagorystatus);

// business Service
router.get("/get_Business_Service", auth, businessService.getBusinessService);
router.delete("/delete_Business_Service/:id", auth, businessService.deleteBusinessService);
router.patch("/update_service_status/:id", auth, businessService.updateServiceStatus)
// team Router
router.get('/get_team', auth, teamController.list_team);
router.patch("/team_status/:id", auth, teamController.teamMemberStatus);
router.delete("/delete_team_member/:id", auth, teamMembers.deleteTeamMember);

// team_title Router
router.get("/get_team_title", auth, teamMembers.getTeamTitle);
router.delete("/delete_team_title/:id", auth, teamMembers.deleteTeamTitle);
router.patch("/team_title_status/:id", auth, teamMembers.teamTitleStatus);
// Amenities Router
router.get("/get_Amenities", auth, amenities.getAmenities);
router.delete("/delete_amenities/:id", auth, amenities.deletedAmenities);
router.patch("/amenities_status/:id", auth, amenities.amenitiesstatus);
// client Router
router.get("/get_client_list", client.getClient);
router.delete("/delete_client/:id", auth, client.deleteClient);
router.patch("/client_status/:id", auth, client.updateStatus);

// package Router
router.get("/get_packages", auth, packages.getPackages);
router.delete("/delete_Packages/:id", auth, packages.deletePackages);
router.patch("/package_status/:id", auth, packages.updatePackageStatus)
// getBusinesss price
router.get("/get_business_price", auth, businessPrice.getBusinessPrice);
router.delete("/delete_business_price/:id", auth, businessPrice.deleteBusinessPrice);
router.patch("/update_status/:id", auth, businessPrice.updateStatus);
// membership
router.get("/getMembership", auth, membership.getMembership);
router.get("/getPromotion", auth, promotion.getPromotion);

// Sales
router.get("/get_sales", auth, Sales.getSales);

router.get("/getBooking", auth, booking.getBooking);


//serviceTags
router.post("/create_serviceTag", auth, serviceTag.createServiceTag);
router.get("/get_ServiceTag", auth, serviceTag.getServicetag);
router.delete("/deltete_ServiceTag/:id", auth, serviceTag.deleteServiceTag)
router.patch("/updateServiceTags/:id", auth, serviceTag.updateServiceTag)

module.exports = router