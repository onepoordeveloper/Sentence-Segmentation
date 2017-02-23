$(document).ready(function(){
    chrome.runtime.sendMessage({method: "getStatus"}, function(response) {
        if (response.message == "Off"){
            $("#mainSwitch").prop('checked', true);
        }
        else if (response.message == "On"){
            $("#mainSwitch").prop('checked', false);
        }
    });
    chrome.runtime.sendMessage({method: "getAutoSegment"}, function(response) {
        if (response.message == "Off"){
            $("#autoSegment").prop('checked', false);
        }
        else if (response.message == "On"){
            $("#autoSegment").prop('checked', true);
        }
    });
    $("#mainSwitch").change(function(){
        var current = $(this).prop('checked');
        chrome.runtime.sendMessage({method: "turnOff", value: current}, function(response) {
        });
    })
    $("#autoSegment").change(function(){
        var current = $(this).prop('checked');
        chrome.runtime.sendMessage({method: "autoSegment", value: current}, function(response) {
        });
    })

    $("#segmentThisPage").click(function(){
        chrome.runtime.sendMessage({method: "segmentThisPage"}, function(response) {
            window.close();
        });
    })

})