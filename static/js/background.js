var APP = {
    remoteURL: "http://eng.word.local.com/get/translate/", //http://eng.nil.dev.clients.in.ua/get/translate/'
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
    },

    genericOnClick: function(info, tab) {
        APP.doSendTranslateAjax(info['selectionText'], tab);
    },

 doSendTranslateAjax: function(needTranslate, tab) {
        //console.log(needTranslate);
    jQuery.post(APP.remoteURL, {'word': needTranslate}, function(data) {

            var translateData = JSON.parse(data);
            var translateWord = translateData['content']['translate'];
            chrome.tabs.executeScript(tab.id, {
                code: 'var translateWord = "'+translateWord+'";'
            }, function() {
                chrome.tabs.executeScript(tab.id, {file: '/static/js/tooltip.js'});
            });
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
        jQuery.post(APP.remoteURL, {'word': request.needTranslate}, function(data) {

            var translateData = JSON.parse(data);
            var translateWord = translateData['content']['translate'];
            console.log(translateWord);
            if (translateWord) {
                sendResponse({'translateWord': '222'});
            }
        });
    });
