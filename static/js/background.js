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

    doSendTranslateAjax: function(string, tab) {
        var xhr = new XMLHttpRequest();
        var params = "word="+string;
        var translateWord = 'Test';
	chrome.tabs.executeScript(tab.id, {
                                code: 'var translateWord = "'+translateWord+'";'
                        }, function() {
                                chrome.tabs.executeScript(tab.id, {file: '/static/js/tooltip.js'});
                        });
	return true;
        jQuery.post(APP.remoteURL, {'word': string}, function(data) {
            var translateData = JSON.parse(data);
            var translateWord = translateData['content']['translate'];
			APP.translateWord = translateWord;
			
			chrome.tabs.executeScript(tab.id, {
				code: 'var translateWord = "'+translateWord+'";'
			}, function() {
				chrome.tabs.executeScript(tab.id, {file: '/static/js/tooltip.js'});
			});
			//chrome.tabs.executeScript(null, {file: "/static/js/tooltip.js"});
			
			//chrome.tabs.executeScript( null,  {file: "/static/js/tooltip.js"});
            ///console.log(translateWord);
        });


    },
	getSelectedText: function(){
		return (!!document.getSelection) ? document.getSelection() :
           (!!window.getSelection)   ? window.getSelection() :
           document.selection.createRange().text;
	}
}
APP.init();



