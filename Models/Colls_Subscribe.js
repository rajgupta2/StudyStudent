const mongoose =require("mongoose");

const d=new Date();
const SubscriberSchema=mongoose.Schema({
    Name:String,
    Email:{
        type: String,
        unique:true
    },
    Date:{type:String,
        default:d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()} 
});


module.exports=SubscriberSchema;