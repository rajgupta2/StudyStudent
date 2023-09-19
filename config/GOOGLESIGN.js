const express = require("express");
const Google = express();
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const DB = require("../Models/DB");
const https = require("https");
const fs = require("fs");
const path = require("path");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_SIGNIN_CLIEND_ID,
  clientSecret: process.env.GOOGLE_SIGNIN_CLIEND_SECRET,
  callbackURL: process.env.GOOGLE_SIGNIN_CALLBACKURL
},
  function (accessToken, refreshToken, profile, cb) {
    var Photo_URL = profile.photos[0].value;
    var filename = Photo_URL.substring(Photo_URL.lastIndexOf('/') + 1) + ".jpg";
    const newuser = new DB.Colls_StdData({
      googleId: profile.id,
      Email: profile.emails[0].value,
      Name: profile.displayName,
      ProfilePicture: filename,
    });
    DB.Colls_StdData.findOne({ googleId: profile.id }).then( function (user) {
      if (!user) {
        //Downloading user's Profile Pic.
        DownloadImage(Photo_URL);
        newuser.save().then(()=>{
          return cb(null,newuser);
        });
      }
    }).catch((err)=>{
      return cb(err, user);
    });
  }
));

Google.get("/Login",
  passport.authenticate('google', { scope: ["profile", "email"] })
);

Google.get("/Auth/Callback",
  passport.authenticate('google', { failureRedirect: '/Home/Login'}),
  function (req, res) {
    // Successful authentication, redirect Student/Greetings.
    res.redirect('/Student/Greetings');
  });

var DownloadImage=function(Photo_URL){
  https.get(Photo_URL, (result) => {
    //console.log(result.statusCode);
    var filename = Photo_URL.substring(Photo_URL.lastIndexOf('/') + 1) + ".jpg";
    var filePath = path.resolve("./Content//StudentProfileImage// ") + filename;
    const writeStream = fs.createWriteStream(filePath);
    result.pipe(writeStream);
    writeStream.on("finish", () => {
    writeStream.close();
     //console.log("Download Completed!");
   });
 });
}

module.exports = Google;