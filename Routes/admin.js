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
const { Db } = require("mongodb");
const ObjectId=require("mongodb").ObjectId;

const admin=express();
const port = process.env.PORT || 7000;

//Static Files
admin.use(express.static(path.resolve("./public/")));

// Set Templating Engine and Layout 
admin.use(expressLayouts);
admin.set("layout","./Layout/admin");
admin.set("view engine", "ejs");
admin.use(express.json());
admin.use(express.urlencoded({extended: true}));

//Welcome
admin.get("/Admin/Welcome",(req,res)=>{
    res.render("./Admin/Welcome.ejs");
});

//Upload_Assignment
admin.get("/Admin/Give_Assignment",function(req,res){
    res.render("./Admin/Give_Assignment.ejs");
});

//Upload_Assignment post
admin.post("/Admin/Give_Assignment",function(req,res){
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
admin.get("/Admin/ShowEnquiry",function(req,res){
    DB.Colls_Query.find(function(err,q){
        res.render("./Admin/ShowEnquiry.ejs",{DBqueries:q});
    });
});

//Delete Enquiry
admin.get("/Admin/DeleteNotification",function(req,res){
    DB.Colls_Notification.deleteOne({_id:new ObjectId(req.query.pk)},function(err){
        if(err){
            res.redirect("/Admin/News_Update?msg=Error Occured in deletion");
        }else{
            res.redirect("/Admin/News_Update?msg=Successfully Deleted.");
        }
    });
});


//Student_Management
admin.get("/Admin/Student_Management",function(req,res){
    DB.Colls_StdData.find(function(err,sm){
        res.render("./Admin/Student_Management.ejs",{StdData:sm});
    });
});


//News_Update
admin.get("/Admin/News_Update",function(req,res){
    DB.Colls_Notification.find(function(err,succ){
        res.render("./Admin/News_Update.ejs",{Notification:succ,addmsg:req.query.msg});
    });
});

//Feedback
admin.get("/Admin/View_Feedback",function(req,res){
    DB.Colls_Feedback.find(function(err,succ){
        res.render("./Admin/View_Feedback.ejs",{Feedbacks:succ});
    });
});

//Subject_Management
admin.get("/Admin/Subject_Management",function(req,res){
    DB.Colls_Subject.find(function(err,sub){
        res.render("./Admin/Subject_Management.ejs",{Subjects:sub,addmsg:admin.get("addsub")});
        admin.set("addsub","");
    });
});


//Subject_Management post
admin.post("/Admin/Subject_Management",function(req,res){
    DB.Colls_Subject.find({Subject:req.body.searchSubject},function(err,sub){
        if(sub.length>0)
        res.render("./Admin/Subject_Management.ejs",{Subjects:sub});
        else
        res.render("./Admin/Subject_Management.ejs",{Subjects:sub,addmsg:"Subject Not found."});
    });
});

//ADD Subject post
admin.post("/Admin/AddSubject",function(req,res){
    var sub=new DB.Colls_Subject({
        Subject:req.body.Subject
    });
    sub.save(function(err){
        if(err)
             admin.set("addsub","Failed to save");
        else
             admin.set("addsub","Saved succesfully.");
        res.redirect("/Admin/Subject_Management");
    });
});

//Remove Subject get
admin.get("/Admin/RemoveSubject",function(req,res){
  
    //REMOVE ALL QUESTIONS RELATED THIS SUBJECT
    DB.Colls_Questions.deleteMany({Subject:req.query.sub});
    //Removing Subject      
    DB.Colls_Subject.deleteOne({Subject:req.query.sub},function(err,sub){
            if(err){
              admin.set("addsub","Failed to remove");
            }else{
              admin.set("addsub","Subject removed successfully");
            }
            res.redirect("/Admin/Subject_Management");; 
    });
});

//News_Update post
admin.post("/Admin/News_Update",function(req,res){
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
admin.get("/Admin/Download",function(req,res){
    DB.Colls_SubmitAssignment.find(function(std){
        res.render("./Admin/Download.ejs",{Assignment:std});        
    });
});

//StudyMaterial
admin.get("/Admin/StudyMaterial",function(req,res){
    DB.Colls_StudyMaterial.find(function(err,sa){
        res.render("./Admin/StudyMaterial.ejs",{StudyMaterials:sa,msg:req.query.msg});        
    });
});

admin.post("/Admin/StudyMaterial",function(req,res){
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
admin.get("/Admin/DeleteStudy",function(req,res){
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
admin.get("/Download",function(req,res){
   var filepath="./Content/"+req.query.file;
   res.download(filepath);
});

//Change Exam Mode
admin.get("/Admin/ChangeExamMode",function(req,res){
    DB.Colls_Subject.updateOne({_id:new ObjectId(req.query.id)},{Status:req.query.mode},function(err,st){
        if(err)
        res.redirect("/Admin/Subject_Management");
        else
        res.redirect("/Admin/Subject_Management");
    });
});

//Assignment_Management
admin.get("/Admin/Assignment_Management",function(req,res){
    DB.Colls_GiveAssignment.find(function(err,sa){
        res.render("./Admin/Assignment_Management.ejs",{ASSIGNMENTS:sa,msg:req.query.msg});
    });
});

//Result_Management
admin.get("/Admin/ResultManagement",function(req,res){
    DB.Colls_Result.find(function(err,sa){
        res.render("./Admin/ResultManagement.ejs",{Results:sa});
    });
});

admin.get("/Admin/DeleteResult",function(req,res){
    DB.Colls_Result.deleteOne({_id:req.query.pk},function(err){
        res.redirect("/Admin/ResultManagement");
    });
});


//AnswerQuery
admin.get("/Admin/AnswerQuery",function(req,res){
    var sa =DB.Colls_Query.find();
    res.render("./Admin/AnswerQuery.ejs");
});

//Block get
admin.get("/Admin/Block",function(req,res){
   DB.Colls_StdData.updateOne({Email:req.query.pk},{Status:"Block"},function(err){
      res.redirect("/Admin/Student_Management");
   });
});

//Unblock get
admin.get("/Admin/Unblock",function(req,res){
    DB.Colls_StdData.updateOne({Email:req.query.pk},{Status:"Active"},function(err){
       res.redirect("/Admin/Student_Management");
    });
 });

 //Delete Student 
admin.get("/Admin/DeleteStudent",function(req,res){
    DB.Colls_StdData.deleteOne({Email:req.query.pk},function(err){
       res.redirect("/Admin/Student_Management");
    });
 });

//Manage Question
admin.get("/Admin/ManageQuestion",function(req,res){
    if(req.query.sub!=undefined)
    admin.set("Subject",req.query.sub);
    DB.Colls_Questions.find({Subject:admin.get("Subject")},function(err,ques){
        res.render("./Admin/ManageQuestion.ejs",{Questions:ques,msg:req.query.msg});
    });
 });
 
admin.post("/Admin/AddQuestion",function(req,res){
      var q=new DB.Colls_Questions({
         Subject :admin.get("Subject"),
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

admin.get("/Admin/RemoveQuestion",function(req,res){
    DB.Colls_Questions.deleteOne({_id:new ObjectId(req.query.pk)},function(err){
      if(err)
      res.redirect("/Admin/ManageQuestion?msg=Unable to Delete.");
      else
      res.redirect("/Admin/ManageQuestion?msg=Deleted Successfully.");
    });
});


admin.get("/Admin/DeleteAssignment",function(req,res){
    DB.Colls_GiveAssignment.deleteOne({_id:new ObjectId(req.query.pk)},function(err,data){
       res.redirect("/Admin/Assignment_Management?msg=Deleted Successfully.");
    });
});

admin.get("/Admin/ChangePassword",function(req,res){
   res.render("./Admin/ChangePassword.ejs");
});

admin.post("/Admin/ChangePassword",function(req,res){
    res.render("./Admin/ChangePassword.ejs");
 });


admin.listen(port,()=>console.log("server is running"));