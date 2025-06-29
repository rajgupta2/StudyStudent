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
const cookieParser = require('cookie-parser');
const verifyRecaptcha = require("../config/CAPTCHACODE.js");
const Email = require("../config/Email.js");
app.use(cookieParser(process.env.SS_SECRET));
const MemoryStore = require('memorystore')(session)
app.use(session({
    cookie: {
        maxAge: 86400000
    },
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SS_SECRET,
    resave: false,
    saveUninitialized: false
}));

const passport = require("passport");

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(DB.Colls_StdData.serializeUser());
passport.deserializeUser(DB.Colls_StdData.deserializeUser());

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
app.use("/Student", StudentRoute);

//Google Sign in code
const Google_Sign = require("../config/GOOGLESIGN.js");
app.use("/Google", Google_Sign);

//Index
app.get("/", async (req, res) => {
    DB.Colls_Notification.find().then((nt) => {
        res.render("./Home/index", { Notifications: nt });
    }).catch((err) => {
        //console.log(err);
        res.render("./Home/index", { Notifications: null });
    });
});

app.post("/Home/Subscribe", (req, res) => {
    verifyRecaptcha(req.body.RecaptchaToken, (ans) => {
        if (ans) {
            const HasSent = {
                Email: req.body.SEmail,
                Student_Name: req.body.SName,
                Code: req.body.Code
            }
            Email.confirmEmail(HasSent, (err, val, message) => {
                if (err)
                    return res.json({ Status: "Fail", Message: "Error occured." });
                if (val) {
                    DB.Colls_Subscribe.findOne({ Email: req.body.SEmail }, function (err, succ) {
                        if (succ)
                            return res.json({ Status: "Error", Message: "You are already Subscribed." });
                        else {
                            const sub = DB.Colls_Subscribe({
                                Name: req.body.SName,
                                Email: req.body.SEmail
                            });
                            sub.save().then(() => {
                                return res.json({ Status: "Fail", Message: "Unable to subscribe." });
                            }).catch(function (err) {
                                return res.json({ Status: "Success" });
                            });
                        }
                    });
                } else
                    return res.json({ Status: "Fail", Message: message });
            });
        } else {
            return res.json({ Status: "Fail", Message: "Recaptcha couldn't verify." });
        }
    });
});

//Registration Page
app.get("/Home/Registration", (req, res) => {
    res.render("./Home/Registration");
});

//Registration Page
app.get("/Home/About-us", (req, res) => {
    res.render("./Home/About-us");
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
    req.body.Email = req.body.Email.toLowerCase();
    verifyRecaptcha(req.body['g-recaptcha-response'], (result) => {
        if (result) {
            var HasSent = { Email: req.body.Email, Student_Name: req.body.Name, Code: req.body.Code }
            Email.confirmEmail(HasSent, (err, val, message) => {
                if (err)
                    res.render("./Home/Contact", { msg: "An error occured." });
                if (val) {
                    const Query = new DB.Colls_Query({
                        Name: req.body.Name,
                        Email: req.body.Email,
                        Contact: req.body.Contact,
                        Query: req.body.Query
                    });
                    Query.save().then(() => {
                        var ans = "Your query saved successfully,we response you soon.";
                        res.render("./Home/Contact", { msg: ans });
                    }).catch(function (err) {

                        var ans = "Sorry unable to save query.";
                        res.render("./Home/Contact", { msg: ans });
                    });
                } else
                    res.render("./Home/Contact", { msg: message });
            });

        } else
            res.render("./Home/Contact", { msg: "Captcha couldn't verify." });
    });
});

//Registration Post
app.post("/Home/Registration", function (req, res) {
    var msg = "";
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        fields.Email=fields.Email.toLowerCase();
        verifyRecaptcha(fields['g-recaptcha-response'], (ans) => {
            if (ans) {
                //VerifyEmail
                Email.confirmEmail({ Email: fields.Email, Student_Name: fields.Name, Code: fields.Code }, (err, isVerify, message) => {
                    if (err)
                       return res.render("./Home/Registration", { msg: "An error occured in Email Verification." });
                    if (isVerify===true) {
                        var oldPath = file.ProfilePicture.filepath;
                        var StudentProfileImage = file.ProfilePicture.newFilename + path.extname(file.ProfilePicture.originalFilename);
                        var newpath = "./Content/StudentProfileImage/" + StudentProfileImage;
                        fs.readFile(oldPath, function (err, data) {
                            fs.writeFile(newpath, data, function (err) {
                                if (err)
                                    msg = "Oops! error occured in saving the profile picture.";
                                else {
                                    const stdData = new DB.Colls_StdData({
                                        Email: fields.Email,
                                        EnrollmentNumber: fields.EnrollmentNumber,
                                        Name: fields.Name,
                                        Gender: fields.Gender,
                                        College: fields.College,
                                        Course: fields.Course,
                                        Year: fields.Year,
                                        Contact: fields.Contact,
                                        Address: fields.Address,
                                        ProfilePicture: StudentProfileImage,
                                    });

                                    DB.Colls_StdData.register(stdData, fields.Password).then((user)=>{
                                            res.render("./Home/Login", { msg: "You are successfully registered.Please continue to login." });
                                    }).catch((err)=>{
                                          if (err.name === 'UserExistsError') {
                                                return res.render("./Home/Registration", { msg: "User already exists."});
                                            }
                                            res.render("./Home/Registration", { msg: "Registration failed." + err });
                                    });
                                }
                            });
                        });
                        //Deleting file from temporary location
                        fs.unlink(oldPath, function (err) {
                            if (err)
                                // console.log(err);
                                msg = "Oops! error occured in deleting the temporary file.";
                        });
                    } else
                        res.render("./Home/Registration", { msg: message });
                });
            } else
                res.render("./Home/Registration", { msg: "Captcha couldn't verify." });
        });
    });
});

//Login Post
app.post("/Home/Login", (req, res) => {
    req.body.Email = req.body.Email.toLowerCase();
    verifyRecaptcha(req.body['g-recaptcha-response'], (ans) => {
        if (ans) {
            const authenticate = DB.Colls_StdData.authenticate();
            authenticate(req.body.Email, req.body.Password, function (err, result) {
                // If correct, returns the user object.
                // If incorrect, returns false.
                if (err || result == false)
                    return res.render("./Home/Login.ejs", { msg: "Invalid email or password." });
                if (result.Email == "studystudent@gmail.com") {
                    req.login(result, function (err) {
                        if (err) {
                            return res.render("./Home/Login.ejs", { msg: "Login failed. Please try again." });
                        }
                        return res.redirect("/Admin/Welcome");
                    });
                } else {
                    if (result.Status != "Active") {
                        return res.render("./Home/Login.ejs", { msg: "Your account is blocked by admin.You can't log-in." });
                    }
                    req.login(result, function (err) {
                        if (err) {
                            return res.render("./Home/Login.ejs", { msg: "Login failed. Please try again." });
                        } else {
                            res.redirect("/Student/Greetings");
                        }
                    });
                }
            });
        } else
            res.render("./Home/Login.ejs", { msg: "Captcaha couldn't verify." });
    });
});

//Registration Page
app.post("/SendCode", (req, res) => {
    var Send = {
        to: req.body.SEmail,
        Name: req.body.SName,
        subject: "Email Verification"
    }
    Email.SendEmailForVerification(Send, (err, info) => {
        if (!err)
            res.json({ Success: true });
        else
            res.json({ Success: false });
    });
});

app.listen(process.env.PORT || 5000, () => console.log("server is running"));