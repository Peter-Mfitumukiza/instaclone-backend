require('dotenv').config();
const User = require('../models/UserModel')
const router = require('express').Router();
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const hashPassword = require('../utils/hash');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: `${process.env.EMAIL}`,
      pass: `${process.env.PASSWORD}`,
    },
});

router.get("/test",(req,res)=>{
    res.send("Working just fine.");
})

router.post('/check-code', async(req,res)=>{
    if(req.body.code == 0){
        return res.json({ status: "error", message: "Wrong verification code." })
    }
    let user = await User.findOne({code: req.body.code, email: req.body.email});
    if(!user) return res.json({ status: "error", message: "Wrong verification code." });

    user.status = "ACTIVE";
    user.code = null;
    console.log(user);
    User.findOneAndUpdate({code: req.body.code, _id: user.id}, user, { new: false})
        .then(user => {
            const token = jwt.sign({...user}, process.env.SECRET);
            return res.json({ status: "success", message:"Email verified successfully", data: token });
        })
        .catch(err => res.json({ status: "error", message:"Something went wrong, Please try again.", error: err}));
});

router.post('/check-reset-id', async(req,res)=>{
    if(req.body.reset_id == null){
        return res.json({ status: "error", message: "Reset id doesn't exist." });
    }
    let user = await User.findOne({reset_id: req.body.reset_id});
    if(!user) return res.json({ status: "error", message: "Reset id doesn't exist." });

    return res.json({ status: "success", message: "You can continue.", data: user });
    
})
router.post('/send-link', async(req,res)=>{
    let user = await User.findOne({email: req.body.email});
    if(!user) return res.json({status: "error", message: "Email not yet registered." });
    // Generate random link for the user
    let ran1 = Math.floor(Math.random()*(10-1+1)+1);
    let ran2 = Math.floor(Math.random()*(10-1+1)+1);
    let ran3 = Math.floor(Math.random()*(10-1+1)+1);
    let ran4 = Math.floor(Math.random()*(10-1+1)+1);
    let letters = ["A-NOL","-B","CM","D-Q/glink","-E","-F/?","/G","H]","-S","-W/","J","K","X","X-S6B"]
    let letter1 = letters[ran2];
    let letter2 = letters[ran1];
    let letter3 = letters[ran4];
    let codes = ran1+""+letter3+""+ran2+""+ran3+""+ran4+""+letter1+""+letter2;
    //hash link
    const salt = bcrypt.genSaltSync(10);
    let hashed_codes = bcrypt.hashSync(`${codes}`,salt);
    hashed_codes = hashed_codes.replace(/[/]/g, "");
    user.reset_id = hashed_codes;
    User.findOneAndUpdate({ email: req.body.email }, user, {new: false})
        .then(user => {
            const hashedLink = `http://localhost:4200/instaclone/user/reset-password/${hashed_codes}`;
            let mailOptions = {
                from: `${process.env.EMAIL}`,
                to: `${process.env.EMAIL}`,
                subject: "Reset password link",
                html: ` <h3>Hello ${user.fullname} follow the link below to reset your password.</h3> 
                    <a href= ${hashedLink} > Reset password </a>    <br><br> 
                    <p> If you didn't want to reset your instaclone password please just ignore this email.</p>`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.json({
                status: "error",
                message: "Failed to send reset password link.",
                error: error,
                });
            } else {

                res.json({ status: "success", message: "Email sent successfully." });
            }
            });
        })
        .catch(err => res.json({ status: "error", message:"Something went wrong, Please try again.", error: err}));
        
})

router.post('/change-password', async(req,res)=>{
    let password = req.body.password;
    let user  = req.body.user;
    const hashed = await hashPassword(password);
    user.password = hashed;
    user.reset_id = null;

    User.findOneAndUpdate({ email: user.email }, user, { new: false })
        .then(user =>{
            return res.json({ status: "success", message: "Password changed successfully." });
        }, error =>{
            return res.json({ status: "error", message: "Couldn't change the password." });
        })
})

router.post('/follow', async(req,res)=>{
    let user_to_follow = await User.find({ _id : req.body.user_to_follow });
    let current_user = await User.find({ _id: req.body.current_user});
    
    let followers = user_to_follow.followers;
    if(followers.includes(req.body.user_to_follow)){
        return res.json({ status: "error", message: "Already following that user." });
    }
    
    user_to_follow .followers = [...followers, req.body.current_user];
    current_user.following = [ ...current_user.following,  req.body.user_to_follow]

    User.findOneAndUpdate({ _id: user_to_follow.id }, user_to_follow, {new: false})
        .then(updated =>{
            User.findOneAndUpdate({ _id: current_user.id }, current_user, { new:false })
                .then(current_updated =>{
                    res.json({ status: "success", message: "started following the user successfully", data:{
                        following: current_user.following.length()
                    }})
                })
        },
        err =>{
            res.json({status: "error", message: "something went wrong"});
        })
})

module.exports = router;