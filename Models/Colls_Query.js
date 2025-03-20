const mongoose =require("mongoose");

const d=new Date();
const querySchema=mongoose.Schema({
    Name:String,
    Email:String,
    Contact:String,
    Query:String,
    Date:{type:String,
        default:d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()} 
});

module.exports=querySchema;