const mongoose =require("mongoose");

const d=new Date();
const SubAssignmentSchema=mongoose.Schema({
    Student_Email:String,
    Student_Name:String,
    Subject:String,
    Assignment:String,
    Date:{
        type:String,
        default:d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()
    }
});

module.exports=SubAssignmentSchema;