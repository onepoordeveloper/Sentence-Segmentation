$(document).ready(function(){

    chrome.runtime.sendMessage({method: "getDoubleSpace"}, function(response) {
        const isOnMode = response.message === "On";
        $("#doubleSpace").prop('checked', isOnMode);
    });

    $("#doubleSpace").change(function(){
        const current = $(this).prop('checked');
        chrome.runtime.sendMessage({method: "doubleSpace", value: current}, function(response) {
        });
    });
})