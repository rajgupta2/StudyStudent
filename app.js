const express=require("express");
const ejs=require("ejs");
const expressLayouts = require('express-ejs-layouts');


const app=express();
const port = 5000
//Static Files
app.use(express.static("./public"));

// Set Templating Engine and Layout 
app.use(expressLayouts);
app.set("layout","./Layout/General");
app.set("view engine", "ejs");

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

app.listen(port,()=>console.log("server is running"));
