const express=require("express");
const ejs=require("ejs");
const expressLayouts = require('express-ejs-layouts');
//Database File Module
const DB=require("../Models/DB");

//Used for File Uploading 
const formidable=require("formidable");
const fs=require("fs");
const path=require("path");
const  mongoose = require("mongoose");
const ObjectId=require("mongodb").ObjectId;

const Admin=express();

//Static Files
Admin.use(express.static(path.resolve("./public/")));

// Set Templating Engine and Layout 
Admin.use(expressLayouts);
Admin.set("layout","./Layout/Admin");
Admin.set("view engine", "ejs");
Admin.use(express.json());
Admin.use(express.urlencoded({extended: true}));

//Welcome
Admin.get("/Welcome",(req,res)=>{
    res.render("./Admin/Welcome.ejs");
});

//Upload_Assignment
Admin.get("/Give_Assignment",function(req,res){
    res.render("./Admin/Give_Assignment.ejs");
});

//Upload_Assignment post
Admin.post("/Give_Assignment",function(req,res){
    var msg="";
    var form= new formidable.IncomingForm();
    form.parse(req,function(err,fields,file){
        var oldPath=file.Attachment.filepath;
        var AssignmentAttachments=file.Attachment.newFilename+ path.extname(file.Attachment.originalFilename);
        var newpath="./Content/AssignmentAttachments/"+AssignmentAttachments;
        fs.readFile(oldPath,function(err,data){
                 fs.writeFile(newpath,data,function(err){
                     if(err)
                       msg="Oops! error occured in saving the attachement.";
                     else{
                        const ass=new DB.Colls_GiveAssignment({
                            Title: fields.Title,
                            Deadline:fields.Deadline,
                            Description: fields.Description,
                            Attachment :AssignmentAttachments
                        });
                        ass.save(function(err,succ){
                            if(err)
                             msg="Sorry! Due to some technicle issue we are unable to upload assignment.";
                            else
                             msg="Saved assignment successfully.";
                             res.render("./Admin/Give_Assignment.ejs",{upmsg:msg});
                        });
                     }
                  });
                //Deleting file from temporary location
                 fs.unlink(oldPath,function(err){
                   if(err)
                     msg="Oops! error occured in deleting the temporary file.";
                 });
        });    
    });
});
    
//Show Enquiry
Admin.get("/ShowEnquiry",function(req,res){
    DB.Colls_Query.find(function(err,q){
        res.render("./Admin/ShowEnquiry.ejs",{DBqueries:q});
    });
});

//Delete Enquiry
Admin.get("/DeleteNotification",function(req,res){
    DB.Colls_Notification.deleteOne({_id:new ObjectId(req.query.pk)},function(err){
        if(err){
            res.redirect("/Admin/News_Update?msg=Error Occured in deletion");
        }else{
            res.redirect("/Admin/News_Update?msg=Successfully Deleted.");
        }
    });
});


//Student_Management
Admin.get("/Student_Management",function(req,res){
    DB.Colls_StdData.find(function(err,sm){
        res.render("./Admin/Student_Management.ejs",{StdData:sm});
    });
});


//News_Update
Admin.get("/News_Update",function(req,res){
    DB.Colls_Notification.find(function(err,succ){
        res.render("./Admin/News_Update.ejs",{Notification:succ,addmsg:req.query.msg});
    });
});

//Feedback
Admin.get("/View_Feedback",function(req,res){
    DB.Colls_Feedback.find(function(err,succ){
        res.render("./Admin/View_Feedback.ejs",{Feedbacks:succ});
    });
});

//Subject_Management
Admin.get("/Subject_Management",function(req,res){
    DB.Colls_Subject.find(function(err,sub){
        res.render("./Admin/Subject_Management.ejs",{Subjects:sub,addmsg:Admin.get("addsub")});
        Admin.set("addsub","");
    });
});


