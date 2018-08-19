$(document).ready(function(){

    chrome.runtime.sendMessage({method: "getDoubleSpace"}, function(response) {
        if (response.message == "On"){
            $("#doubleSpace").prop('checked', true);
        }
        else if (response.message == "Off"){
            $("#doubleSpace").prop('checked', false);
        }
    });


    $("#doubleSpace").change(function(){
        var current = $(this).prop('checked');
        chrome.runtime.sendMessage({method: "doubleSpace", value: current}, function(response) {
        });
    });
})