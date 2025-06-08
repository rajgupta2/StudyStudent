const express = require("express");
const expressLayouts = require('express-ejs-layouts');
//Database File Module
const DB = require("../Models/DB");

//Used for File Uploading
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const ObjectId = require("mongodb").ObjectId;
const Email=require("../config/Email.js");
const Admin = express();

//Static Files
Admin.use(express.static(path.resolve("./public/")));

// Set Templating Engine and Layout
Admin.use(expressLayouts);
Admin.set("layout", "./Layout/admin");
Admin.set("view engine", "ejs");
Admin.use(express.json());
Admin.use(express.urlencoded({ extended: true }));

//Welcome
Admin.get("/Welcome", (req, res) => {
    if (req.session.admin)
        res.render("./Admin/Welcome.ejs");
    else
        res.redirect("/Home/Login");
});

//Upload_Assignment
Admin.get("/Give_Assignment", function (req, res) {
    if (req.session.admin)
        res.render("./Admin/Give_Assignment.ejs");
    else
        res.redirect("/Home/Login");
});

//Upload_Assignment post
Admin.post("/Give_Assignment", function (req, res) {
    if (req.session.admin) {
        var msg = "";
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, file) {
            var oldPath = file.Attachment.filepath;
            var AssignmentAttachments = file.Attachment.newFilename + path.extname(file.Attachment.originalFilename);
            var newpath = "./Content/AssignmentAttachments/" + AssignmentAttachments;
            fs.readFile(oldPath, function (err, data) {
                fs.writeFile(newpath, data, function (err) {
                    if (err)
                        msg = "Oops! error occured in saving the attachement.";
                    else {
                        const ass = new DB.Colls_GiveAssignment({
                            Title: fields.Title,
                            Deadline: fields.Deadline,
                            Description: fields.Description,
                            Attachment: AssignmentAttachments
                        });
                        ass.save().then(function (succ) {
                                msg = "Saved assignment successfully.";
                            res.render("./Admin/Give_Assignment.ejs", { upmsg: msg });
                        }).catch((err)=>{
                            res.render("./Admin/Give_Assignment.ejs", { upmsg: "Sorry! Due to some technicle issue we are unable to upload assignment."});
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
    } else
        res.redirect("/Home/Login");
});

//Show Enquiry
Admin.get("/ShowEnquiry", function (req, res) {
    if (req.session.admin) {
        DB.Colls_Query.find().then(function (err, q) {
            res.render("./Admin/ShowEnquiry.ejs", { DBqueries: q });
    }).catch((err)=>{
        res.render("./Admin/ShowEnquiry.ejs", { msg: err.message });
    });
    } else
        res.redirect("/Home/Login");
});

//Send_Email
Admin.get("/Send_Email", function (req, res) {
    if (req.session.admin) {
        res.render("./Admin/Send_Email.ejs");
    } else
        res.redirect("/Home/Login");
});

Admin.post("/Send_Email", function (req, res) {
    if (req.session.admin) {
        const Send={
            to: req.body.SendTo,
            subject: req.body.Subject,
            html: req.body.Message,
        }
        Email.SendMail(Send,(err,info)=>{
            if(err){
             //console.log(err);
             res.render("./Admin/Send_Email.ejs",{msg:"Sorry! Unable to send Email."});
            }else{
                //console.log(info);
                res.render("./Admin/Send_Email.ejs",{msg:"Email sent successfully."});
            }

        });
    } else
        res.redirect("/Home/Login");
});

//Delete Enquiry
Admin.get("/DeleteNotification", function (req, res) {
    if (req.session.admin) {
        DB.Colls_Notification.deleteOne({ _id: new ObjectId(req.query.pk) }).catch( function (err) {
                res.redirect("/Admin/News_Update?msg=Error Occured in deletion");

            }).then(()=>{
                res.redirect("/Admin/News_Update?msg=Successfully Deleted.");
            });
    } else {
        res.redirect("/Home/Login");
    }
});


//Student_Management
Admin.get("/Student_Management", function (req, res) {
    if (req.session.admin) {
        DB.Colls_StdData.find().then( function (err, sm) {
            res.render("./Admin/Student_Management.ejs", { StdData: sm });
        }).catch( function (err) {
            res.render("./Admin/Student_Management.ejs", { msg: err.message });
        });
    } else {
        res.redirect("/Home/Login");
    }
});


//News_Update
Admin.get("/News_Update", function (req, res) {
    if (req.session.admin) {
        DB.Colls_Notification.find().then(function (succ) {
            res.render("./Admin/News_Update.ejs", { Notification: succ, addmsg: req.query.msg });
        });
    } else {
        res.redirect("/Home/Login");
    }
});

//Feedback
Admin.get("/View_Feedback", function (req, res) {
    if (req.session.admin) {
        DB.Colls_Feedback.find().then(function (succ) {
            res.render("./Admin/View_Feedback.ejs", { Feedbacks: succ });
        });
    } else {
        res.redirect("/Home/Login");
    }
});

//Subject_Management
Admin.get("/Subject_Management", function (req, res) {
    if (req.session.admin) {
        DB.Colls_Subject.find().then(function ( sub) {
            res.render("./Admin/Subject_Management.ejs", { Subjects: sub, addmsg: Admin.get("addsub") });
            Admin.set("addsub", "");
        });
    } else
        res.redirect("/Home/Login");
});


//Subject_Management post
Admin.post("/Subject_Management", function (req, res) {
    if (req.session.admin) {
        DB.Colls_Subject.find({ Subject: req.body.searchSubject }).then(function ( sub) {
            if (sub.length > 0)
                res.render("./Admin/Subject_Management.ejs", { Subjects: sub });
            else
                res.render("./Admin/Subject_Management.ejs", { Subjects: sub, addmsg: "Subject Not found." });
        });
    } else
        res.redirect("/Home/Login");
});

//ADD Subject post
Admin.post("/AddSubject", function (req, res) {
    if (req.session.admin) {
        var sub = new DB.Colls_Subject({
            Subject: req.body.Subject
        });
        sub.save().then(()=>{
            Admin.set("addsub", "Saved succesfully.");
            res.redirect("/Admin/Subject_Management");
        }).catch(function (err) {
                Admin.set("addsub", "Failed to save");
                res.redirect("/Admin/Subject_Management");
        });
    } else
        res.redirect("/Home/Login");
});

//Remove Subject get
Admin.get("/RemoveSubject", function (req, res) {
    if (req.session.admin) {
        //REMOVE ALL QUESTIONS RELATED THIS SUBJECT
        DB.Colls_Questions.deleteMany({ Subject: req.query.sub });
        //Removing Subject
        DB.Colls_Subject.deleteOne({ Subject: req.query.sub }).then(function ( sub) {
            Admin.set("addsub", "Subject removed successfully");
            res.redirect("/Admin/Subject_Management");;
        }).catch((err)=>{
            Admin.set("addsub", "Failed to remove beacuse "+err.message);
            res.redirect("/Admin/Subject_Management");;
        });
    } else
        res.redirect("/Home/Login");

});

//News_Update post
Admin.post("/News_Update", function (req, res) {
    if (req.session.admin) {
        var nt = new DB.Colls_Notification({
            Notification_Msg: req.body.Notification_Msg
        });
        nt.save().then(()=>{
            res.redirect("/Admin/News_Update?msg=Failed to save news update.");
        }).catch(function (err) {
                res.redirect("/Admin/News_Update?msg=Notification saved successfully.");
        });

    } else {
        res.redirect("/Home/Login")
    }
});

//Download
Admin.get("/Download", function (req, res) {
    if (req.session.admin) {
        if (req.query.file != undefined) {
            filepath = "./Content/" + req.query.file;
            res.download(filepath);
        } else {
            DB.Colls_SubmitAssignment.find().then(function(std) {
                res.render("./Admin/Download.ejs", { Assignment: std });
            }).catch((err)=>{
                res.render("./Admin/Download.ejs");
            });
        }
    } else {
        res.redirect("/Home/Login");
    }
});

//StudyMaterial
Admin.get("/StudyMaterial", function (req, res) {
    if (req.session.admin) {
        DB.Colls_StudyMaterial.find().then(function  (sa) {
            res.render("./Admin/StudyMaterial.ejs", { StudyMaterials: sa, msg: req.query.msg });
        });
    } else {
        res.redirect("/Home/Login");
    }
});

Admin.post("/StudyMaterial", function (req, res) {
    if (req.session.admin) {
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
    } else {
        res.redirect("/Home/Login")
    }
});

//StudyMaterial Delete
Admin.get("/DeleteStudy", function (req, res) {
    if (req.session.admin) {
        DB.Colls_StudyMaterial.findByIdAndDelete(new ObjectId(req.query.pk)).then( function (std) {

                //Removing Study Material file
                var filepath = path.resolve("./Content/StudyMaterials/" + std.StudyMaterial);
                fs.unlink(filepath, function (err) {
                    if (err)
                        msg = "Unable to remove file.";//For erroer case,console.log(err);
                    res.redirect("/Admin/StudyMaterial?msg='Removed Suceessfully.'");
                });

        }).catch( function (err) {
            res.redirect("/Admin/StudyMaterial?msg='Unable to Removed.'");
        });
    } else {
        res.redirect("/Home/Login");
    }
});

//Download file
Admin.get("/Download", function (req, res) {
    if (req.session.admin) {
        var filepath = "./Content/" + req.query.file;
        res.download(filepath);
    } else {
        res.redirect("/Home/Login")
    }
});

//Change Exam Mode
Admin.get("/ChangeExamMode", function (req, res) {
    if (req.session.admin) {
        DB.Colls_Subject.updateOne({ _id: new ObjectId(req.query.id) }, { Status: req.query.mode }, function (err, st) {
            if (err)
                res.redirect("/Admin/Subject_Management");
            else
                res.redirect("/Admin/Subject_Management");
        });
    } else {

        res.redirect("/Home/Login");
    }
});

//Assignment_Management
Admin.get("/Assignment_Management", function (req, res) {
    if (req.session.admin) {
        DB.Colls_GiveAssignment.find().then(function (sa) {
            res.render("./Admin/Assignment_Management.ejs", { ASSIGNMENTS: sa, msg: req.query.msg });
        });
    } else {
        res.redirect("/Home/Login")
    }
});

//Result_Management
Admin.get("/ResultManagement", function (req, res) {
    if (req.session.admin) {
        DB.Colls_Result.find().then(function (err, sa) {
            res.render("./Admin/ResultManagement.ejs", { Results: sa });
        });
    }else {
        res.redirect("/Home/Login");
    }
});

Admin.get("/DeleteResult", function (req, res) {
    if (req.session.admin) {
        DB.Colls_Result.deleteOne({ _id: req.query.pk }).then( function (err) {
            res.redirect("/Admin/ResultManagement");
        }).catch(() => {
            res.redirect("/Admin/ResultManagement");
        });
    }else {
        res.redirect("/Home/Login");
    }
});


//AnswerQuery
Admin.get("/AnswerQuery", function (req, res) {
    if (req.session.admin) {
         DB.Colls_Query.findOne({_id:new ObjectId(req.query.pk)}).then((query)=>{
             res.render("./Admin/AnswerQuery.ejs",{AnswerOf:query});
         });
    }else {
        res.redirect("/Home/Login");
    }
});

//AnswerQuery
Admin.post("/AnswerQuery", function (req, res) {
    if (req.session.admin) {
        const Send={
            to: req.body.SendTo,
            subject: req.body.Subject,
            html: "<h2>Query: "+req.body.Query+"</h2><h2>Answer: "+req.body.Answer+"</h2>",
        }
        Email.SendMail(Send,(err,info)=>{
            if(err){ //console.log(err);
                res.render("./Admin/AnswerQuery.ejs",{msg:"Sorry! Unable to send Answer."});
            }else{ //console.log(info);
                res.render("./Admin/AnswerQuery.ejs",{msg:"Answer sent successfully."});
            }
        });
    }else {
        res.redirect("/Home/Login");
    }
});



//Block get
Admin.get("/Block", function (req, res) {
    if (req.session.admin) {
        DB.Colls_StdData.updateOne({ Answer: req.query.pk }, { Status: "Blocked" }, function (err) {
            res.redirect("/Admin/Student_Management");
        });
    }else {
        res.redirect("/Home/Login")
    }
});

//Unblock get
Admin.get("/Unblock", function (req, res) {
    if (req.session.admin) {
        DB.Colls_StdData.updateOne({ Email: req.query.pk }, { Status: "Active" }, function (err) {
            res.redirect("/Admin/Student_Management");
        });
    }else {
        res.redirect("/Home/Login")

    }
});

//Delete Student
Admin.get("/DeleteStudent", function (req, res) {
    if (req.session.admin) {
        DB.Colls_StdData.deleteOne({ Email: req.query.pk }).then( ()=> {
            res.redirect("/Admin/Student_Management");
        });
    }else {
        res.redirect("/Home/Login")

    }
});

//Manage Question
Admin.get("/ManageQuestion", function (req, res) {
    if (req.session.admin) {
        if (req.query.sub != undefined)
        Admin.set("Subject", req.query.sub);
    DB.Colls_Questions.find({ Subject: Admin.get("Subject") }).then( function (err, ques) {
        res.render("./Admin/ManageQuestion.ejs", { Questions: ques, msg: req.query.msg });
    });
    }else {
        res.redirect("/Home/Login")
    }
});

Admin.post("/AddQuestion", function (req, res) {
    if (req.session.admin) {
        var q = new DB.Colls_Questions({
            Subject: Admin.get("Subject"),
            Question: req.body.Question,
            Option1: req.body.Option1,
            Option2: req.body.Option2,
            Option3: req.body.Option3,
            Option4: req.body.Option4,
            Answer: req.body.Answer
        });
        q.save().then(()=>{
            res.redirect("/Admin/ManageQuestion?msg=Unable to saved.");
        }).catch(function (err) {
                res.redirect("/Admin/ManageQuestion?msg=Saved successfully.");
        });
    }else{
        res.redirect("/Home/Login")
    }
});

Admin.get("/RemoveQuestion", function (req, res) {
    if (req.session.admin) {

        DB.Colls_Questions.deleteOne({ _id: new ObjectId(req.query.pk) }).then(()=> {
                res.redirect("/Admin/ManageQuestion?msg=Deleted Successfully.");
        }).catch((err)=>{
            res.redirect("/Admin/ManageQuestion?msg=Unable to Delete.");
        });
    }else {
        res.redirect("/Home/Login")

    }
});

Admin.get("/DeleteAssignment", function (req, res) {
    if (req.session.admin) {

        DB.Colls_GiveAssignment.deleteOne({ _id: new ObjectId(req.query.pk) }).then( ()=> {
            res.redirect("/Admin/Assignment_Management?msg=Deleted Successfully.");
        });
    }else {
        res.redirect("/Home/Login");

    }
});

Admin.get("/ChangePassword", function (req, res) {
    if (req.session.admin) {
        res.render("./Admin/ChangePassword.ejs");
    }    else {
        res.redirect("/Home/Login")
    }
});

Admin.post("/ChangePassword", function (req, res) {
    if (req.session.admin) {
        DB.Colls_StdData.findByUsername(req.user.username).then( function (err, user) {
            user.changePassword(req.body.Password, req.body.NewPassword, function (err) {
                if (err) {
                    res.render("./Admin/ChangePassword.ejs", { msg: "Old Password is incorrect." });
                } else {
                    res.render("./Admin/ChangePassword.ejs", { msg: "Password changed successfully.." });
                }
            });

        });
    }else {
        res.redirect("/Home/Login");


    }
});

Admin.get("/logout", function (req, res) {
    req.session.destroy();
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

//Download
Admin.get("/Get_Subscribers", function (req, res) {
    if (req.session.admin) {
            DB.Colls_Subscribe.find().then(function (std) {
                res.render("./Admin/Get_Subscribers.ejs", {Subscribers: std });
            }).catch(function (err) {
                res.render("./Admin/Get_Subscribers.ejs", { msg:"An error occured."});
            });
    } else {
        res.redirect("/Home/Login");
    }
});

module.exports = Admin;