//Subject_Management post
Admin.post("/Subject_Management",function(req,res){
    DB.Colls_Subject.find({Subject:req.body.searchSubject},function(err,sub){
        if(sub.length>0)
        res.render("./Admin/Subject_Management.ejs",{Subjects:sub});
        else
        res.render("./Admin/Subject_Management.ejs",{Subjects:sub,addmsg:"Subject Not found."});
    });
});

//ADD Subject post
Admin.post("/AddSubject",function(req,res){
    var sub=new DB.Colls_Subject({
        Subject:req.body.Subject
    });
    sub.save(function(err){
        if(err)
             Admin.set("addsub","Failed to save");
        else
             Admin.set("addsub","Saved succesfully.");
        res.redirect("/Admin/Subject_Management");
    });
});

//Remove Subject get
Admin.get("/RemoveSubject",function(req,res){
  
    //REMOVE ALL QUESTIONS RELATED THIS SUBJECT
    DB.Colls_Questions.deleteMany({Subject:req.query.sub});
    //Removing Subject      
    DB.Colls_Subject.deleteOne({Subject:req.query.sub},function(err,sub){
            if(err){
              Admin.set("addsub","Failed to remove");
            }else{
              Admin.set("addsub","Subject removed successfully");
            }
            res.redirect("/Admin/Subject_Management");; 
    });
});

//News_Update post
Admin.post("/News_Update",function(req,res){
    var nt=new  DB.Colls_Notification({
        Notification_Msg:req.body.Notification_Msg
    });
    nt.save(function(err){
            if(err)
              res.redirect("/Admin/News_Update?msg=Failed to save news update.");
            else
              res.redirect("/Admin/News_Update?msg=Notification saved successfully.");
    });
});

//Download
Admin.get("/Download",function(req,res){
    if(req.query.file!=undefined){
        filepath="./Content/"+req.query.file;
      res.download(filepath);
    }else{
    DB.Colls_SubmitAssignment.find(function(std){
        res.render("./Admin/Download.ejs",{Assignment:std});        
    });
    }
});

//StudyMaterial
Admin.get("/StudyMaterial",function(req,res){
    DB.Colls_StudyMaterial.find(function(err,sa){
        res.render("./Admin/StudyMaterial.ejs",{StudyMaterials:sa,msg:req.query.msg});        
    });
});

Admin.post("/StudyMaterial",function(req,res){
    var msg="";
    var form=new formidable.IncomingForm();
    form.parse(req,function(err,fields,file){
      var oldPath=file.StudyMaterial.filepath;
      var StdMAt=file.StudyMaterial.newFilename + path.extname(file.StudyMaterial.originalFilename);
      var newpath="./Content/StudyMaterials/"+StdMAt;
      fs.readFile(oldPath,function(err,data){
        if(!err)
        {
            fs.writeFile(newpath,data,function(err){
                if(!err)
                {
                    var sm=new DB.Colls_StudyMaterial({
                        Subject :fields.Subject,
                        StudyMaterial :StdMAt,
                        Description :fields.Description
                    });
                    sm.save(()=>{
                       res.redirect("/Admin/StudyMaterial?msg=Saved Successfully.");
                    });
                }else
                  res.redirect("/Admin/StudyMaterial?msg=Oops! error occured in saving the Study Material..");
                 
            })
        }else
           res.redirect("/Admin/StudyMaterial?msg=Oops! error occured in reading the Study Material.");
      });
       //Deleting file from temporary location
       fs.unlink(oldPath,function(err){
        if(err)
          msg="Oops! error occured in deleting the temporary file.";
      });
    }); 
});

//StudyMaterial Delete
Admin.get("/DeleteStudy",function(req,res){
    DB.Colls_StudyMaterial.findByIdAndDelete(new ObjectId(req.query.pk),function(err,std){
           if(err)
           res.redirect("/Admin/StudyMaterial?msg='Unable to Removed.'");       
           else{
           //Removing Study Material file
           var filepath=path.resolve("./Content/StudyMaterials/"+std.StudyMaterial);
           fs.unlink(filepath,function(err){
            if(err)
             msg="Unable to remove file.";//For erroer case,console.log(err);
            res.redirect("/Admin/StudyMaterial?msg='Removed Suceessfully.'"); 
           });
           }
        });
});

