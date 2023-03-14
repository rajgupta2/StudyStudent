const https=require("https");
var verifyRecaptcha=function(RecaptchaToken,callback){
    var RECAPTCHA_API_URL="https://www.google.com/recaptcha/api/siteverify?secret="+process.env.RECAPTCHA_SECRETKEY+"&response="+RecaptchaToken;
    https.get(RECAPTCHA_API_URL,function(result){
        //console.log(result.statusCode);
        result.on("data",function(data){
             const RECAPTCHA_RES=JSON.parse(data);
             return callback(RECAPTCHA_RES.success); 
        });
    });
}
module.exports=verifyRecaptcha;