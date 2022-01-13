const hashPassword = require("../utils/hash");
const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: `${process.env.EMAIL}`,
    pass: `${process.env.PASSWORD}`,
  },
});

const router = require("express").Router();

router.post("/register", async (req, res) => {
  let user = await User.findOne({email: req.body.email});
  if(user) {
    return  res.json({ status: "error", message: "Email already taken." });
  } 
  const hashedPassword = await hashPassword(req.body.password);
  user = new User(req.body);
  user.password = hashedPassword;
  user.status = "TEMP";

  // Generate a random code for a user
  temp_code_1 = Math.floor(Math.random()*1000)+1;
  temp_code_2 = Math.floor(Math.random()*1000)+1
  user.code = `${temp_code_1}${temp_code_2}`;
  let mailOptions = {
    from: `${process.env.EMAIL}`,
    to: `${process.env.EMAIL}`,
    subject: "Email verification code",
    html: ` <h3>Use the code below to confirm your email email address</h3> <h2> ${user.code} </h2><br><br> 
        <p> If you didn't sign up to instaclone please just ignore this email.</p>`,
  };
  
  transporter.sendMail(mailOptions, async(error, info) => {
    if (error) {
      res.json({
        status: "error",
        message: "Failed to sent verification code",
        error: error,
      });
    } else {
      await user.save();
      res.json({ status: "success", message: "Email sent successfully." });}
  });
});

router.post("/login", async (req, res) => {
  await User.findOne({ email: req.body.email })
    .then(async (user) => {
      if (!user) {
        return res.json({
          status: "error",
          message: "Invalid email or password.",
        });
      } else {
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
          return res.json({
            status: "error",
            message: "Invalid email or password.",
          });
        } else {
          if (user.status !== "ACTIVE") {
            return res.json({
              status: "error",
              message: "Account not currently active.",
            });
          } else {
            let token = await jwt.sign({ ...user }, process.env.SECRET);
            return res.json({
                status: "success",
                message: "Logged in successfully.",
                data: token,
            });
          }
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;