

chrome.runtime.onInstalled.addListener(function () {
    console.log("Installed");
    chrome.storage.local.set({ 'switch': "On" });
    chrome.storage.local.set({ 'autoSegmentSwitch': "Off" });
    chrome.storage.local.set({ 'paraBorder': "Off" });
    chrome.storage.local.set({ 'lineSeparator': "Off" });
    chrome.storage.local.set({ 'doubleSpace': "Off" });

});



function onClickHandler(info, tab) {
    const part = info.menuItemId === "segmentSection" ? "section" : "body";
    const code = `segmentSection('${part}');`
    chrome.tabs.executeScript(tab.id, {
        code: code
    });
};

chrome.contextMenus.onClicked.addListener(onClickHandler);


var mainSwitch = "";
var autoSegmentSwitch = "";
var paraBorder = "";
var lineSeparator = "";
var doubleSpace = "";
const getStatus = function () {
    chrome.storage.local.get(null, function (resp) {
        console.log(resp.switch);
        mainSwitch = resp.switch;
        //if (mainSwitch === "On"){
        chrome.contextMenus.create({ "title": "Segment Complete Page", "id": "segmentPage" });
        //chrome.contextMenus.create({"title": "Segment This Section", "id": "segmentSection"});
        //}
        //else {
        //    chrome.contextMenus.removeAll();
        //}
        //
    });
}

const getAutoSegment = function () {
    chrome.storage.local.get(null, function (resp) {
        console.log(resp.autoSegmentSwitch);
        autoSegmentSwitch = resp.autoSegmentSwitch;
    });
};

const getParaBorder = function () {
    chrome.storage.local.get(null, function (resp) {
        console.log(resp.paraBorder);
        paraBorder = resp.paraBorder;
    });
};
const getDoubleSpace = function () {
    chrome.storage.local.get(null, function (resp) {
        console.log(resp.doubleSpace);
        doubleSpace = resp.doubleSpace;
    });
};
const getLineSeparator = function () {
    chrome.storage.local.get(null, function (resp) {
        console.log(resp.lineSeparator);
        lineSeparator = resp.lineSeparator;
    });
};

setTimeout(function () {
    getStatus();
    getAutoSegment();
    getParaBorder();
    getLineSeparator();
    getDoubleSpace();
}, 500);

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request.method === "turnOff") {
            const isModeOff = !!(request.value);
            chrome.storage.local.set({ 'switch': `${isModeOff ? 'Off' : 'On'}` });
            sendResponse({ message: `Extension turned ${isModeOff ? 'Off' : 'On'}` });
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
            });
            getStatus();
        }

        if (request.method === "autoSegment") {
            const isModeOn = !!(request.value);
            chrome.storage.local.set({ 'autoSegmentSwitch': `${isModeOn ? 'On' : 'Off'}` });
            sendResponse({ message: `Auto Segment turned ${isModeOn ? 'On' : 'Off'}` });
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
            });
            getAutoSegment();
        }

        if (request.method === "paraBorder") {
            const isModeOn = !!(request.value);
            chrome.storage.local.set({ 'paraBorder': `${isModeOn ? 'On' : 'Off'}` });
            sendResponse({ message: `paraBorder turned ${!isModeOn ? 'On' : 'Off'}` });
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
            });
            getParaBorder();
        }

        if (request.method === "doubleSpace") {
            const isModeOn = !!(request.value);
            chrome.storage.local.set({ 'doubleSpace': `${isModeOn ? 'On' : 'Off'}` });
            sendResponse({ message: `doubleSpace turned ${isModeOn ? 'On' : 'Off'}` });
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
            });
            getDoubleSpace();
        }

        if (request.method === "lineSeparator") {
            const isModeOn = !!(request.value);
            chrome.storage.local.set({ 'lineSeparator': `${isModeOn ? 'On' : 'Off'}` });
            sendResponse({ message: `LineSeparator turned ${!isModeOn ? 'On' : 'Off'}` });
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
            });
            getLineSeparator();
        }
        else if (request.method === "getStatus") {
            sendResponse({ message: mainSwitch });
        }
        else if (request.method === "getParaBorder") {
            sendResponse({ message: paraBorder });
        }
        else if (request.method === "getDoubleSpace") {
            sendResponse({ message: doubleSpace });
        }
        else if (request.method === "getLineSeparator") {
            sendResponse({ message: lineSeparator });
        }
        else if (request.method === "getAutoSegment") {
            sendResponse({ message: autoSegmentSwitch });
        }
        else if (request.method === "segmentThisPage") {
            chrome.tabs.executeScript(null, {
                code: "segmentSection('body');"
            });
        }
    });

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(null, {
        code: "segmentSection('body');"
    });
});