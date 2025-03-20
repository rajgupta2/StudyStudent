const mongoose =require("mongoose");

const d=new Date();
const SubjectSchema=mongoose.Schema({
    Subject:{
        type:String,
        unique:true
    },
    DateOfAdding:{
        type:String,
        default:d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()
    },
    Status:{
        type:String,
        default:"Off"
    }
});


module.exports=SubjectSchema;