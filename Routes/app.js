'use strict';
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const expressLayouts = require('express-ejs-layouts');

const app = express();

//Database File Module
const DB = require("../Models/DB");

//Used for File Uploading 
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");

//Static Files
app.use(express.static(path.resolve("./public/")));

//Password Encryption,Session Management and Authentication
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const verifyRecaptcha=require("../config/CAPTCHACODE.js");

app.use(session({
    secret: process.env.SS_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'Email', passwordField: 'Password' },
DB.Colls_StdData.authenticate()   
));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(function (user, cb) {
    cb(null, user);
});
passport.deserializeUser(function (user, cb) {
    cb(null, user);
});

// Set Templating Engine and Layout 
app.use(expressLayouts);
app.set("layout", "./Layout/General");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Admin Zone
const AdminRoute = require("./admin.js");
app.use("/Admin", AdminRoute);

//Student Zone
const StudentRoute = require("./Student.js");
const { json } = require('express');
app.use("/Student", StudentRoute);

//Routes
//Index
app.get("/", (req, res) => {
    DB.Colls_Notification.find(function(err,nt){
        res.render("./Home/index",{Notifications:nt});
    });
});

app.post("/Home/Subscribe", (req, res) => {
      verifyRecaptcha(req.body.RecaptchaToken,(ans)=>{
         if(ans){
            DB.Colls_Subscribe.findOne({Email:req.body.SEmail},function(err,succ){
                if(succ!=null)
                return res.json({Status:"Error",Message:"You are already Subscribed."});
                else
                {
                  const sub=DB.Colls_Subscribe({
                      Name:req.body.SName,
                      Email:req.body.SEmail
                  });
                  sub.save(function(err){
                      if(!err){
                          return res.json({Status:"Success"});
                      }else
                       return res.json({Status:"Fail",Message:"Unable to subscribe."});
                     });
                }     
             });
          }else{
            return res.json({Status:"Fail",Message:"Recaptcha couldn't verify."});
          }
      });
});

//Registration Page
app.get("/Home/Registration", (req, res) => {
    res.render("./Home/Registration");
});

//Tutorial Page
app.get("/Home/Tutorial", (req, res) => {
    res.render("./Home/Tutorial");
});

//Contact Page
app.get("/Home/Contact", (req, res) => {
    res.render("./Home/Contact");
});

//Login Page
app.get("/Home/Login", (req, res) => {
    res.render("./Home/Login");
});

//Contact Post
app.post("/Home/Contact", function (req, res) {
    verifyRecaptcha(req.body['g-recaptcha-response'],(ans)=>{
        if(ans){
            const Query = new DB.Colls_Query({
                Name: req.body.Name,
                Email: req.body.Email,
                Contact: req.body.Contact,
                Query: req.body.Query
            });
            Query.save(function (err) {
                var ans = "";
                if (err)
                    ans = "Sorry unable to save query.";
                else
                    ans = "Your query saved successfully,we response you soon.";
                res.render("./Home/Contact", { msg: ans });
            });
        }else
           res.render("./Home/Contact", { msg: "Captcha couldn't verify." });
    });
});

//Registration Post 
app.post("/Home/Registration", function (req, res) {
    var msg = "";
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        verifyRecaptcha(fields['g-recaptcha-response'],(ans)=>{
           if(ans){
            DB.Colls_StdData.find({ Email: fields.Email }, function (err, std) {
                if (std.length <= 0) {
                    if (err)
                        msg = "Oops! error occured.";
                    else {
                        var oldPath = file.ProfilePicture.filepath;
                        var StudentProfileImage = file.ProfilePicture.newFilename + path.extname(file.ProfilePicture.originalFilename);
                        var newpath = "./Content/StudentProfileImage/" + StudentProfileImage;
                        fs.readFile(oldPath, function (err, data) {
                            fs.writeFile(newpath, data, function (err) {
                                if (err)
                                    msg = "Oops! error occured in saving the profile picture.";
                                else {
                                    const stdData = new DB.Colls_StdData({
                                        username: fields.Email,
                                        Email: fields.Email,
                                        EnrollmentNumber: fields.EnrollmentNumber,
                                        Name: fields.Name,
                                        Gender: fields.Gender,
                                        College: fields.College,
                                        Course: fields.Course,
                                        Year: fields.Year,
                                        Contact: fields.Contact,
                                        Address: fields.Address,
                                        ProfilePicture: StudentProfileImage
                                    });
                                    
                                    DB.Colls_StdData.register(stdData, fields.Password, function (err, user) {
                                        if (err) {
                                            res.render("./Home/Registration", { msg: "Sorry! Due to some technicle issue we are unable to registerd you." + err });
                                        } else {
                                            res.render("./Home/Login", { msg: "You are successfully registered.Please continue to login." });
                                        }
                                    });
                                }
                            });
                        });
                        //Deleting file from temporary location
                        fs.unlink(oldPath, function (err) {
                            if (err)
                                console.log(err);
                            msg = "Oops! error occured in deleting the temporary file.";
                        });
                    }
                } else
                    res.render("./Home/Registration", { msg: "Email Already registered. Please Login" });
            });
           }else
             res.render("./Home/Registration", { msg: "Captcha couldn't verify." });
        });
    });
});

//Login Post
app.post("/Home/Login", (req, res) => {
    verifyRecaptcha(req.body['g-recaptcha-response'],(ans)=>{
       if(ans){
        const user = new DB.Colls_StdData({
            username: req.body.Email,
            Password: req.body.Password
        });
        req.login(user, function (err) {
            if (err) {
                res.render("./Home/Login.ejs", { msg: "An error occured."});
            } else {
                const authenticate=DB.Colls_StdData.authenticate();
                authenticate(req.body.Email,req.body.Password,function(err,result){
                   if(result==false)
                    res.render("./Home/Login.ejs", { msg: "Invalid email or password."});
                   else
                   {
                      if (req.body.Email == "StudyStudent@gmail.com")
                         res.redirect("/Admin/Welcome");
                      else {
                         if (req.user.Status != "Active") {
                          res.render("./Home/Login.ejs", { msg: "Your account is blocked by admin.You can't log-in." });
                         } else{
                           res.redirect("/Student/Greetings");
                         }
                       }
                   }
                });
            }
        });
       }else
       res.render("./Home/Login.ejs", { msg: "Captcaha couldn't verify."});
    });
});

app.listen(process.env.PORT || 5000, () => console.log("server is running"));