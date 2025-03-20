const mongoose =require("mongoose");

const d=new Date();
const FeedbackSchema=mongoose.Schema({
     Student_Id :String,
     Student_Name :String,
     Feedback_Subject: String,
     Message :String,
     Feedback_DT :{
        type:String,
        default:d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()
     }
});

module.exports=FeedbackSchema;