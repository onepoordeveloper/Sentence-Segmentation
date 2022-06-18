'use strict';
var elem;
var lineSeparator;
var doubleSpace;
$(document).ready(function () {
    var work = true;
    var border = false;
    lineSeparator = true;
    doubleSpace = false;

    //checking if switch is off
    chrome.runtime.sendMessage({ method: "getStatus" }, function (response) {
        const isModeOn = response.message !== "Off";
        work = isModeOn;
        if (!isModeOn)
            console.log("turned off");
    });

    $("body.work *").mouseenter(function (e) {
        if (!work)
            return;
        $(e.target).addClass("hoverActive");
        $(e.target).parent().addClass("hoverActiveParent");
        if (border)
            $(e.target).parent().addClass("border");

    });

    $("body.work *").mouseleave(function () {
        if (!work)
            return;
        $(".hoverActive").removeClass("hoverActive");
        $(".hoverActiveParent").removeClass("hoverActiveParent");
        $(".border").removeClass("border");
    });

    $("body.work").mousedown(function (e) {
        if (!work)
            return;
        $(".hoverActiveParent").attr("id", "pickMe");
    });

    chrome.runtime.sendMessage({ method: "getAutoSegment" }, function (response) {
        if (response.message === "On") {
            setTimeout(function () {
                segmentSection('body');
            }, 1000);
        }
    });

    chrome.runtime.sendMessage({ method: "getParaBorder" }, function (response) {
        const isModeOn = response.message !== "Off";
        border = isModeOn;
        if (!isModeOn)
            console.log("border turned off");
    });

    chrome.runtime.sendMessage({ method: "getDoubleSpace" }, function (response) {
        const isModeOn = response.message === "On";
        doubleSpace = isModeOn;
        if (isModeOn)
            console.log("border turned On");
    });

    chrome.runtime.sendMessage({ method: "getLineSeparator" }, function (response) {
        lineSeparator = response.message === "On";
    });

});

const segmentSection = function (which) {
    elem = (which === "section") ? "#pickMe" : "body";
    $(elem + " *").each(function () {
        let v = $(this).html();
        const regexForPeriod = /\.\s/g;       //regex to find period
        const regexForQuestion = /\?\s/g;     //regex to find question mark
        const lineBreak = doubleSpace ? ".&nbsp;&nbsp;" : ".<br/>";
        const questionBreak = "?<br/>";
        let separatorElem = doubleSpace ? "" : "<span class='segmentSeparator'></span>";
        if (lineSeparator)
            separatorElem = "<span class='segmentSeparator sepBorder'></span>";
        v = v.replace(regexForPeriod, (lineBreak + separatorElem));        //replacing period with period and newline
        v = v.replace(regexForQuestion, (questionBreak + separatorElem));      //replacing questionmark with questionmark and newline
        $(this).html(v);        //adding replaced content back to the DOM element
    });
    $("#pickMe").attr("id", "");
};


