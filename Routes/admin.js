const express=require("express");
const ejs=require("ejs");
const expressLayouts = require('express-ejs-layouts');

//Database File Module
const DB=require("../Models/DB");

//Used for File Uploading 
const formidable=require("formidable");
const fs=require("fs");
const path=require("path");

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

//Download
admin.get("/Admin/Download",function(req,res){
    var sa =DB.Colls_SubmitAssignment.find();
    res.render("./Admin/Download.ejs");
});

//StudyMaterial
admin.get("/Admin/StudyMaterial",function(req,res){
    var sa =DB.Colls_StudyMaterial.find();
    res.render("./Admin/StudyMaterial.ejs");
});

//Assignment_Management
admin.get("/Admin/Assignment_Management",function(req,res){
    var sa =DB.Colls_AssignmentManagement.find();
    res.render("./Admin/Assignment_Management.ejs");
});

//Student_Management
admin.get("/Admin/Student_Management",function(req,res){
    var sa =DB.Colls_StdData.find();
    res.render("./Admin/Student_Management.ejs");
});

//Subject_Management
admin.get("/Admin/Subject_Management",function(req,res){
    var sa =DB.Colls_Subject.find();
    res.render("./Admin/Subject_Management.ejs");
});

//AnswerQuery
admin.get("/Admin/AnswerQuery",function(req,res){
    var sa =DB.Colls_Query.find();
    res.render("./Admin/AnswerQuery.ejs");
});

//Give_Assignment
admin.get("/Admin/Give_Assignment",function(req,res){
    var sa =DB.Colls_Give_Assignment.find();
    res.render("./Admin/Give_Assignment.ejs");
});

//News_Update
admin.get("/Admin/News_Update",function(req,res){
    var sa =DB.Colls_Notification.find();
    res.render("./Admin/News_Update.ejs");
});





