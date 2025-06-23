const express = require("express");
const expressLayouts = require('express-ejs-layouts');
//Database File Module
const DB = require("../Models/DB");

//Used for File Uploading
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const ObjectId = require("mongodb").ObjectId;
const Email = require("../config/Email.js");
const { log } = require("console");
const Admin = express();

//Static Files
Admin.use(express.static(path.resolve("./public/")));

// Set Templating Engine and Layout
Admin.use(expressLayouts);
Admin.set("layout", "./Layout/admin");
Admin.set("view engine", "ejs");
Admin.use(express.json());
Admin.use(express.urlencoded({ extended: true }));

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        if(req.user.role==="admin") return next();
        return res.status(403).send("Forbidden: You are not allowed to access this page.");
    }
    return res.redirect('/Home/Login');
}
//Welcome
Admin.get("/Welcome", isAuthenticated, (req, res) => {
    res.render("./Admin/Welcome.ejs");
});

//Upload_Assignment
Admin.get("/Give_Assignment", isAuthenticated, function (req, res) {
    res.render("./Admin/Give_Assignment.ejs");
});

//Upload_Assignment post
Admin.post("/Give_Assignment", isAuthenticated, function (req, res) {
    var msg = "";
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        var oldPath = file.Attachment.filepath;
        var AssignmentAttachments = file.Attachment.newFilename + path.extname(file.Attachment.originalFilename);
        var newpath = "./Content/AssignmentAttachments/" + AssignmentAttachments;
        fs.readFile(oldPath, function (err, data) {
            fs.writeFile(newpath, data, function (err) {
                if (err){
                    msg = "Oops! error occured in saving the attachement.";
                     res.render("./Admin/Give_Assignment.ejs", { upmsg: err });
                }else {
                    const ass = new DB.Colls_GiveAssignment({
                        Title: fields.Title,
                        Deadline: fields.Deadline,
                        Description: fields.Description,
                        Attachment: AssignmentAttachments
                    });
                    ass.save().then(function (succ) {
                        msg = "Saved assignment successfully.";
                          res.render("./Admin/Give_Assignment.ejs", { upmsg: msg });
                    }).catch((err) => {
                         res.render("./Admin/Give_Assignment.ejs", { upmsg: "Sorry! Due to some technicle issue we are unable to upload assignment." });
                    });
                }
            });
            //Deleting file from temporary location
            fs.unlink(oldPath, function (err) {
                if (err)
                    msg = "Oops! error occured in deleting the temporary file.";
            });
        });
    });
});

//Show Enquiry
Admin.get("/ShowEnquiry", isAuthenticated, function (req, res) {
    DB.Colls_Query.find().then(function (q) {
        res.render("./Admin/ShowEnquiry.ejs", { DBqueries: q });
    }).catch((err) => {
        res.render("./Admin/ShowEnquiry.ejs", { msg: err.message });
    });
});

//Send_Email
Admin.get("/Send_Email", isAuthenticated, function (req, res) {
    res.render("./Admin/Send_Email.ejs");
});

Admin.post("/Send_Email", isAuthenticated, function (req, res) {
    const Send = {
        to: req.body.SendTo,
        subject: req.body.Subject,
        html: req.body.Message,
    }
    Email.SendMail(Send, (err, info) => {
        if (err) {
            //console.log(err);
            res.render("./Admin/Send_Email.ejs", { msg: "Sorry! Unable to send Email." });
        } else {
            //console.log(info);
            res.render("./Admin/Send_Email.ejs", { msg: "Email sent successfully." });
        }

    });
});

//Delete Enquiry
Admin.get("/DeleteNotification", isAuthenticated, function (req, res) {
    DB.Colls_Notification.deleteOne({ _id: new ObjectId(req.query.pk) }).catch(function (err) {
        res.redirect("/Admin/News_Update?msg=Error Occured in deletion");

    }).then(() => {
        res.redirect("/Admin/News_Update?msg=Successfully Deleted.");
    });
});


