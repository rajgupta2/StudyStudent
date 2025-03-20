const mongoose =require("mongoose");

const QuestionSchema=mongoose.Schema({
     Subject :String,
     Question :String,
     Option1 :String,
     Option2 :String,
     Option3 :String,
     Option4 :String,
     Answer :String
});

module.exports=QuestionSchema;