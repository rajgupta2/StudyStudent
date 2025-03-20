const mongoose =require("mongoose");

const d=new Date();
const  StudyMaterialScheama=mongoose.Schema({
     Subject :String,
     StudyMaterial :String,
     Description :String,
     Date :{
      type:String,
            default:d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()
     }

});

module.exports=StudyMaterialScheama;