'use strict';
var elem;
$(document).ready(function() {
    var work = true;
    //checking if switch is off
    chrome.runtime.sendMessage({method: "getStatus"}, function(response) {
        if (response.message == "Off"){
            console.log("turned off");
            work = false;
        }
    });

    $("*").mouseenter(function (e) {
        if (work == false) return;
        $(e.target).addClass("hoverActive");
        $(e.target).parent().addClass("hoverActiveParent");
    });
    $("*").mouseleave(function () {
        if (work == false) return;
        $(".hoverActive").removeClass("hoverActive");
        $(".hoverActiveParent").removeClass("hoverActiveParent");
    });

    $(document).mousedown(function (e) {
        if (work == false) return;
        $(".hoverActiveParent").attr("id", "pickMe");
    });

    chrome.runtime.sendMessage({method: "getAutoSegment"}, function(response) {
        if (response.message == "On") {
            setTimeout(function(){
                segmentSection('body');
            },1000);
        }
    });

});

var segmentSection = function(which){
    if (which == "section") elem = "#pickMe";
    else elem = "body";
    $(elem + " *").each(function(){
        var v = $(this).html();
        var regexForPeriod = /\.\s/g;       //regex to find period
        var regexForQuestion = /\?\s/g;     //regex to find question mark
        v = v.replace(regexForPeriod, ".<br/><br/>");        //replacing period with period and newline
        v = v.replace(regexForQuestion, "?<br/><br/>");      //replacing questionmark with questionmark and newline
        $(this).html(v);        //adding replaced content back to the DOM element
    });
    $("#pickMe").attr("id","");
};


