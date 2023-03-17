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

//Routes
Student.get("/Greetings", (req, res) => {
    if (!req.isAuthenticated())
        res.redirect("/Home/Login");
    else {
        DB.Colls_Subject.find({ Status: "On" }, function (err, sub) {
            res.render("./Student/Greetings.ejs", { User_Email: (req.user.username || req.user.Email), Test: sub });
        });
    }
});

Student.get("/Submit_Assignment", (req, res) => {
    if (!req.isAuthenticated())
        res.redirect("/Home/Login");
    else {
        res.render("./Student/Submit_Assignment.ejs", {  User_Email: (req.user.username || req.user.Email) });
    }
});

Student.post("/Submit_Assignment", (req, res) => {
    if (!req.isAuthenticated())
        res.redirect("/Home/Login");
    else {
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
                            DB.Colls_StdData.find({ Email: req.user.username }, function (err, student) {
                                var sa = new DB.Colls_SubmitAssignment({
                                    Student_Email: req.user.username,
                                    Student_Name: student.Name,
                                    Subject: fields.Subject,
                                    Assignment: SubAss,
                                });
                                sa.save(() => {
                                    res.render("./Student/Submit_Assignment.ejs", {  User_Email: (req.user.username || req.user.Email), msg: "Saved Successfully." });
                                });
                            });
                        } else
                            res.render("./Student/Submit_Assignment.ejs", {  User_Email: (req.user.username || req.user.Email), msg: "Failed to save." });
                    });
                } else
                    res.render("./Student/Submit_Assignment.ejs", {  User_Email: (req.user.username || req.user.Email), msg: "Error(read):Failed to save." });
            });
            //Deleting file from temporary location
            fs.unlink(oldPath, function (err) {
                if (err)
                    msg = "Oops! error occured in deleting the temporary file.";
            });
        });
    }
});

Student.get("/View_Assignment", (req, res) => {
    if (!req.isAuthenticated())
        res.redirect("/Home/Login")
    else {
        DB.Colls_GiveAssignment.find(function (err, GAssignment) {
            if (err)
                res.render("./Student/View_Assignment.ejs", {  User_Email: (req.user.username || req.user.Email), msg: "An error occured." });
            else {
                DB.Colls_SubmitAssignment.find({ Student_Email: req.user.username }, function (err, SAssignment) {
                    if (err)
                        res.render("./Student/View_Assignment.ejs", {  User_Email: (req.user.username || req.user.Email), msg: "An error occured." });
                    else
                        res.render("./Student/View_Assignment.ejs", {  User_Email: (req.user.username || req.user.Email), Assignment: GAssignment, SubmittedAssignment: SAssignment });
                });
            }
        });
    }
});

Student.get("/Study_Materials", (req, res) => {
    if (!req.isAuthenticated())
        res.redirect("/Home/Login")
    else {
        DB.Colls_StudyMaterial.find(function (err, sa) {
            res.render("./Student/Study_Material.ejs", { StudyMaterials: sa,  User_Email: (req.user.username || req.user.Email) });
        });
    }
});

//Download
Student.get("/Download", function (req, res) {
    if (!req.isAuthenticated())
        res.redirect("/Home/Login")
    else {
        filepath = "./Content/" + req.query.file;
        res.download(filepath);
    }
});

Student.get("/Give_FeedBack", (req, res) => {
    if (!req.isAuthenticated())
        res.redirect("/Home/Login")
    else
        res.render("./Student/Give_FeedBack.ejs", {  User_Email: (req.user.username || req.user.Email) });
});

Student.post("/Give_FeedBack", (req, res) => {
    if (!req.isAuthenticated())
        res.redirect("/Home/Login")
    else {
        var fd = DB.Colls_Feedback({
            Student_Id: req.user.username,
            Student_Name: req.body.Student_Name,
            Feedback_Subject: req.body.Feedback_Subject,
            Message: req.body.Message,
        });
        fd.save(function (err) {
            if (err)
                res.render("./Student/Give_FeedBack.ejs", {  User_Email: (req.user.username || req.user.Email), msg: "Failed to save." });
            else
                res.render("./Student/Give_FeedBack.ejs", {  User_Email: (req.user.username || req.user.Email), msg: "Saved Successfully." });
        });
    }
});
Student.get("/ChangePassword", function (req, res) {
    if (!req.isAuthenticated())
        res.redirect("/Home/Login")
    else {
        res.render("./Student/ChangePassword.ejs", {  User_Email: (req.user.username || req.user.Email) });
    }
});

Student.post("/ChangePassword", function (req, res) {
    if (!req.isAuthenticated())
        res.redirect("/Home/Login")
    else {
        DB.Colls_StdData.findByUsername(req.user.username, function (err, user) {
            user.changePassword(req.body.Password, req.body.NewPassword, function (err) {
                if (err) {
                    res.render("./Student/ChangePassword.ejs", { msg: "Old Password is incorrect.",  User_Email: (req.user.username || req.user.Email) });
                } else {
                    res.render("./Student/ChangePassword.ejs", { msg: "Password changed successfully..",  User_Email: (req.user.username || req.user.Email) });
                }
            });

        });
    }
});


Student.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

Student.get("/Test", function (req, res) {
    if (req.isAuthenticated()) {
        DB.Colls_Questions.find({ Subject: req.query.sub }, function (err, ques) {
            return res.render("./Student/Test.ejs", { Questions: ques });
        });

    } else
        res.redirect("/Home/Login");
});

Student.post("/Test", function (req, res) {
    if (req.isAuthenticated()) {
            Student.set("result",0);
            for (const field in req.body) {  
                var id = field.substring(field.indexOf("_") + 1);
                DB.Colls_Questions.findOne({ _id: new ObjectId(id) }, function (err, QA) {
                    var UserAns =`${req.body[field]}`;
                    if (UserAns == QA.Answer) {
                        var preresult=Student.get("result");
                        Student.set("result",preresult+1);//result++
                    }
                });
            }
            //Saving Result in Database
            DB.Colls_StdData.find({ Email: req.user.username }, function (err, std) {
                var tr = DB.Colls_Result({
                    Email_OF_Student: req.user.username,
                    Marks_Obtained: Student.get("result"),
                    Full_Marks: 20,
                    Course: std.Course,
                    Name: std.Name,
                    Subject: req.query.sub
                });
                tr.save(function (err) {
                    if (err)
                        return res.render("./Student/Test", { msg: "An error occured" });
                    else
                        return res.render("./Student/Test", { msg: "You have got " + Student.get("result") + " out of 20 marks." });
                })
            });
}else
    res.redirect("/Home/Login");
});
module.exports = Student;
