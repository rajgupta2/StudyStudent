const mongoose =require("mongoose");

const passportLocalMongoose=require("passport-local-mongoose");
const d=new Date();
const StudentRegistrationSchema=mongoose.Schema({
    Email:{
        type:String,
        unique:true,
    },
    EnrollmentNumber: String,
    Name: String,
    Gender:String,
    College:String,
    Course:String,
    Year:{
        type:Number
    },
    Contact:String,
    Address:String,
    ProfilePicture:String,
    Status:{
        type:String,
        default:"Active"
    },
    RegistrationDate:{
        type:String,
        default:d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()
    },
    googleId:String,
    role:{
        type:String,
        default:"student"
    }
});

//For Encryption and hashing
StudentRegistrationSchema.plugin(passportLocalMongoose,{
  usernameField: "Email"
});
module.exports=StudentRegistrationSchema;