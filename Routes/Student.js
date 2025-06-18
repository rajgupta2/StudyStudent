const express = require("express");
const ejs = require("ejs");
const expressLayouts = require('express-ejs-layouts');
//Database File Module
const DB = require("../Models/DB");

//Used for File Uploading
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectId;
const Student = express();

//Static Files
Student.use(express.static(path.resolve("./public/")));

// Set Templating Engine and Layout
Student.use(expressLayouts);
Student.set("layout", "./Layout/Student");
Student.set("view engine", "ejs");
Student.use(express.json());
Student.use(express.urlencoded({ extended: true }));

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.redirect('/Home/Login');
}

//Routes
Student.get("/Greetings", isAuthenticated, (req, res) => {
    DB.Colls_Subject.find({ Status: "On" }).then(function (sub) {
        res.render("./Student/Greetings.ejs", { User_Email: (req.user.username || req.user.Email), Test: sub });
    }).catch((err) => {
        //console.log(err);
        res.redirect("/Home/Login");
    });
});

Student.get("/Submit_Assignment", isAuthenticated, (req, res) => {

    res.render("./Student/Submit_Assignment.ejs", { User_Email: (req.user.username || req.user.Email) });
});

Student.post("/Submit_Assignment", isAuthenticated, (req, res) => {
    var msg = "";
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        var oldPath = file.Assignment.filepath;
        var SubAss = file.Assignment.newFilename + path.extname(file.Assignment.originalFilename);
        var newpath = "./Content/SubmittedAssignment/" + SubAss;
        fs.readFile(oldPath, function (err, data) {
            if (!err) {
                fs.writeFile(newpath, data, function (err) {
                    if (!err) {
                        DB.Colls_StdData.find({ Email: req.user.username || req.user.Email }).then(function (student) {
                            var sa = new DB.Colls_SubmitAssignment({
                                Student_Email: req.user.username || req.user.Email,
                                Student_Name: student.Name,
                                Subject: fields.Subject,
                                Assignment: SubAss,
                            });
                            sa.save().then(() => {
                                res.render("./Student/Submit_Assignment.ejs", { User_Email: (req.user.username || req.user.Email), msg: "Saved Successfully." });
                            });
                        });
                    } else
                        res.render("./Student/Submit_Assignment.ejs", { User_Email: (req.user.username || req.user.Email), msg: "Failed to save." });
                });
            } else
                res.render("./Student/Submit_Assignment.ejs", { User_Email: (req.user.username || req.user.Email), msg: "Error(read):Failed to save." });
        });
        //Deleting file from temporary location
        fs.unlink(oldPath, function (err) {
            if (err)
                msg = "Oops! error occured in deleting the temporary file.";
        });
    });
});

Student.get("/View_Assignment", isAuthenticated, (req, res) => {
    DB.Colls_GiveAssignment.find().then(function (GAssignment) {
        DB.Colls_SubmitAssignment.find({ Student_Email: req.user.username || req.user.Email }).then(function (SAssignment) {
                res.render("./Student/View_Assignment.ejs", { User_Email: (req.user.username || req.user.Email), Assignment: GAssignment, SubmittedAssignment: SAssignment });
            }).catch((err) => {
                res.render("./Student/View_Assignment.ejs", { User_Email: (req.user.username || req.user.Email), msg: "An error occured." });
            });
        }).catch(function (err) {
            res.render("./Student/View_Assignment.ejs", { User_Email: (req.user.username || req.user.Email), msg: "An error occured." });
    });
});

Student.get("/Study_Materials", isAuthenticated, (req, res) => {
    DB.Colls_StudyMaterial.find().then(function (sa) {
            res.render("./Student/Study_Material.ejs", { StudyMaterials: sa, User_Email: (req.user.username || req.user.Email) });
        }).catch((err) => {
            // console.log(err);
            res.render("./Student/Study_Material.ejs", { StudyMaterials: "An error occured.", User_Email: (req.user.username || req.user.Email) });
    });
});

//Download
Student.get("/Download", isAuthenticated, (req, res) => {
    filepath = "./Content/" + req.query.file;
    res.download(filepath);
});

Student.get("/Give_FeedBack", isAuthenticated, (req, res) => {
    res.render("./Student/Give_FeedBack.ejs", { User_Email: (req.user.username || req.user.Email) });
});

Student.post("/Give_FeedBack", isAuthenticated, (req, res) => {
    var fd = DB.Colls_Feedback({
        Student_Id: req.user.username,
        Student_Name: req.body.Student_Name,
        Feedback_Subject: req.body.Feedback_Subject,
        Message: req.body.Message,
    });
    fd.save().then(()=>{
        res.render("./Student/Give_FeedBack.ejs", { User_Email: (req.user.username || req.user.Email), msg: "Saved Successfully." });
    }).catch(function (err) {
            res.render("./Student/Give_FeedBack.ejs", { User_Email: (req.user.username || req.user.Email), msg: "Failed to save." });
    });
});
Student.get("/ChangePassword", isAuthenticated, (req, res) => {
    res.render("./Student/ChangePassword.ejs", { User_Email: (req.user.username || req.user.Email) });
});

Student.post("/ChangePassword", isAuthenticated, (req, res) => {
    DB.Colls_StdData.findByUsername(req.user.username || req.user.Email).then(function (err, user) {
        user.changePassword(req.body.Password, req.body.NewPassword).then(function () {
                res.render("./Student/ChangePassword.ejs", { msg: "Password changed successfully..", User_Email: (req.user.username || req.user.Email) });
        }).catch(function (err) {
            res.render("./Student/ChangePassword.ejs", { msg: "Old Password is incorrect.", User_Email: (req.user.username || req.user.Email) });
        });

    }).catch(function (err) {
        res.redirect("/Home/Login");
    });
});


Student.get("/logout", (req, res) => {
    req.session.destroy();
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/Home/Login');
    });
});

Student.get("/Test", isAuthenticated, (req, res) => {
    DB.Colls_Questions.find({ Subject: req.query.sub }).then( function (ques) {
        return res.render("./Student/Test.ejs", { Questions: ques });
    }).catch( function (err) {
        return res.render("./Student/Test.ejs", { msg: err.message });
    });
});

Student.post("/Test", isAuthenticated, (req, res) => {
    Student.set("result", 0);
    for (const field in req.body) {
        var id = field.substring(field.indexOf("_") + 1);
        DB.Colls_Questions.findOne({ _id: new ObjectId(id) }).then( function (QA) {
            var UserAns = `${req.body[field]}`;
            if (UserAns == QA.Answer) {
                var preresult = Student.get("result");
                Student.set("result", preresult + 1);//result++
            }
        }).catch( function (err) {
                res.redirect("/Home/Login");
        });
    }
    //Saving Result in Database
    DB.Colls_StdData.find({ Email: req.user.username || req.user.Email }).then( function (std) {
        var tr = DB.Colls_Result({
            Email_OF_Student: req.user.username || req.user.Email,
            Marks_Obtained: Student.get("result"),
            Full_Marks: 20,
            Course: std.Course,
            Name: std.Name,
            Subject: req.query.sub
        });
        tr.save().then( function(){
                    return res.render("./Student/Test", { msg: "You have got " + Student.get("result") + " out of 20 marks." });
        }).catch( function (err) {
                    return res.render("./Student/Test", { msg: "An error occured"+err.message });
        });
    }).catch(function (err) {
        return res.render("./Student/Test", { msg: "An error occured"+err.message });
    });
});
module.exports = Student;
