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
                        Subject :req.body.Subject,
                        StudyMaterial :StdMAt,
                        Description :req.body.Description
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
           //Removing Study MAterial file
           var filepath=path.resolve("./Content/StudyMaterial/"+std.StudyMaterial);
           fs.unlink(filepath,function(err){
              res.redirect("/Admin/StudyMaterial?msg='Removed Suceessfully.'"); 
           });
           }
        });
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
    DB.Colls_SubmitAssignment.find(function(err,sa){
        res.render("./Admin/Assignment_Management.ejs",{ASSIGNMENTS:sa});
    });
});

//Result_Management
admin.get("/Admin/ResultManagement",function(req,res){
    DB.Colls_Result.find(function(err,sa){
        res.render("./Admin/ResultManagement.ejs",{Results:sa});
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



/*





admin.get("DeleteStudent",function(req,res){
   
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    string msg = "";
    StudentData sd = db.StudentDatas.Find(pk);
    string filePath= Server.MapPath("/Content/StudentProfilePicture/");
    string finalPath =filePath+ sd.ProfilePicture; ;
    System.IO.File.Delete(finalPath);
    db.StudentDatas.Remove(sd);
    StudentLoginData sl=db.StudentLoginDatas.Find(pk);
    db.StudentLoginDatas.Remove(sl);
        db.SaveChanges();
        msg = "Record deleted successfully.";
    TempData["msg"] = msg;
    return RedirectToAction("Student_Management","Admin");
}
public ActionResult DeleteAssignment(int pk)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    string msg = "";
    Tbl_GiveAssignment sd = db.Tbl_GiveAssignment.Find(pk);
    string FileDire = Server.MapPath("/Content/Assignment_Attachments/");
    string filePath =FileDire + sd.Attachment;
    System.IO.File.Delete(filePath);
    db.Tbl_GiveAssignment.Remove(sd);
    db.SaveChanges();
    msg = "Record deleted successfully.";
    TempData["msg"] = msg;
    return RedirectToAction("Assignment_Management", "Admin");
}
public ActionResult EditAssignment(int pk)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    Tbl_GiveAssignment sd = db.Tbl_GiveAssignment.Find(pk);
    TempData["msg"] = sd;
    return RedirectToAction("Give_Assignment", "Admin");
}

StudyStudentEntities2 db =new StudyStudentEntities2();
/

public ActionResult DeleteStudy(int pk)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    string msg = "";
    try
    {
        Tbl_StudyMaterial tsm = db.Tbl_StudyMaterial.Find(pk);
        string filePath = Server.MapPath("/Content/StudyMaterials/");
        string finalPath = filePath + tsm.Subject;
        System.IO.File.Delete(finalPath);
        db.Tbl_StudyMaterial.Remove(tsm);
        db.SaveChanges();
        msg = "Record removed successfully";
    }catch(Exception ex)
    {
        msg = "An error occured";
    }
    TempData["msg"] = msg;
    return RedirectToAction("StudyMaterial", "Admin");
}

[HttpPost]
public ActionResult StudyMaterial(Tbl_StudyMaterial sm)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    string msg = "";
    HttpPostedFileBase fo = Request.Files["StudyMaterial"];
    try { 
    if (fo.ContentLength > 0)
    {
        string filename = fo.FileName;
        string finalfilename = Path.GetRandomFileName() + filename;
        //To get extension of file name
        string fileExtension = filename.Substring(filename.LastIndexOf('.') + 1).ToUpper();
        string[] allowExtension = new string[] { "PDF", "DOCX" };
        int x = Array.IndexOf(allowExtension, fileExtension);
        if (x >= 0)
        {
            string FinalPath = Server.MapPath("/Content/StudyMaterials");
            if (Directory.Exists(FinalPath) == false)
            {
                Directory.CreateDirectory(FinalPath);
            }
            fo.SaveAs(FinalPath + "/" + finalfilename);
            sm.StudyMaterial = finalfilename;
            sm.Date = DateTime.Now.ToString();
            db.Tbl_StudyMaterial.Add(sm);
            db.SaveChanges();
            msg = "Study material uploaded successfully";
        }
        else
        {
            msg = "Please upload valid Document as pdf,docx etc";
        }
    }
    else
    {
        msg = "Please Choose study material to upload";
    }

}catch(Exception ex)
    {
        msg = "Failes to upload study material,please try later";

    }
    List<Tbl_StudyMaterial> sa = db.Tbl_StudyMaterial.ToList();
    TempData["Study"] = sa;
    ViewBag.msg = msg;
    return View();

}
public ActionResult ResultManagement()
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    List<Tbl_Result> tr=db.Tbl_Result.OrderByDescending(m=>m.Id).ToList();
    ViewBag.msg = TempData["msg"];
    return View(tr);

}


[HttpPost]





public ActionResult ChangePassword()
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    StudentLoginData sld = new StudentLoginData();
    return View(sld);
}
[HttpPost]
public ActionResult ChangePassword(StudentLoginData sld)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    string msg = "";
    try
    {
        sld.StudentId = Session["adm"].ToString();
        StudentLoginData sd = db.StudentLoginDatas.Find(sld.StudentId);
        Cryptography cg = new Cryptography();
        sld.Password=cg.EncryptMyData(sld.Password);
        if (sd.Password == sld.Password)
        {
            sd.Password = cg.EncryptMyData(Request["NewPassword"]);
            db.Entry(sd);
            db.SaveChanges();
            msg = "Password Updated Successfully.";
        }
        else
        {
            msg = "Password doesn't match.";
        }
    }catch(Exception ex)
    {
        msg = "Due to technical erroe we are unable to change password.";
    }
    ViewBag.msg = msg;
    return View();
}
public ActionResult Logout()
{
    Session.Abandon();
    Session.Clear();
    return RedirectToAction("Login","Home");
}
public ActionResult Send_Email()
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
  
    return View();
}
[HttpPost]
public ActionResult Send_Email(string SendTo, string Subject, string Message)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    string msg = "";
    Email_Sender emailSender = new Email_Sender();
    bool bl=emailSender.SendMyEmail(SendTo, Subject, Message);
    if (bl)
        msg = "Mail Sent Successfully.";
    else
        msg = "Failed to send mail.";
    ViewBag.Message = msg;
    return View();
}
public ActionResult DeleteResult(int pk)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    Tbl_Result tr = db.Tbl_Result.Find(pk);
    db.Tbl_Result.Remove(tr);
    db.SaveChanges();
    TempData["msg"]="Recored Removed Successfully";
    return RedirectToAction("ResultManagement", "Admin");
}
}
}
/*
*/
admin.listen(port,()=>console.log("server is running"));