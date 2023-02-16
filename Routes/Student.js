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

const Student=express();

//Static Files
Student.use(express.static(path.resolve("./public/")));

// Set Templating Engine and Layout 
Student.use(expressLayouts);
Student.set("layout","./Layout/Student");
Student.set("view engine", "ejs");
Student.use(express.json());
Student.use(express.urlencoded({extended: true}));

//Routes
Student.get("/Greetings",(req,res)=>{
    res.render("./Student/Greetings.ejs");
});

Student.get("/View_Assignment",(req,res)=>{
    res.render("./Student/View_Assignment.ejs");
});

Student.get("/Study_Materials",(req,res)=>{
    DB.Colls_StudyMaterial.find(function(err,sa){
        res.render("./Student/Study_Materials.ejs",{Study_Materials:sa});
    });
});

Student.get("/Give_FeedBack",(req,res)=>{
        res.render("./Student/Give_FeedBack.ejs");
});

Student.post("/Give_FeedBack",(req,res)=>{
    var fd=DB.Colls_Feedback({
        Student_Id :String,
        Student_Name :req.body.Student_Name,
        Feedback_Subject: req.body.Feedback_Subject,
        Message :req.body.Message,
    });
    fd.save(function(err){
        if(err)
        console.log(err);
        else
        res.render("./Student/Give_FeedBack.ejs");
    });
});

module.exports=Student;
/* 
namespace EStudyCorner.Controllers
{
    public class StudentController : Controller
    {
        StudyStudentEntities2 db = new StudyStudentEntities2();
        bool IsValidUser()
        {
            if (Session["std"]!=null)
            return true;
            else
                return false;
        }

        // GET: Student
        public ActionResult Study_Materials()
        {
            if (IsValidUser() == false)
            {
                return RedirectToAction("Login", "Home");
            }
            List<Tbl_StudyMaterial> sa = db.Tbl_StudyMaterial.ToList();
            return View(sa);
        }
        public ActionResult Give_FeedBack()
        {
            if (IsValidUser() == false)
            {
                return RedirectToAction("Login", "Home");
            }
            return View();
        }
        [HttpPost]
        public ActionResult Give_FeedBack(Tbl_Feedback tf)
        {
            if (IsValidUser() == false)
            {
                return RedirectToAction("Login", "Home");
            }
            string msg;
            try
            {
                tf.Feedback_DT = DateTime.Now.ToString();
                tf.Student_Id = Session["std"].ToString();
                StudentData sd = db.StudentDatas.Find(Session["std"]);
                tf.Student_Name = sd.Name;
                db.Tbl_Feedback.Add(tf);
                db.SaveChanges();
                msg = "Thanks for your feedback.";
            }
            catch(Exception ex)
            {
                msg = "Failed to save feedback";
            }
            ViewBag.msg = msg;
            return View();
        }
      
        public ActionResult Submit_Assignment()
        {
            if (IsValidUser() == false)
            {
                return RedirectToAction("Login", "Home");
            }
            Tbl_SubmitAssignment sa = new Tbl_SubmitAssignment();
            return View(sa);
        }

        [HttpPost]
        public ActionResult Submit_Assignment(Tbl_SubmitAssignment sa)
        {
            if (IsValidUser() == false)
            {
                return RedirectToAction("Login", "Home");
            }
            string msg = "";
            try
            {
                sa.Student_ID = Session["std"].ToString();
                StudentData sd = db.StudentDatas.Find(Session["std"].ToString());
                sa.Student_Name = sd.Name;
                HttpPostedFileBase fo = Request.Files["Assignment"];
                if (fo.ContentLength>0)
                {
                   string filename=fo.FileName;
                    string finalfilename = Path.GetRandomFileName() + filename;
                    //To get extension of file name
                    string fileExtension=filename.Substring(filename.LastIndexOf('.')+1).ToUpper();
                    string []allowExtension=new string[] { "PDF","DOCX"};
                    int x = Array.IndexOf(allowExtension, fileExtension);
                    if (x >= 0) {
                        string FinalPath = Server.MapPath("/Content/SubmittedAssignment");
                        if (Directory.Exists(FinalPath) == false)
                        {
                            Directory.CreateDirectory(FinalPath);
                        }
                        fo.SaveAs(FinalPath + "/" + finalfilename);
                        sa.Assignment = finalfilename;
                        sa.Date = DateTime.Now.ToString();
                        db.Tbl_SubmitAssignment.Add(sa);
                        db.SaveChanges();
                        msg = "Assignment submitted successfully";
                    }
                    else
                    {
                        msg = "Please upload valid Document as pdf,docx etc";
                    }
                }
                else
                {
                    msg = "Please Choose Assignment to upload";
                }

            }catch(Exception ex)
            {
                msg = "Failes to upload assignment,please try later";

            }
            ViewBag.msg = msg;
            return View();
        }
        public ActionResult Greetings()
        {
            if (IsValidUser() == false)
            {
                return RedirectToAction("Login", "Home");
            }
            List<Tbl_Subject> ts = db.Tbl_Subject.Where(x=>x.Status=="On").ToList();
            return View(ts);
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
                sld.StudentId = Session["std"].ToString();
                StudentLoginData sd = db.StudentLoginDatas.Find(sld.StudentId);
                Cryptography cg = new Cryptography();
                sld.Password = cg.EncryptMyData(sld.Password);
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
            }
            catch (Exception ex)
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
            return RedirectToAction("Login", "Home");
        }
        public ActionResult Test(string sub)
        {
            if (IsValidUser() == false)
            {
                return RedirectToAction("Login", "Home");
            }
            Tbl_Subject ts = db.Tbl_Subject.Find(sub);
            if (ts.Status == "On")
            {
                List<Tbl_Question> q = db.Tbl_Question.Where(x => x.Subject == sub).ToList();
                TempData["sub"] = sub;
                return View(q);
            }
            else
            {
                ViewBag.msg = "No Exam Available.";
            }
            return View();
        }
        [HttpPost]
        public ActionResult Test(FormCollection fc)
        {
            if (IsValidUser() == false)
            {
                return RedirectToAction("Login", "Home");
            }
            int res = 0;
            try
            {
                foreach (var q in fc.AllKeys)
                {
                    string id = q.Substring(q.IndexOf("_") + 1);
                    int n = Convert.ToInt16(id);
                    Tbl_Question tq = db.Tbl_Question.Find(n);
                    string UserAns = fc[q];
                    if (tq.Answer == UserAns)
                    {
                        res++;
                    }
                }
                ViewBag.msg = "You have got " + res + " out of 20 marks.";
                //Saving Result in Database
                Tbl_Result tr=new Tbl_Result();
                tr.Email_OF_Student = Session["std"].ToString();
                tr.Marks_Obtained = res;
                tr.Full_Marks = 20;
                tr.Date_Of_Exam = DateTime.Now.ToString();
                //Finding some details fro student data and saving it in result data table
                StudentData sd = db.StudentDatas.Find(tr.Email_OF_Student);
                tr.Course = sd.Course;
                tr.Name = sd.Name;
                tr.Subject = (string)TempData["sub"];
                db.Tbl_Result.Add(tr);
                db.SaveChanges();
            }catch(Exception ex)
            {
                ViewBag.msg = "An error occured";
            }

            return View();
        }
    }
}*/