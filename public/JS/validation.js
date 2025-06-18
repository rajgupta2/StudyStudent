$(document).ready(function () {
    $("input textarea").change(RegistrationFormValidation);
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
    $("#RegistrationCode").click(function () {
        var res = RegistrationFormValidation();
        if (res) {
            $("#RegistrationCode").addClass("d-none");
            $("#Code").attr("type", "text");
            $(".Registration").removeClass("d-none");
            var Name = $("#Name").val().trim();
            var Email = $("#Email").val().toLowerCase().trim();
            $.ajax({
                type: "POST",
                url: "/SendCode",
                data: { SName: Name, SEmail: Email },
                dataType: "json",
                success: function (obj) {
                    if (obj.Success) {
                        $("#RegistrationCode").addClass("d-none");
                        $("#Code").attr("type", "text");
                        $(".Registration").removeClass("d-none");
                    } else
                        alert("Due to some error,we are unable to sent code.");
                }
            });
        }
    });
});
function RegistrationFormValidation() {
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

    $(".err").remove(); // clear previous error messages

    // === Name ===
    const nameReg = /^[a-zA-Z\s]+$/;
    if (Name.length === 0) {
        $("#Name").after("<span class='err text-danger'>Enter your name.</span>");
        result = false;
    } else if (Name.length < 2 || Name.length > 22) {
        $("#Name").after("<span class='err text-danger'>Name must be between 2 to 22 characters.</span>");
        result = false;
    } else if (!nameReg.test(Name)) {
        $("#Name").after("<span class='err text-danger'>Name can only contain letters and spaces.</span>");
        result = false;
    }

    // === Enrollment Number ===
    if (EnrollMentNumber.length < 2 || EnrollMentNumber.length > 12) {
        $("#EnrollmentNumber").after("<span class='err text-danger'>Enrollment number must be 2 to 12 characters.</span>");
        result = false;
    }

    // === Email ===
    if (Email.length === 0) {
        $("#Email").after("<span class='err text-danger'>Enter your email.</span>");
        result = false;
    } else if (Email.length > 30) {
        $("#Email").after("<span class='err text-danger'>Email must not exceed 30 characters.</span>");
        result = false;
    } else {
        var emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
        if (!emailPattern.test(Email)) {
            $("#Email").after("<span class='err text-danger'>Enter a valid email format.</span>");
            result = false;
        }
    }

    // === Contact ===
    const phonePattern = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
    if (!phonePattern.test(Contact)) {
        $("#Contact").after("<span class='err text-danger'>Enter a valid 10-digit mobile number.</span>");
        result = false;
    }

    // === College ===
    if (College.length < 4 || College.length > 35) {
        $("#College").after("<span class='err text-danger'>College name must be 4 to 35 characters.</span>");
        result = false;
    }

    // === Year ===
    if (!/^\d{4}$/.test(Year)) {
        $("#Year").after("<span class='err text-danger'>Enter a valid 4-digit year.</span>");
        result = false;
    }

    // === Address ===
    if (Address.length < 6 || Address.length > 30) {
        $("#Address").after("<span class='err text-danger'>Address must be 6 to 30 characters.</span>");
        result = false;
    }

    // === Course ===
    if (Course.length < 2 || Course.length > 35) {
        $("#Course").after("<span class='err text-danger'>Course name must be 2 to 35 characters.</span>");
        result = false;
    }

    // === Profile Picture ===
    // === Profile Picture Validation ===
    var AllowedExtension = ["JPG", "PNG", "JPEG", "JFIF"];
    if (ProfilePicture.length == 0) {
        $("#ProfilePicture").after("<span class='err text-danger'>Photo is not uploaded.</span>");
        result = false;
    } else if (ProfilePicture.length > 0) {
        var ExtensionOfProfilePicture = ProfilePicture.split(".").pop().toUpperCase();

        if (AllowedExtension.indexOf(ExtensionOfProfilePicture) === -1) {
            $("#ProfilePicture").after("<span class='err text-danger'>Only JPG, PNG, JPEG, or JFIF files are allowed.</span>");
            result = false;
        } else if ($("#ProfilePicture")[0].files.length > 0) {
            var fileSize = $("#ProfilePicture")[0].files[0].size;
            if (fileSize > 2 * 1024 * 1024) {
                $("#ProfilePicture").after("<span class='err text-danger'>File size must be less than 2MB.</span>");
                result = false;
            }
        }
    }
    // === Password ===
    if (Password.length !== 8) {
        $("#Password").after("<span class='err text-danger'>Password must be exactly 8 characters.</span>");
        result = false;
    } else {
        var hasUpper = /[A-Z]/.test(Password);
        var hasLower = /[a-z]/.test(Password);
        var hasDigit = /[0-9]/.test(Password);
        var hasSpecial = /[\W_]/.test(Password);
        if (!(hasUpper && hasLower && hasDigit && hasSpecial)) {
            $("#Password").after("<span class='err text-danger'>Password must contain uppercase, lowercase, digit, and special character.</span>");
            result = false;
        }
    }

    // === Confirm Password ===
    if (Password !== ConfirmPassword) {
        $("#ConfirmPassword").after("<span class='err text-danger'>Passwords do not match.</span>");
        result = false;
    }

    return result;
}

function RegistrationSubmit(token) {
    var result = RegistrationFormValidation();
    if (result)
        document.getElementById("registration-form").submit();
}

