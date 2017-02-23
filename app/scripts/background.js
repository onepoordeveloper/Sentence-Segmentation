chrome.runtime.onInstalled.addListener(function() {
    console.log("Installed");
    chrome.storage.local.set({'switch': "On"});
    chrome.storage.local.set({'autoSegmentSwitch': "Off"});
});



function onClickHandler(info, tab) {
    if (info.menuItemId == "segmentSection") {
        chrome.tabs.executeScript(tab.id, {
            code: "segmentSection('section');"
        });
    } else {
        chrome.tabs.executeScript(tab.id, {
            code: "segmentSection('body');"
        });
    }
};

chrome.contextMenus.onClicked.addListener(onClickHandler);


var mainSwitch = "";
var autoSegmentSwitch = "";
var getStatus = function(){
    chrome.storage.local.get(null, function(resp){
        console.log(resp.switch);
        mainSwitch = resp.switch;
        if (mainSwitch == "On"){
            chrome.contextMenus.create({"title": "Segment This Section", "id": "segmentSection"});
            chrome.contextMenus.create({"title": "Segment Complete Page", "id": "segmentPage"});
        }
        else {
            chrome.contextMenus.removeAll();
        }
    });
}

var getAutoSegment = function(){
    chrome.storage.local.get(null, function(resp){
        console.log(resp.autoSegmentSwitch);
        autoSegmentSwitch = resp.autoSegmentSwitch;
    });
}

setTimeout(function(){
    getStatus();
    getAutoSegment();
},500);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.method == "turnOff") {
            if (request.value == true){
                //turn off the extension.. set flag to off
                chrome.storage.local.set({'switch': "Off"});
                sendResponse({message: "Extension turned Off"});
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
                });
                getStatus();
            }
            else{
                //turn on the extension
                chrome.storage.local.set({'switch': "On"});
                sendResponse({message: "Extension turned On"});
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
                });
                getStatus();
            }
        }
        if (request.method == "autoSegment") {
            if (request.value == true){
                //turn on auto Segmentation
                chrome.storage.local.set({'autoSegmentSwitch': "On"});
                sendResponse({message: "Auto Segment turned On"});
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
                });
                getAutoSegment();
            }
            else{
                //turn off auto Segmentation
                chrome.storage.local.set({'autoSegmentSwitch': "Off"});
                sendResponse({message: "Auto Segment turned Off"});
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
                });
                getAutoSegment();
            }
        }
        else if (request.method == "getStatus"){
            sendResponse({message: mainSwitch});
        }
        else if (request.method == "getAutoSegment"){
            sendResponse({message: autoSegmentSwitch});
        }
        else if (request.method == "segmentThisPage"){
            chrome.tabs.executeScript(null, {
                code: "segmentSection('body');"
            });
        }
    });