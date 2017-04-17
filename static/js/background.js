var APP = {
    remoteURL: "http://eng.word.local.com/get/translate/",
    init: function() {
       this.createContextMenu();
    },

    createContextMenu: function() {
        var context = 'selection';
        var title = "Test '" + context + "' menu item";
        var id = chrome.contextMenus.create(
            {
                "title": title,
                "contexts":[context],
                "onclick": APP.genericOnClick
            }
        );
        //console.log(id);
    },

    genericOnClick: function(info, tab) {
       // console.log(info);
        console.log(tab);
        chrome.tabs.executeScript( null,  {file: "/static/js/tooltip.js"});

        console.log("item " + info.menuItemId + " was clicked");
        console.log("info: " + JSON.stringify(info));
        console.log("tab: " + JSON.stringify(tab));
        //console.log(info['selectionText']);
        APP.doSendTranslateAjax(info['selectionText']);
    },

    doSendTranslateAjax: function(string) {
        var xhr = new XMLHttpRequest();
        var params = "word="+string;

        jQuery.post(APP.remoteURL, {'word': string}, function(data) {
            var translateData = JSON.parse(data);
            var translateWord = translateData['content']['translate'];
            console.log(translateWord);
        });


    }
}
APP.init();



