chrome.runtime.onInstalled.addListener(function() {
    console.log("Installed");
    chrome.storage.local.set({'switch': "On"});
    chrome.storage.local.set({'autoSegmentSwitch': "Off"});
    chrome.storage.local.set({'paraBorder': "Off"});
    chrome.storage.local.set({'lineSeparator': "Off"});
    chrome.storage.local.set({'doubleSpace': "Off"});
});

function onClickHandler(info, tab) {
    if (info.menuItemId === "segmentSection") {
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
var paraBorder = "";
var lineSeparator = "";
var doubleSpace = "";

const getStatus = function(){
    chrome.storage.local.get(null, function(resp){
        console.log(resp.switch);
        mainSwitch = resp.switch;
        //if (mainSwitch === "On"){
            chrome.contextMenus.create({"title": "Segment Complete Page", "id": "segmentPage"});
            //chrome.contextMenus.create({"title": "Segment This Section", "id": "segmentSection"});
        //}
        //else {
        //    chrome.contextMenus.removeAll();
        //}
		//
    });
}

const getAutoSegment = function(){
    chrome.storage.local.get(null, function(resp){
        console.log(resp.autoSegmentSwitch);
        autoSegmentSwitch = resp.autoSegmentSwitch;
    });
};

const getParaBorder = function(){
    chrome.storage.local.get(null, function(resp){
        console.log(resp.paraBorder);
        paraBorder = resp.paraBorder;
    });
};

const getDoubleSpace = function(){
    chrome.storage.local.get(null, function(resp){
        console.log(resp.doubleSpace);
        doubleSpace = resp.doubleSpace;
    });
};

const getLineSeparator = function(){
    chrome.storage.local.get(null, function(resp){
        console.log(resp.lineSeparator);
        lineSeparator = resp.lineSeparator;
    });
};

setTimeout(function(){
    getStatus();
    getAutoSegment();
    getParaBorder();
    getLineSeparator();
    getDoubleSpace();
},500);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.method === "turnOff") {
            if (request.value){
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
        if (request.method === "autoSegment") {
            if (request.value){
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
        if (request.method === "paraBorder") {
            if (request.value){
                chrome.storage.local.set({'paraBorder': "On"});
                sendResponse({message: "paraBorder turned Off"});
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
                });
                getParaBorder();
            }
            else{
                chrome.storage.local.set({'paraBorder': "Off"});
                sendResponse({message: "paraBorder turned On"});
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
                });
                getParaBorder();
            }
        }
        if (request.method === "doubleSpace") {
            if (request.value){
                chrome.storage.local.set({'doubleSpace': "On"});
                sendResponse({message: "doubleSpace turned On"});
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
                });
                getDoubleSpace();
            }
            else{
                chrome.storage.local.set({'doubleSpace': "Off"});
                sendResponse({message: "doubleSpace turned Off"});
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
                });
                getDoubleSpace();
            }
        }
        if (request.method === "lineSeparator") {
            if (request.value){
                chrome.storage.local.set({'lineSeparator': "On"});
                sendResponse({message: "LineSeparator turned Off"});
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
                });
                getLineSeparator();
            }
            else{
                chrome.storage.local.set({'lineSeparator': "Off"});
                sendResponse({message: "LineSeparator turned On"});
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.update(tabs[0].id, {url: tabs[0].url});
                });
                getLineSeparator();
            }
        }
        else if (request.method === "getStatus"){
            sendResponse({message: mainSwitch});
        }
        else if (request.method === "getParaBorder"){
            sendResponse({message: paraBorder});
        }
        else if (request.method === "getDoubleSpace"){
            sendResponse({message: doubleSpace});
        }
        else if (request.method === "getLineSeparator"){
            sendResponse({message: lineSeparator});
        }
        else if (request.method === "getAutoSegment"){
            sendResponse({message: autoSegmentSwitch});
        }
        else if (request.method === "segmentThisPage"){
            chrome.tabs.executeScript(null, {
                code: "segmentSection('body');"
            });
        }
    });

    chrome.browserAction.onClicked.addListener(function(tab) {
        chrome.tabs.executeScript(null, {
            code: "segmentSection('body');"
        });
    });