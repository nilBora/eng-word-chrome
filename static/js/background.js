var APP = {
    remoteURL: "http://eng.word.local.com/get/translate/",
	translateWord: 'null',
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
       // console.log(tab);
       

       // console.log("item " + info.menuItemId + " was clicked");
        //console.log("info: " + JSON.stringify(info));
       // console.log("tab: " + JSON.stringify(tab));
        //console.log(info['selectionText']);
		//console.log(APP.getSelectedText());
        APP.doSendTranslateAjax(info['selectionText'], tab);
		
		
		
    },

    doSendTranslateAjax: function(needTranslate, tab) {
        //console.log(needTranslate);
        chrome.tabs.executeScript(tab.id, {
            code: 'var translateWord = "'+needTranslate+'";'
        }, function() {
            chrome.tabs.executeScript(tab.id, {file: '/static/js/tooltip.js'});
        });
    },
	getSelectedText: function(){
		return (!!document.getSelection) ? document.getSelection() :
           (!!window.getSelection)   ? window.getSelection() :
           document.selection.createRange().text;
	}
}
APP.init();


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
       // var SR =

        jQuery.post(APP.remoteURL, {'word': request.needTranslate}, function(data) {

            var translateData = JSON.parse(data);
            var translateWord = translateData['content']['translate'];
            if (translateWord) {
                sendResponse({'translateWord': '222'});
            }

        });

        //console.log(sender.tab ?
        //"from a content script:" + sender.tab.url :
        //    "from the extension");
    });
