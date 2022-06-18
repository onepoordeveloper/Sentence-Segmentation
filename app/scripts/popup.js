$(document).ready(function () {
    chrome.runtime.sendMessage({ method: "getStatus" }, function (response) {
        $("#mainSwitch").prop('checked', response.message === "Off");
    });

    chrome.runtime.sendMessage({ method: "getAutoSegment" }, function (response) {
        $("#autoSegment").prop('checked', response.message === "On");
    });

    chrome.runtime.sendMessage({ method: "getParaBorder" }, function (response) {
        $("#paragraphBorder").prop('checked', response.message === "On");
    });

    chrome.runtime.sendMessage({ method: "getLineSeparator" }, function (response) {
        $("#lineSeparator").prop('checked', response.message === "On");
    });

    $("#mainSwitch").change(function () {
        const current = $(this).prop('checked');
        chrome.runtime.sendMessage({ method: "turnOff", value: current }, function (response) {
        });
    });
    $("#paragraphBorder").change(function () {
        const current = $(this).prop('checked');
        chrome.runtime.sendMessage({ method: "paraBorder", value: current }, function (response) {
        });
    });
    $("#lineSeparator").change(function () {
        const current = $(this).prop('checked');
        chrome.runtime.sendMessage({ method: "lineSeparator", value: current }, function (response) {
        });
    });
    $("#autoSegment").change(function () {
        const current = $(this).prop('checked');
        chrome.runtime.sendMessage({ method: "autoSegment", value: current }, function (response) {
        });
    })

    $("#segmentThisPage").click(function () {
        chrome.runtime.sendMessage({ method: "segmentThisPage" }, function (response) {
            window.close();
        });
    })

})