const mongoose =require("mongoose");

const d=new Date();
const VerifyEmailSchema=mongoose.Schema({
     Email :String,
     Student_Name :String,
     Code : String,
     Expire:{
       Minutes:{ type:Number, default:d.getMinutes()},
       Hours:{type:Number,default:(d.getHours()+1)},
       second:{type:Number,default:d.getSeconds()},
       Date:{type:Number,default:d.getDate()}
     },
     Code_DT :{
        type:String,
        default:d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()
     }
});

module.exports=VerifyEmailSchema;