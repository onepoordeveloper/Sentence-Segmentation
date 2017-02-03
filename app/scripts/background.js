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


chrome.contextMenus.create({"title": "Segment This Section", "id": "segmentSection"});
chrome.contextMenus.create({"title": "Segment Complete Page", "id": "segmentPage"});