/*

admin.get("/DeleteNotification",function(req,res){
    if (IsValidUser() == false)
        return redirect("./Home/Login");
        DB.Colls_Notifications.find({_id:req.body.pk},function(err,succ){
            if(err){
                res.render("./Admin/News_Update",{msg="Error occured"});
            }else{
                res.render("./Admin/News_Update",{msg="Successfully Deleted."});
            }
        });      
});



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
public ActionResult ChangeExamMode(string sub,string mode)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    Tbl_Subject ts=db.Tbl_Subject.Find(sub);
    ts.Status = mode;
    db.Entry(ts);
    db.SaveChanges();
    return RedirectToAction("Subject_Management", "Admin");
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

public ActionResult Block(string pk)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    StudentLoginData sd=db.StudentLoginDatas.Find(pk);
    StudentData sm=db.StudentDatas.Find(pk);
    try
    {
        sd.Status = "Inactive";
        sm.Status = "Inactive";
        db.Entry(sd);
        db.Entry(sm);
        db.SaveChanges();
        TempData["msg"] = "Blocked Successfully";
    }
    catch (Exception ex)
    {
        TempData["msg"] = "An error occured.";

    }
    return RedirectToAction("Student_Management", "Admin");
}
public ActionResult Unblock(string pk)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    StudentLoginData sd = db.StudentLoginDatas.Find(pk);
    StudentData sm= db.StudentDatas.Find(pk);
    try
    {
        sd.Status = "Active";
        sm.Status = "Active";

        db.Entry(sd);
        db.Entry(sm);
        db.SaveChanges();
        TempData["msg"] = "Unblock Successfully";
    }catch(Exception ex)
    {
        TempData["msg"] = "An error occured.";
    }
    return RedirectToAction("Student_Management", "Admin");

}

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
public ActionResult ShowEnquiry()
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    List<Query> query =db.Queries.OrderByDescending(m=>m.ID).ToList();
    return View(query);
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
public ActionResult News_Update(Tbl_Notification cn)
{

    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    string msg = "";
   try{
        cn.Notification_DT = DateTime.Now.ToString();
        //for updation of existing news
        if (cn.Notification_ID > 0)
        {
            Tbl_Notification n = db.Tbl_Notification.Find(cn.Notification_ID);
            n.Notification_Msg=cn.Notification_Msg;
            n.Notification_DT=cn.Notification_DT;
            db.Entry(n);
            msg = "Notification Updated Successfully.";
        }//for adding new news
        else
        {
            db.Tbl_Notification.Add(cn);
            msg = "Notification Added Successfully.";
        }
        db.SaveChanges();
}catch(Exception ex)
{
        msg = "Unable to save message";
}
    List<Tbl_Notification> tn = db.Tbl_Notification.OrderByDescending(m=>m.Notification_ID).ToList();
    ViewBag.msg = msg;
    return View(tn);
}


[HttpPost]
public ActionResult Give_Assignment(Tbl_GiveAssignment ga)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
          string msg = "";
        //Started saving Attachment and its verification
        HttpPostedFileBase fileobj = Request.Files["Attachment"];
        if (fileobj!=null)
        {
            string filename = fileobj.FileName;
            string finalname = Path.GetRandomFileName() + "_" + filename;
            //To Get Extension Of Attachment
            string attach_Extension = filename.Substring(filename.LastIndexOf('.')).ToUpper();
            //validation for Attachment
            string[] AllowedExtension = new string[] { ".JPG", ".PDF", ".DOCX", ".PNG", ".JPEG", ".JPIF" };
            int x = Array.IndexOf(AllowedExtension, attach_Extension);
            if (x >= 0)
            {
             string FinalFilePath = Server.MapPath("/Content/Assignment_Attachments");
              if (Directory.Exists(FinalFilePath) == false)
              {
                Directory.CreateDirectory(FinalFilePath);
              }
                fileobj.SaveAs(FinalFilePath + "/" + finalname);
                ga.Attachment = finalname;
           }
           else
           {
            msg = "Invalid Attcahment File.";
           }
        }
    try
    {
        ga.Date = DateTime.Now.ToString();
        if (ga.Id > 0)
        {
            db.Entry(ga);
            msg = "Assignment Updated Successfully";
        }
        else
        {
            db.Tbl_GiveAssignment.Add(ga);
        msg = "Assignment Uploaded successfully.";
        }
        db.SaveChanges();
    }
    catch (Exception ex)
    {
        msg = "Failed to upload assignment.";
    }
    ViewBag.msg = msg;
    return View();
}


public ActionResult ManageQuestion(string pk)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    if (pk != null)
    {
        TempData["Subject"] = pk;
    }else
        pk = (string)TempData["Subject"];
    List<Tbl_Question> tq = db.Tbl_Question.Where(x => x.Subject == pk).ToList();
    TempData["Subject"] =pk;
    TempData.Keep("Subject");
    ViewBag.msg = TempData["msg"];
    return View(tq);
}
public ActionResult AddQuestion(Tbl_Question ts)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    string msg = "";
        try
        {
            db.Tbl_Question.Add(ts);
            db.SaveChanges();
        msg = "Question Added Successfully."; 
        }
        catch (Exception ex)
        {
            msg = "Failed to save subject.";
        }
        TempData["msg"] = msg;
        TempData["Subject"] = ts.Subject;
    return RedirectToAction("ManageQuestion", "Admin");

}
public ActionResult RemoveQuestion(int pk)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    string msg = "";
    try
    {
        Tbl_Question sd = db.Tbl_Question.Find(pk);
        db.Tbl_Question.Remove(sd);
        db.SaveChanges();
        TempData["Subject"] = sd.Subject;
    msg = "Question removed successfully";
    }catch(Exception ex)
    {
        msg = "Failed to remove";
    }
    TempData["msg"] = msg;
    return RedirectToAction("ManageQuestion", "Admin");
}

[HttpPost]
public ActionResult Subject_Management(string searchSubject)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }

    List<Tbl_Subject> td = db.Tbl_Subject.Where(x=>x.Subject.Contains(searchSubject)).ToList();
    if (td.Count <= 0)
    {
        ViewBag.msg = "Subject Not found";
    }
    return View(td);
}
public ActionResult AddSubject(Tbl_Subject ts)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    string msg = "";
        try
        {
            Tbl_Subject ns = db.Tbl_Subject.Find(ts.Subject);
            if (ns == null)
            {
                db.Tbl_Subject.Add(ts);
                db.SaveChanges();
                msg = "Subject saved successfully.";
            }
            else
            {
                msg = "Subject already found.";
            }
        }
        catch (Exception ex)
        {
            msg = "Failed to save subject.";
        }
        TempData["msg"] = msg;
    return RedirectToAction("Subject_Management", "Admin");

}
public ActionResult RemoveSubject(string pk)
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    string msg = "";
    try
    {
        Tbl_Subject sd = db.Tbl_Subject.Find(pk);
        //Removing of all question related to this subject
        List<Tbl_Question> tq = db.Tbl_Question.Where(x => x.Subject == pk).ToList();
        db.Tbl_Question.RemoveRange(tq);
        db.Tbl_Subject.Remove(sd);
        db.SaveChanges();
    msg = "Subject removed successfully";
    }catch(Exception ex)
    {
        msg = "Failed to remove";
    }
    TempData["msg"] = msg;
    return RedirectToAction("Subject_Management", "Admin");
}
public ActionResult View_Feedback()
{
    if (IsValidUser() == false)
    {
        return RedirectToAction("Login", "Home");
    }
    List<Tbl_Feedback> tf=db.Tbl_Feedback.OrderByDescending(m=>m.Feedback_Id).ToList();
    return View(tf);
}

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
//admin.listen(port,()=>console.log("server is running"));