$(document).ready(function () {
    //Adding Some Effect On messeging from server-side
    if ($("#presponse").text().length > 0)
        $("#presponse").fadeToggle(1500).delay(2000);
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
    $(window).scroll(function () {
        if ($(window).scrollTop() > 20) {
            $("#backtotop").show();
            $(".navbar").addClass("alert-dark");
        } else {
            $("#backtotop").hide();
            $(".navbar").removeClass("alert-dark");
        }
    });
    $(".navbar-toggler-icon").click(function () {
        $(".navbar").addClass("alert-dark");
        $(".navbar-brand").removeClass("text-white");
    });
    $(".navbar-toggler").addClass("border-0");

    //backtotop
    $("#backtotop").click(function () {
        $("html,body").animate({ scrollTop: 0 }, '1500');
    });
});