//Download file
Admin.get("/Download",function(req,res){
   var filepath="./Content/"+req.query.file;
   res.download(filepath);
});

//Change Exam Mode
Admin.get("/ChangeExamMode",function(req,res){
    DB.Colls_Subject.updateOne({_id:new ObjectId(req.query.id)},{Status:req.query.mode},function(err,st){
        if(err)
        res.redirect("/Admin/Subject_Management");
        else
        res.redirect("/Admin/Subject_Management");
    });
});

//Assignment_Management
Admin.get("/Assignment_Management",function(req,res){
    DB.Colls_GiveAssignment.find(function(err,sa){
        res.render("./Admin/Assignment_Management.ejs",{ASSIGNMENTS:sa,msg:req.query.msg});
    });
});

//Result_Management
Admin.get("/ResultManagement",function(req,res){
    DB.Colls_Result.find(function(err,sa){
        res.render("./Admin/ResultManagement.ejs",{Results:sa});
    });
});

Admin.get("/DeleteResult",function(req,res){
    DB.Colls_Result.deleteOne({_id:req.query.pk},function(err){
        res.redirect("/Admin/ResultManagement");
    });
});


//AnswerQuery
Admin.get("/AnswerQuery",function(req,res){
    var sa =DB.Colls_Query.find();
    res.render("./Admin/AnswerQuery.ejs");
});

//Block get
Admin.get("/Block",function(req,res){
   DB.Colls_StdData.updateOne({Email:req.query.pk},{Status:"Block"},function(err){
      res.redirect("/Admin/Student_Management");
   });
});

//Unblock get
Admin.get("/Unblock",function(req,res){
    DB.Colls_StdData.updateOne({Email:req.query.pk},{Status:"Active"},function(err){
       res.redirect("/Admin/Student_Management");
    });
 });

 //Delete Student 
Admin.get("/DeleteStudent",function(req,res){
    DB.Colls_StdData.deleteOne({Email:req.query.pk},function(err){
       res.redirect("/Admin/Student_Management");
    });
 });

//Manage Question
Admin.get("/ManageQuestion",function(req,res){
    if(req.query.sub!=undefined)
    Admin.set("Subject",req.query.sub);
    DB.Colls_Questions.find({Subject:Admin.get("Subject")},function(err,ques){
        res.render("./Admin/ManageQuestion.ejs",{Questions:ques,msg:req.query.msg});
    });
 });
 
Admin.post("/AddQuestion",function(req,res){
      var q=new DB.Colls_Questions({
         Subject :Admin.get("Subject"),
         Question :req.body.Question,
         Option1 :req.body.Option1,
         Option2 :req.body.Option2,
         Option3 :req.body.Option3,
         Option4 :req.body.Option4,
         Answer :req.body.Answer
      });
      q.save(function(err){
        if(err)
        res.redirect("/Admin/ManageQuestion?msg=Unable to saved.");
        else
        res.redirect("/Admin/ManageQuestion?msg=Saved successfully.");
      });
});

Admin.get("/RemoveQuestion",function(req,res){
    DB.Colls_Questions.deleteOne({_id:new ObjectId(req.query.pk)},function(err){
      if(err)
      res.redirect("/Admin/ManageQuestion?msg=Unable to Delete.");
      else
      res.redirect("/Admin/ManageQuestion?msg=Deleted Successfully.");
    });
});


Admin.get("/DeleteAssignment",function(req,res){
    DB.Colls_GiveAssignment.deleteOne({_id:new ObjectId(req.query.pk)},function(err,data){
       res.redirect("/Admin/Assignment_Management?msg=Deleted Successfully.");
    });
});

Admin.get("/ChangePassword",function(req,res){
   res.render("./Admin/ChangePassword.ejs");
});

Admin.post("/ChangePassword",function(req,res){
    res.render(".Admin/ChangePassword.ejs");
 });

 module.exports=Admin;