//Student_Management
Admin.get("/Student_Management", isAuthenticated, function (req, res) {
    DB.Colls_StdData.find().then(function (sm) {
        res.render("./Admin/Student_Management.ejs", { StdData: sm });
    }).catch(function (err) {
        console.log(err.message);
        res.render("./Admin/Student_Management.ejs", { msg: err.message });
    });
});


//News_Update
Admin.get("/News_Update", isAuthenticated, function (req, res) {
    DB.Colls_Notification.find().then(function (succ) {
        res.render("./Admin/News_Update.ejs", { Notification: succ, addmsg: req.query.msg });
    });
});

//Feedback
Admin.get("/View_Feedback", isAuthenticated, function (req, res) {
    DB.Colls_Feedback.find().then(function (succ) {
        res.render("./Admin/View_Feedback.ejs", { Feedbacks: succ });
    });
});

//Subject_Management
Admin.get("/Subject_Management", isAuthenticated, function (req, res) {
    DB.Colls_Subject.find().then(function (sub) {
        res.render("./Admin/Subject_Management.ejs", { Subjects: sub, addmsg: Admin.get("addsub") });
        Admin.set("addsub", "");
    });
});


//Subject_Management post
Admin.post("/Subject_Management", isAuthenticated, function (req, res) {
    DB.Colls_Subject.find({ Subject: req.body.searchSubject }).then(function (sub) {
        if (sub.length > 0)
            res.render("./Admin/Subject_Management.ejs", { Subjects: sub });
        else
            res.render("./Admin/Subject_Management.ejs", { Subjects: sub, addmsg: "Subject Not found." });
    });
});

//ADD Subject post
Admin.post("/AddSubject", isAuthenticated, function (req, res) {
    var sub = new DB.Colls_Subject({
        Subject: req.body.Subject
    });
    sub.save().then(() => {
        Admin.set("addsub", "Saved succesfully.");
        res.redirect("/Admin/Subject_Management");
    }).catch(function (err) {
        Admin.set("addsub", "Failed to save");
        res.redirect("/Admin/Subject_Management");
    });
});

//Remove Subject get
Admin.get("/RemoveSubject", isAuthenticated, function (req, res) {
    //REMOVE ALL QUESTIONS RELATED THIS SUBJECT
    DB.Colls_Questions.deleteMany({ Subject: req.query.sub });
    //Removing Subject
    DB.Colls_Subject.deleteOne({ Subject: req.query.sub }).then(function (sub) {
        Admin.set("addsub", "Subject removed successfully");
        res.redirect("/Admin/Subject_Management");;
    }).catch((err) => {
        Admin.set("addsub", "Failed to remove beacuse " + err.message);
        res.redirect("/Admin/Subject_Management");;
    });

});

//News_Update post
Admin.post("/News_Update", isAuthenticated, function (req, res) {
    var nt = new DB.Colls_Notification({
        Notification_Msg: req.body.Notification_Msg
    });
    nt.save().then(() => {
        res.redirect("/Admin/News_Update?msg=Failed to save news update.");
    }).catch(function (err) {
        res.redirect("/Admin/News_Update?msg=Notification saved successfully.");
    });
});

//Download
Admin.get("/Download", isAuthenticated, function (req, res) {
    if (req.query.file != undefined) {
        filepath = "./Content/" + req.query.file;
        res.download(filepath);
    } else {
        DB.Colls_SubmitAssignment.find().then(function (std) {
            res.render("./Admin/Download.ejs", { Assignment: std });
        }).catch((err) => {
            res.render("./Admin/Download.ejs");
        });
    }
});

//StudyMaterial
Admin.get("/StudyMaterial", isAuthenticated, function (req, res) {
    DB.Colls_StudyMaterial.find().then(function (sa) {
        res.render("./Admin/StudyMaterial.ejs", { StudyMaterials: sa, msg: req.query.msg });
    });
});

