function Subvalidation() {
    var result = true;
    var Name = $("#SubName").val().trim();
    var Email = $("#SubEmail").val().toLowerCase().trim();

    $(".err").remove(); // Remove previous error messages
    $(".err").addClass("text-danger");

    // Validation for Name (2 to 20 characters, alphabets and spaces allowed)
    if (Name.length === 0) {
        $("#SubName").after("<span class='err'>Enter your name.</span>");
        result = false;
    } else if (Name.length < 2 || Name.length > 20) {
        $("#SubName").after("<span class='err'>Name must be between 2 and 20 characters.</span>");
        result = false;
    } else if (!/^[a-zA-Z\s]+$/.test(Name)) {
        $("#SubName").after("<span class='err'>Name should only contain letters and spaces.</span>");
        result = false;
    }

    // Validation for Email using regular expression
    if (Email.length === 0) {
        $("#SubEmail").after("<span class='err'>Enter your email address.<br/></span>");
        result = false;
    } else {
        // Simple and reliable email regex
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(Email)) {
            $("#SubEmail").after("<span class='err'>Enter a valid email address.<br/></span>");
            result = false;
        }
    }
    $(".err").addClass("text-danger");
    return result;
}

function SubSubmit(token) {
    var res = Subvalidation();
    if (res) {
        var Name = $("#SubName").val().trim();
        var Email = $("#SubEmail").val().trim();
        var code = $("#Code").val().trim();
        $.ajax({
            type: "POST",
            url: "/Home/Subscribe",
            data: { SName: Name, SEmail: Email, RecaptchaToken: token, Code: code },
            dataType: "json",
            success: function (obj) {
                if (obj.Status == "Success")
                    alert("Subscribed Successfully.");
                else
                    alert(obj.Message);
            }
        });
    }
}
$(document).ready(function () {
    $("#SubCode").click(function () {
        var res = Subvalidation();
        if (res) {
            var Name = $("#SubName").val().trim();
            var Email = $("#SubEmail").val().trim();
            $.ajax({
                type: "POST",
                url: "/SendCode",
                data: { SName: Name, SEmail: Email },
                dataType: "json",
                success: function (obj) {
                    if (obj.Success) {
                        $("#SubCode").addClass("d-none");
                        $("#Code").attr("type", "text");
                        $(".Subscribe_Btn").removeClass("d-none");
                    } else
                        alert("Due to some error,we are unable to sent code.");
                }
            });
        }
    });
});
