const nodemailer = require("nodemailer");
const DB=require("../Models/DB.js");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
});

const SendMail=function(Send,cb){
      const mailConfig = {
        from: "StudyStudent <"+process.env.MY_EMAIL+">",
        to: Send.to,
        subject: Send.subject,
        html: Send.html,
      }
      transporter.sendMail(mailConfig, function(err, info){
        if (err)
            return cb(err);
        return cb(err,info);
    });
}

const GenerateToken=function(Send,cb){
  const SecretCharacters = process.env.SECRET_CHAR_CODE_EMAIL_VER;
  let token = '';
  for (let i = 0; i < 5; i++) {
     token += SecretCharacters[Math.floor(Math.random() * SecretCharacters.length )];
  }
  bcrypt.hash(token, saltRounds, function(err, hash) {
    if(err)
       cb(err);
    else{
      DB.Colls_Verify_Email.deleteMany({Email :Send.to,Student_Name:Send.Name}).catch((err)=>{
          return cb(err);
      }).then(()=>{
        const code=DB.Colls_Verify_Email({
            Email :Send.to,
            Student_Name :Send.Name,
            Code : hash
           });
           code.save().catch(function(err){
              return cb(err);
            }).then(()=>{ 
              return cb(err,token);
           });
      });
    
     }
  });
}

const SendEmailForVerification=function(Send,cb){
  GenerateToken(Send,(err,token)=>{
    if(err)
     return cb(err);
    else{
    Send.html="<h2>StudyStudent</h2><h4>Hi "+Send.Name+"</h4>"+
    "<h2 >Your verification code is "+ token +"</h2>"+
    "<h3>We are glad to see you at  StudyStudent. Enter this code in our website <b>StudyStudent</b> to verify your account "+Send.to+".</h3>"+
    "<h3>Welcome to StudyStudent <br>The StudyStudent Team</h3>"+
    "<p>If you are unknown for this email then ignore it. Don't share this code with anyone.Code will expires in five minutes.</p>"
    SendMail(Send,(err,info)=>{
          if(err)
            return cb(err);
          return cb(err,info);
     });
  }
  });
}
const confirmEmail=function(HasSent,cb){
  DB.Colls_Verify_Email.findOneAndDelete({Email:HasSent.Email,Student_Name:HasSent.Student_Name},(err,user)=>{
       if(err)
        return cb(err);
       if(user){
         bcrypt.compare(HasSent.Code,user.Code,(err,bool)=>{
            if(bool==true){
              var d=new Date();
              if(user.Expire.Minutes>=d.getMinutes()-5 &&
              user.Expire.Hours==(d.getHours()+1) && user.Expire.Date==d.getDate()){
                //console.log("Code Mathched");  
                return cb(err,true);
              }
              else{
                return cb(err,false,"Code has Expired.");
              }
            }else
              return cb(err,false,"You have entered the wrong code.");
        });
       }else{
        return cb(err,false,"Email can't verify.");
       }     
  });
}
module.exports={SendMail,SendEmailForVerification,confirmEmail};