Admin.post("/StudyMaterial", isAuthenticated, function (req, res) {
    var msg = "";
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, file) {
        var oldPath = file.StudyMaterial.filepath;
        var StdMAt = file.StudyMaterial.newFilename + path.extname(file.StudyMaterial.originalFilename);
        var newpath = "./Content/StudyMaterials/" + StdMAt;
        fs.readFile(oldPath, function (err, data) {
            if (!err) {
                fs.writeFile(newpath, data, function (err) {
                    if (!err) {
                        var sm = new DB.Colls_StudyMaterial({
                            Subject: fields.Subject,
                            StudyMaterial: StdMAt,
                            Description: fields.Description
                        });
                        sm.save().then(() => {
                            res.redirect("/Admin/StudyMaterial?msg=Saved Successfully.");
                        });
                    } else
                        res.redirect("/Admin/StudyMaterial?msg=Oops! error occured in saving the Study Material..");

                })
            } else
                res.redirect("/Admin/StudyMaterial?msg=Oops! error occured in reading the Study Material.");
        });
        //Deleting file from temporary location
        fs.unlink(oldPath, function (err) {
            if (err)
                msg = "Oops! error occured in deleting the temporary file.";
        });
    });
});

//StudyMaterial Delete
Admin.get("/DeleteStudy", isAuthenticated, function (req, res) {
    DB.Colls_StudyMaterial.findByIdAndDelete(new ObjectId(req.query.pk)).then(function (std) {

        //Removing Study Material file
        var filepath = path.resolve("./Content/StudyMaterials/" + std.StudyMaterial);
        fs.unlink(filepath, function (err) {
            if (err)
                msg = "Unable to remove file.";//For erroer case,console.log(err);
            res.redirect("/Admin/StudyMaterial?msg='Removed Suceessfully.'");
        });

    }).catch(function (err) {
        res.redirect("/Admin/StudyMaterial?msg='Unable to Removed.'");
    });
});

//Download file
Admin.get("/Download", isAuthenticated, function (req, res) {
    var filepath = "./Content/" + req.query.file;
    res.download(filepath);
});

//Change Exam Mode
Admin.get("/ChangeExamMode", isAuthenticated, function (req, res) {
    DB.Colls_Subject.updateOne({ _id: new ObjectId(req.query.id) }, { Status: req.query.mode }, function (err, st) {
        if (err)
            res.redirect("/Admin/Subject_Management");
        else
            res.redirect("/Admin/Subject_Management");
    });
});

//Assignment_Management
Admin.get("/Assignment_Management", isAuthenticated, function (req, res) {
    DB.Colls_GiveAssignment.find().then(function (sa) {
        res.render("./Admin/Assignment_Management.ejs", { ASSIGNMENTS: sa, msg: req.query.msg });
    });
});

//Result_Management
Admin.get("/ResultManagement", isAuthenticated, function (req, res) {
    DB.Colls_Result.find().then(function (sa) {
        res.render("./Admin/ResultManagement.ejs", { Results: sa,msg:req.query.msg });
    });
});

Admin.get("/DeleteResult", isAuthenticated, function (req, res) {
    DB.Colls_Result.deleteOne({ _id: req.query.pk }).then(function (err) {
        res.redirect("/Admin/ResultManagement?msg=Deleted successfully.");
    }).catch((err) => {
        res.redirect(`/Admin/ResultManagement?msg=${err}`);
    });
});


//AnswerQuery
Admin.get("/AnswerQuery", isAuthenticated, function (req, res) {
    DB.Colls_Query.findOne({ _id: new ObjectId(req.query.pk) }).then((query) => {
        res.render("./Admin/AnswerQuery.ejs", { AnswerOf: query });
    });
});

