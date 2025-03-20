const mongoose =require("mongoose");

const d=new Date();
const GiveAssignmentSchema=mongoose.Schema({
        Title: String,
        Deadline:{ type:Date},
        Description: String,
        Attachment :String,
        Date :{
            type:String,
            default:d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()
        }
});
module.exports=GiveAssignmentSchema;