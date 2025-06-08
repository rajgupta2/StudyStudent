const querySchema=require("./Colls_Query");
const StudentRegistrationSchema=require("./Colls_StdData");
const FeedbackSchema=require("./Colls_Feedback");
const GiveAssignmentSchema=require("./Colls_GiveAssignment");
const NotificationSchema=require("./Colls_Notification");
const QuestionSchema=require("./Colls_Questions");
const ResultSchema=require("./Colls_Result");
const StudyMaterialScheama=require("./Colls_StudyMaterial");
const SubjectSchema=require("./Colls_Subject");
const SubAssignmentSchema=require("./Colls_SubmitAssignment");
const SubscriberSchema=require("./Colls_Subscribe");
const VerifyEmailSchema=require("./Colls_Verify_Email");



const mongoose =require("mongoose");
mongoose.set('strictQuery', true);
const connectionurl=`mongodb+srv://${process.env.ATLAS_USERNAME}:${process.env.ATLASPASSWORD}@studystudent-cluster-1.jloyk.mongodb.net/?retryWrites=true&w=majority&appName=StudyStudent-Cluster-1`;
//const connectionurl="mongodb://127.0.0.1:27017/StudyStudent";
mongoose.connect(connectionurl).then((status)=>{
    console.log("mongodb connected successfully");
}).catch((err)=>{
 console.log("Error connecting to mongodb"+err.message);
});


//creating collections
const Colls_Feedback=mongoose.model("Colls_Feedback",FeedbackSchema);
const Colls_GiveAssignment=mongoose.model("Colls_GiveAssignment",GiveAssignmentSchema);
const Colls_Notification=mongoose.model("Colls_Notification",NotificationSchema);
const Colls_Query=mongoose.model("Colls_Query",querySchema);
const Colls_Questions=mongoose.model("Colls_Questions",QuestionSchema);
const Colls_Result=mongoose.model("Colls_Result",ResultSchema);
const Colls_StdData= mongoose.model("Colls_StdData",StudentRegistrationSchema);
const Colls_StudyMaterial=mongoose.model("Colls_StudyMaterial",StudyMaterialScheama);
const Colls_Subject=mongoose.model("Colls_Subject",SubjectSchema);
const Colls_SubmitAssignment=mongoose.model("Colls_SubmitAssignment",SubAssignmentSchema);
const Colls_Subscribe=mongoose.model("Colls_Subscribe",SubscriberSchema);
const Colls_Verify_Email=mongoose.model("Colls_Verify_Email",VerifyEmailSchema);


module.exports={
    Colls_Feedback,
    Colls_GiveAssignment,
    Colls_Notification,
    Colls_Query,
    Colls_Questions,
    Colls_Result,
    Colls_StdData,
    Colls_StudyMaterial,
    Colls_Subject,
    Colls_SubmitAssignment,
    Colls_Subscribe,
    Colls_Verify_Email
}