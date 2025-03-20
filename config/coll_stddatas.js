const mongoose =require("mongoose");
const app = require("express")();
mongoose.set('strictQuery', true);
const connectionurl="mongodb+srv://process.env.ATLAS_USERNAME:"+process.env.ATLASPASSWORD+"@studystudent-cluster-1.jloyk.mongodb.net/?retryWrites=true&w=majority&appName=StudyStudent-Cluster-1/StudyStudent";
//const connectionurl="mongodb://127.0.0.1:27017/StudyStudent";
mongoose.connect(connectionurl).then((status)=>{
    console.log("mongodb connected successfully");
}).catch((err)=>{
 console.log("Error connecting to mongodb"+err.message);
});

const StudentRegistrationSchema=require("../Models/Colls_StdData");
const Colls_StdData= mongoose.model("Colls_StdData",StudentRegistrationSchema);

app.get("/stddata", (req, res) => {
   Colls_StdData.find().then((result)=>{
    res.send(result);
   })
});
app.post("/stddata", (req, res) => {
    const s=new Colls_StdData(req.body);
    s.save().then(() =>{ res.status(201).send("success")

    }).catch((err) =>{ res.status(500).send(err.message);})
 });
module.exports = app;