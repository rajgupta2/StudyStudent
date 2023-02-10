const express=require("express");
const ejs=require("ejs");
const expressLayouts = require('express-ejs-layouts');

//Database File Module
//const DB=require("./Models/DBStudyStudent.js");

//Password Encryption File Module
const EncryptMyData=require("../App_Code/Cryptography.js");

//Used for File Uploading 
const formidable=require("formidable");
const fs=require("fs");
const path=require("path");
const admin=express();
//const port = process.env.PORT || 5000;

// Set Templating Engine and Layout 
admin.use(expressLayouts);
admin.set("layout","./Layout/admin.ejs");
admin.set("view engine", "ejs");
admin.use(express.json());



admin.use(express.urlencoded({extended: true}))
//Routes
//Welcome
admin.get("/",(req,res)=>{
    console.log("Called");
    res.render("./Admin/Welcome.ejs");
});

//app.listen(port,()=>console.log("server is running"));