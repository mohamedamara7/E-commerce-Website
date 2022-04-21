const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const refreshdb=require("../models/refresh");
//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    isAdmin:req.body.isAdmin,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try{
    const user= await User.findOne({username:req.body.username});
    if(!user)return res.status(404).json("the user not fount");
    
    const hashedpassword=CryptoJS.AES.decrypt(user.password,process.env.PASS_SEC).toString(CryptoJS.enc.Utf8);
    
    if(hashedpassword!=req.body.password)return res.status(404).json("wrong password");
    
    const {password , ...user_data} =user._doc;
    const access_token=jwt.sign({password,...user_data},process.env.JWT_SEC,{expiresIn:'3m'});
    const refresh_token=jwt.sign({password,...user_data},process.env.jwt_refresh);
    const tok=new refreshdb({token:refresh_token}) ;
    const savedrefresh=await tok.save();
    const ret={user_data,access_token,refresh_token};
    res.status(200).json(ret);
    }catch(err){res.status(404).json(err)};
    
});

module.exports = router;
