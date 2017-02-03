'use strict';
var elem;
$(document).ready(function() {

    $("*").mouseenter(function (e) {
        $(e.target).addClass("hoverActive");
        $(e.target).parent().addClass("hoverActiveParent");
    });
    $("*").mouseleave(function () {
        $(".hoverActive").removeClass("hoverActive");
        $(".hoverActiveParent").removeClass("hoverActiveParent");
    });

    $(document).mousedown(function (e) {
        $(".hoverActiveParent").attr("id", "pickMe");
    });
});

var segmentSection = function(which){
    if (which == "section") elem = "#pickMe";
    else elem = "body";
    $(elem + " *").each(function(){
        var v = $(this).html();
        var regexForPeriod = /\.\s/g;       //regex to find period
        var regexForQuestion = /\?\s/g;     //regex to find question mark
        v = v.replace(regexForPeriod, ".<br/>");        //replacing period with period and newline
        v = v.replace(regexForQuestion, "?<br/>");      //replacing questionmark with questionmark and newline
        $(this).html(v);        //adding replaced content back to the DOM element
    });
    $("#pickMe").attr("id","");
};


