require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const port = process.env.port;
const connectDatabase = require("./src/Config/Db");
const bodyParser = require("body-parser");
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const cronJobs = require('./cronjobs');

const app = express();
app.use(cors());
app.engine('handlebars', engine({
  extname: '.hbs', defaultLayout: "main",
  handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars');
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
global.authed = false;
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

//router
const businessRouter = require("./src/Routes/businessRoutes");
const adminRouter = require("./src/Routes/superAdminRoutes");

//use routes
app.use("/api/v1", businessRouter);
app.use("/superAdmin/v1", adminRouter);
// app.use(functions.recursivelyParseJSON(req.body))

//Database connect
connectDatabase();


cronJobs.initiate();

//listen port
app.listen(port, () => {
  console.log(`Server is listining on port : ${port}`);
});
