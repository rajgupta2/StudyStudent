const express = require("express");
const Google=express();
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const DB=require("../Models/DB");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_SIGNIN_CLIEND_ID,
    clientSecret: process.env.GOOGLE_SIGNIN_CLIEND_SECRET,
    callbackURL: process.env.GOOGLE_SIGNIN_CALLBACKURL
  },
  function(accessToken, refreshToken, profile, cb) {
    var Photo_URL=profile.photos[0].value;
    const newuser=new DB.Colls_StdData({
        googleId: profile.id,
        Email:profile.emails[0].value,
        Name: profile.displayName,
    });
    DB.Colls_StdData.findOne({googleId: profile.id},function(err,user){
        if(err){
         return cb(err, user);
        }else if(!user)
        {
            newuser.save(function(err){
                if (err) {
                    var errmsg="Sorry! Due to some technicle issue with google-sign,we are unable to registerd you.";
                } 
                return cb(err, user);
            });
        }else
         return cb(err, user);
    });
  }
));

Google.get("/Login",
  passport.authenticate('google', { scope: ["profile","email"] })
  );

Google.get("/Auth/Callback", 
  passport.authenticate('google', { failureRedirect: '/Home/login' }),
  function(req, res) {
    // Successful authentication, redirect Student/Greetings.
    res.redirect('/Student/Greetings');
});

module.exports=Google;