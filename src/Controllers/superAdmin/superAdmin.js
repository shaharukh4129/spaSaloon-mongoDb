const superAdminmodel = require("../../Model/admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../Middleware/auth");
let superAdminController = {
    superAdminsignUp: async (req, res) => {
        try {
            const { email, password, adminType, name } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const check = await superAdminmodel.findOne({ email });
            if (check) {
                return res.status(208).json({
                    status: false,
                    message: "Email Already Exists",
                    data: check
                });
            }
            const signUp = await superAdminmodel.create({ name, email, password: hashedPassword, adminType });
            if (signUp) {
                return res.status(200).json({
                    status: true,
                    message: "Successfully Registered",
                    result: signUp,
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: "Registration failed",
                });
            }
        } catch (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).json({
                status: false,
                message: "Internal Server Error",
            });
        }
    },
    superAdmin_login: async(req,res)=>{
            try {
              let { email} = req.body;
              const check = await superAdminmodel.findOne({ email }).collation({ locale: "en", strength: 2 });
              if (!check) {
                return res.status(400).json({
                  status: false,
                  message: "Email or mobile number is not registered",
                });
              } else {
                  const validPassword = await bcrypt.compare(req.body.password,check.password);
                  if (validPassword) {
                    const payload = {
                      _id: check._id,
                      email: check.email,
                      name: check.name,
                      userType:check.userType,
                    };
                    let envsecret = auth.getSecretToken();
                    let token = jwt.sign(payload, envsecret);
                    //login response
                    return res.status(200).json({
                      status: true,
                      message: "Successfully Logged in",
                      token: token,
                      result: check,
                    });
                  } else {
                    return res.status(400).json({
                      status: false,
                      message: "Password is Wrong",
                    });
                  }
              }
            } catch (error) {
              if (error) throw error
            }
      
    },
    updateProfile : async(req,res)=>{
      try{
        let { email,name,number} = req.body;
        let checkEmail = await superAdminmodel.findOne({email:email});
        if(checkEmail){
          const image = req.file ? req.file.location : req.body.image;
          let payload ={
            email:email,
            name:name,
            number:number,
            image:image
          }
          let updateData = await superAdminmodel.findByIdAndUpdate({_id:checkEmail._id},{$set:{payload}},{new:true});
          res.status(200).josn({
            message:"update data successfully",
            statsu:true,
            data:updateData
          })
        }else{
          res.status(404).json({
            message:"No Data Found",
          })
        }
      }catch(err){
         throw err
      }
    }



}
module.exports = superAdminController;