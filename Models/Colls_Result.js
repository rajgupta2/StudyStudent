const mongoose =require("mongoose");

const d=new Date();
const ResultSchema=mongoose.Schema({
     Name :String,
     Email_OF_Student:String,
     Subject :String,
     Course :String,
     Date_Of_Exam :{
      type:String,
      default:d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()
     },
    Timing_Of_Exam :String,
    Marks_Obtained:Number,
    Full_Marks :Number
});

module.exports=ResultSchema;