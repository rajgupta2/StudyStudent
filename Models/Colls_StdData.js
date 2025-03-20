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
        type:Number,
        min:1,
        max:4
    },
    Contact:String,
    Address:String,
    ProfilePicture:String,
    Password:String,
    Status:{
        type:String,
        default:"Active"
    },
    RegistrationDate:{
        type:String,
        default:d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()
    },
    googleId:String
});

//For Encryption and hashing
StudentRegistrationSchema.plugin(passportLocalMongoose);
module.exports=StudentRegistrationSchema;