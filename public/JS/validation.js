$(document).ready(function () {
    //Adding Form-control class to all input,textarea tags
    $("input,textarea").addClass("form-control mt-4");
    $("[type='radio']").removeClass("form-control mt-4");
    $("[type*='file'],#Code").removeClass("mt-4");

    //Change on the selecting of file tag
    $(".custom-file-input").change(function () {
        var filename = $(this).val().split("\\").pop();
        $(".custom-file-label").html(filename);
    });
    
    //Send Code
    $("#SendCode").click(function(){
        $("#SendCode").addClass("d-none");
        $("#Code").attr("type","text");
        $(".Registration").removeClass("d-none");
        var res=checkValidation();
        if(res){
          var Name = $("#Name").val().trim();
          var Email = $("#Email").val().trim();
          $.ajax({
           type:"POST",
           url:"/SendCode",
           data:{SName:Name,SEmail:Email},
           dataType:"json",
           success:function(obj){
             if(obj.Success){
              $("#SendCode").addClass("d-none");
              $("#Code").attr("type","text");
              $(".Registration").removeClass("d-none");
             }else
              alert("Due to some error,we are unable to sent code.");
             }
           });
         }
    });
});
function checkValidation() {
    //validation started
    var result = true;
    var Name = $("#Name").val().trim();
    var EnrollMentNumber = $("#EnrollmentNumber").val().trim();
    var Email = $("#Email").val().trim();
    var Contact = $("#Contact").val().trim();
    var College = $("#College").val().trim();
    var Year = $("#Year").val().trim();
    var Address = $("#Address").val().trim();
    var Course = $("#Course").val().trim();
    var ProfilePicture = $("#ProfilePicture").val().trim();
    var Password = $("#Password").val().trim();
    var ConfirmPassword = $("#ConfirmPassword").val().trim();
    $(".err").remove();
    //validation for name
    if (Name.length == 0) {
        result = false;
        $("#Name").after("<span class='err'>Enter your name..</span>");
    } else if (Name.length < 2) {
        result = false;
        $("#Name").after("<span class='err'>Enter a valid name..</span>");
    }
    //validation for enrollment number
    if (EnrollMentNumber.length < 2) {
        result = false;
        $("#EnrollmentNumber").after("<span class='err'>Enter a valid Enrollment number..</span>");
    }
    //validation for Email
    if (Email.length == 0) {
        result = false;
        $("#Email").after("<span class='err'>Enter a valid Email</span>");
    }
    //validation for phone number
    if (Contact.length != 10) {
        $("#Contact").after("<span class='err'>Enter valid mobile number.</span>");
        result = false;
    }
    //validation for college
    if (College.length < 4) {
        result = false;
        $("#College").after("<span class='err'>Please Enter Valid College Name</span>");
    }
    //validation for Year
    if (Year.length == 0) {
        result = false;
        $("#Year").after("<span class='err'>Please Enter Year Of Course</span>")
    }
    //validation for Address
    if (Address.length < 6) {
        result = false;
        $("#Address").after("<span class='err'>Please Enter a valid Addresss..");
    }
    //validation for course
    if (Course.length < 2) {
        result = false;
        $("#Course").after("<span class='err'>Please Enter a valid Course..</span>");
    }
    //validation for Profile Picture
    var ExtensionOfProfilePicture = ProfilePicture.split(".").pop().toUpperCase();
    var AllowedExtension = ["JPG", "PNG", "JPEG", "JFIF"];
    //if profilepictureextension doesn't match with valid Extension
    if (!(AllowedExtension.indexOf(ExtensionOfProfilePicture) >= 0)) {
        $("#ProfilePicture").after("<span class='err'>Please Choose a valid Profile Picture.</span>");
        result = false;
    }
    //Validation for Password
    if (Password.length < 8) {
        result = false;
        $("#Password").after("<span class='err'>Password must be 8 characters long.</span>");
    } else {
        //Checking for strong password
        var digit = false, special = false, small = false, upper = false;
        for (var i = 0; i < Password.length; i++) {
            var c = Password.charAt(i);
            if (c >= 0 && c <= 9) //Assign true to digit  if c is an digit otherwise false
                digit = true;
            else if (c >= 'A' && c <= 'Z')//Assign true to upper if c is uppercase letter
                upper = true;
            else if (c >= 'a' && c <= 'z')//Assign true to small if c is lowercase letter
                small = true;
            else //Assign true to special if c is special charcter
                special = true;
        }
        if (!(digit && upper && small && special)) { //if any conditions doesn't satisfy.
            result = false;
            $("#Password").after("<span class='err'>Password must contains digit,uppercase letter,lowercase letter and a special character.</span>");
        }
    }
    if (Password != ConfirmPassword) {
        result = false;
        $("#ConfirmPassword").after("<span class='err'>Confirm Password doesn't match.</span>");
    }
    $(".err").addClass("text-danger");
    return result;
}

function onSubmit(token) {
    var result=checkValidation();
    if (result)
     document.getElementById("registration-form").submit();
}

