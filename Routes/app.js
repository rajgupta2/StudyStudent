const express=require("express");
const ejs=require("ejs");
const expressLayouts = require('express-ejs-layouts');

//Database File Module
const DB=require("../Models/DB");

//Used for File Uploading 
const formidable=require("formidable");
const fs=require("fs");
const path=require("path");

const app=express();
const port = process.env.PORT || 7000;


//Password Encryption 
const bcrypt = require("bcrypt");
const saltRounds = 10;

//Static Files
app.use(express.static(path.resolve("./public/")));

// Set Templating Engine and Layout 
app.use(expressLayouts);
app.set("layout","./Layout/General");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Admin Zone
const AdminRoute=require("./Admin.js");
app.use("/Admin",AdminRoute);

//Student Zone
const StudentRoute=require("./Student.js");
const { captureRejectionSymbol } = require("events");
app.use("/Student",StudentRoute);

//Routes
//Index
app.get("/",(req,res)=>{
    res.render("./Home/index");
});

//Registration Page
app.get("/Home/Registration",(req,res)=>{
    res.render("./Home/Registration");
});

//Tutorial Page
app.get("/Home/Tutorial",(req,res)=>{
    res.render("./Home/Tutorial");
});

//Contact Page
app.get("/Home/Contact",(req,res)=>{
    res.render("./Home/Contact");
});

//Login Page
app.get("/Home/Login",(req,res)=>{
    res.render("./Home/Login");
});

//Contact Post
app.post("/Home/Contact",function(req,res){
    const Query=new DB.Colls_Query({
        Name:req.body.Name,
        Email:req.body.Email,
        Contact:req.body.Contact,
        Query:req.body.Query
    });
    Query.save(function(err){
        var ans="";
        if(err)
            ans="Sorry unable to save query.";
        else
            ans="Your query saved successfully,we response you soon.";
        res.render("./Home/Contact",{msg:ans});
    });
});

//Registration Post 
app.post("/Home/Registration",function(req,res){
    var form= new formidable.IncomingForm();
    form.parse(req,function(err,fields,file){
    DB.Colls_StdData.find({Email:fields.Email},function(err,std){
        if(std.length<=0){ 
            if(err)
               msg="Oops! error occured.";
            else{
            var oldPath=file.ProfilePicture.filepath;
            var StudentProfileImage=file.ProfilePicture.newFilename+ path.extname(file.ProfilePicture.originalFilename);
            var newpath= "./Content/StudentProfileImage/" + StudentProfileImage; 
            fs.readFile(oldPath,function(err,data){
               fs.writeFile(newpath,data,function(err){
                             if(err)
                               msg="Oops! error occured in saving the profile picture.";
                             else{
                                bcrypt.hash(fields.Password,saltRounds,function(err,hash){
                                    const stdData=new DB.Colls_StdData({
                                        EnrollmentNumber: fields.EnrollmentNumber,
                                        Name:fields.Name,
                                        Gender:fields.Gender,
                                        College:fields.College,
                                        Course:fields.Course,
                                        Year:fields.Year,
                                        Email:fields.Email,
                                        Contact:fields.Contact,
                                        Address:fields.Address,
                                        ProfilePicture:StudentProfileImage,
                                        Password:hash
                                       });
                                       stdData.save(function(err,succ){
                                        var ans=msg;
                                        if(err){
                                         console.log(err);
                                         ans="Sorry! Due to some technicle issue we are unable to registerd you.";
                                         res.render("./Home/Registration",{msg:ans});    
                                        }else
                                         {
                                             ans="You are successfully registered.Please continue to login.";
                                             res.render("./Home/Login",{msg:ans});
                                         }
                                });
                            });
                        }
                    });
            });
            //Deleting file from temporary location
            fs.unlink(oldPath,function(err){
                if(err)
                console.log(err);
                msg="Oops! error occured in deleting the temporary file.";
            });    
            }
        }else
        res.render("./Home/Registration",{msg:"Email Already registered. Please Login"});
       });
    });
});

//Login Post
app.post("/Home/Login",(req,res)=>{
    var msg="";
    DB.Colls_StdData.findOne({Email:req.body.StudentId},function(err,sd){
    if(!sd){
        msg="Invalid Email";
        res.render("./Home/Login",{msg:msg});
    }else{
    bcrypt.compare(req.body.Password,sd.Password,function(err,result){
       if(result==true){
           if(sd.Status!="Active")
            res.render("./Home/Login",{msg:"Your account is blocked by admin"});
           else{

           }
       }else
         res.render("./Home/Login",{msg:"Incorrect Password"});
    });
       
      
           /*  //Creating Session for admin
             if (ID == "admin@gmail.com"){
               req.session="admin@gmail.com";
               res.redirect(path.resolve("./Routes/admin.js"));
            }else{
             req.session=req.body.StudentId;
             if (sd[0].Status == "Active")
                res.redirect(path.resolve("./Routes/Student.js"));
             else
                 msg ="You account is blocked.";
            }*/
        }    
    });
});

app.listen(port,()=>console.log("server is running"));