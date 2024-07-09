const router = require("express").Router();
const BusinesslistController = require("../controller/BusinessController")

// business Router
router.get("/businesslist",BusinesslistController.getBusinesslist)

module.exports = router