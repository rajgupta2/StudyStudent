const mongoose =require("mongoose");

const d=new Date();
const NotificationSchema=mongoose.Schema({
    Notification_Msg:String,
    Notification_DT:{
        type:String,
        default:d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()
    }
});

module.exports=NotificationSchema;