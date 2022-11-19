$(document).ready(function () {
    //Adding Some Effect On messeging from server-side
    if ($("#presponse").text().length > 0)
        $("#presponse").fadeToggle(1500).delay(2000).fadeToggle(1000);
    //for adding hover effect on navbar
    var fg = $("[href*='#']");
    fg.hover(function () {
        $(this).next().show();
    });
    (fg.next()).hover(function () {
        $(this).show();
    });
    fg.mouseleave(function () {
        $("[href*='#']").next().delay(2500).hide();
    });
    (fg.next()).mouseleave(function () {
        $(this).hide();
    });
    if ($("html,body").width() < 1000) {
        $("#navBtn").css({ position: "absolute", left: $("html,body").width() - 100 });
    }
    $(window).scroll(function () {
        if ($(window).scrollTop() > 20) {
            $("#backtotop").show();
            $(".navbar").addClass("alert-dark");
        } else {
            $("#backtotop").hide();
            $(".navbar").removeClass("alert-dark");
        }

        if ($(".navbar").hasClass("alert-dark"))
            $(".navbar-brand").removeClass("text-white");
        else 
            $(".navbar-brand").addClass("text-white");

        if ($(".mode>i").hasClass("bi-toggle-off")) {
            $(".navbar-brand").removeClass("text-white");
        }  
    });
    $(".navbar-toggler-icon").click(function () {
        $(".navbar").addClass("alert-dark");
        $(".navbar-brand").removeClass("text-white");

    });
    $(".change").click(function () {
        if ($("body").hasClass("dark")){
            $("body").removeClass("dark");
            $(".change").addClass("bi bi-toggle-off");
            $(".change").removeClass("bi bi-toggle-on");
            $(".navbar-brand").removeClass("text-white");

        } else {
            $("body").addClass("dark");
            $(".change").removeClass("bi bi-toggle-off");
            $(".change").addClass("bi bi-toggle-on");
            $(".navbar-brand").addClass("text-white");
        }
    });
    //backtotop
    $("#backtotop").click(function () {
        $("html,body").animate({ scrollTop: 0 }, '1500');
    });
});