//AnswerQuery
Admin.post("/AnswerQuery", isAuthenticated, function (req, res) {
    const Send = {
        to: req.body.SendTo,
        subject: req.body.Subject,
        html: "<h2>Query: " + req.body.Query + "</h2><h2>Answer: " + req.body.Answer + "</h2>",
    }
    Email.SendMail(Send, (err, info) => {
        if (err) { //console.log(err);
            res.render("./Admin/AnswerQuery.ejs", { msg: "Sorry! Unable to send Answer." });
        } else { //console.log(info);
            res.render("./Admin/AnswerQuery.ejs", { msg: "Answer sent successfully." });
        }
    });
});



//Block get
Admin.get("/Block", isAuthenticated, function (req, res) {
    DB.Colls_StdData.updateOne({ Answer: req.query.pk }, { Status: "Blocked" }, function (err) {
        res.redirect("/Admin/Student_Management");
    });
});

//Unblock get
Admin.get("/Unblock", isAuthenticated, function (req, res) {
    DB.Colls_StdData.updateOne({ Email: req.query.pk }, { Status: "Active" }, function (err) {
        res.redirect("/Admin/Student_Management");
    });
});

//Delete Student
Admin.get("/DeleteStudent", isAuthenticated, function (req, res) {
    DB.Colls_StdData.deleteOne({ Email: req.query.pk }).then(() => {
        res.redirect("/Admin/Student_Management");
    });
});

//Manage Question
Admin.get("/ManageQuestion", isAuthenticated, function (req, res) {
    if (req.query.sub != undefined)
        Admin.set("Subject", req.query.sub);
    DB.Colls_Questions.find({ Subject: Admin.get("Subject") }).then(function (ques) {
        res.render("./Admin/ManageQuestion.ejs", { Questions: ques, msg: req.query.msg });
    });
});

Admin.post("/AddQuestion", isAuthenticated, function (req, res) {
    var q = new DB.Colls_Questions({
        Subject: Admin.get("Subject"),
        Question: req.body.Question,
        Option1: req.body.Option1,
        Option2: req.body.Option2,
        Option3: req.body.Option3,
        Option4: req.body.Option4,
        Answer: req.body.Answer
    });
    q.save().then(() => {
        res.redirect("/Admin/ManageQuestion?msg=Unable to saved.");
    }).catch(function (err) {
        res.redirect("/Admin/ManageQuestion?msg=Saved successfully.");
    });
});

Admin.get("/RemoveQuestion", isAuthenticated, function (req, res) {
    DB.Colls_Questions.deleteOne({ _id: new ObjectId(req.query.pk) }).then(() => {
        res.redirect("/Admin/ManageQuestion?msg=Deleted Successfully.");
    }).catch((err) => {
        res.redirect("/Admin/ManageQuestion?msg=Unable to Delete.");
    });
});

Admin.get("/DeleteAssignment", isAuthenticated, function (req, res) {

    DB.Colls_GiveAssignment.deleteOne({ _id: new ObjectId(req.query.pk) }).then(() => {
        res.redirect("/Admin/Assignment_Management?msg=Deleted Successfully.");
    });
});

Admin.get("/ChangePassword", isAuthenticated, function (req, res) {
    res.render("./Admin/ChangePassword.ejs");

});

Admin.post("/ChangePassword", isAuthenticated, function (req, res) {
    req.user.changePassword(req.body.Password, req.body.NewPassword, function (err) {
        if (err) {
            res.render("./Admin/ChangePassword.ejs", { msg: "Old Password is incorrect." });
        } else {
            res.render("./Admin/ChangePassword.ejs", { msg: "Password changed successfully.." });
        }
    });
});

Admin.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/Home/Login');
    });
});

//Download
Admin.get("/Get_Subscribers", isAuthenticated, function (req, res) {
    DB.Colls_Subscribe.find().then(function (std) {
        res.render("./Admin/Get_Subscribers.ejs", { Subscribers: std });
    }).catch(function (err) {
        res.render("./Admin/Get_Subscribers.ejs", { msg: "An error occured." });
    });
});

module.exports = Admin;
