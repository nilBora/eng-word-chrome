
var transelorVersion = {
    send : function(opt){
        console.log(opt);
        $.ajax({
            url: 'http://eng.word.local.com/get/translate/',//'http://api.microsofttranslator.com/V2/Ajax.svc/Translate',
            data: {
                'word': opt.text,

                'appId': opt.appId,
                'from': opt.from,
                'to': opt.to,
                'contentType': 'text/plain'
            },
            'success': function(T) {
                var translateData = JSON.parse(T);
                var translateWord = translateData['content']['translate'];
                if (translateWord) {
                    opt.success(translateWord);
                    return;
                }

                //if(T.indexOf('TranslateApiException') === -1){
                //    opt.success(T);
                //    return;
                //}
                opt.errorTranslate(T);
            },
            'error': function(jqXHR, textStatus, errorThrown) {
                opt.errorTranslate(textStatus);
            }
        });
    },
    getAccessToken : function(opt){
        $.ajax({
            url: 'https://datamarket.accesscontrol.windows.net/v2/OAuth2-13',
            type: "POST",
            dataType : 'json',
            crossDomain : true,
            data: {
                'grant_type': opt.grant_type,
                'client_id': opt.client_id,
                'client_secret': opt.client_secret,
                'scope': opt.scope
            },
            'success': function(response) {
                if(response.access_token){
                    opt.success( response.access_token );
                    return;
                }
                opt.error();
            },
            'error': function(jqXHR, textStatus, errorThrown) {
                opt.error();
            }
        });
    },
    versions : [
        function(opt){
            opt.appId = '76518BFCEBBF18E107C7073FBD4A735001B56BB1';
            transelorVersion.send(opt);
        },
        function(opt){
            transelorVersion.getAccessToken({
                'grant_type': 'client_credentials',
                'client_id': '3453fh33',
                'client_secret': '+AB7zZE5FR1dI42WibD5V+ADmL+hv05RdfXV0iI/3MM=',
                'scope': 'http://api.microsofttranslator.com',
                success : function(AccessToken){
                    opt.appId = 'Bearer ' + AccessToken;
                    transelorVersion.send(opt);
                },
                error : function(){
                    opt.errorTranslate();
                }
            });
        },
        function(opt){
            transelorVersion.getAccessToken({
                'grant_type': 'client_credentials',
                'client_id': 'ATranslater',
                'client_secret': '/JaolFC20iYGSw/inszjY/lrsWivUA2TarG+qXeC7ng=',
                'scope': 'http://api.microsofttranslator.com',
                success : function(AccessToken){
                    opt.appId = 'Bearer ' + AccessToken;
                    transelorVersion.send(opt);
                },
                error : function(){
                    opt.errorTranslate();
                }
            });
        }
    ]
};
function getTranslateVersion(){
    if(!localStorage.translateVersion || (parseInt(localStorage.translateVersion) + 1) >= transelorVersion.versions.length){
        localStorage.translateVersion = -1;
    }
    localStorage.translateVersion++;
    return parseInt( localStorage.translateVersion );
}
function translateRotator(count, opt, text){
    if(typeof text == 'undefined'){
        text = '';
    }
    if(!count){
        opt.error(text);
        return;
    }

    opt.errorTranslate = function(text){
        count--;
        translateRotator(count, opt, text);
        return ;
    }
    transelorVersion.versions[ getTranslateVersion() ](opt);
}

function contextMenusOnClick(info, tab, opt) {
    var balloon;
    chrome.tabs.getSelected(null, function(tab) { // get selected string in current tab
        chrome.tabs.executeScript(tab.id, {file: 'js/content.js', allFrames: true}, function() {
            chrome.tabs.getSelected(null, function(tab) { // get selected string in current tab
                chrome.tabs.sendRequest(tab.id, {'method': 'prepareBalloon'}, function() {
                    var F = info.selectionText;

                    translateRotator(transelorVersion.versions.length, {
                        'text': F,
                        'from': opt.split("|")[0],
                        'to': opt.split("|")[1],
                        'success': function(T) {
                            T = T.replace(/^"|"X$/gi, '');
                            chrome.tabs.getSelected(null, function(tab) { // get selected string in current tab
                                chrome.tabs.executeScript(tab.id, {file: 'js/content.js', allFrames: true}, function() {
                                    injCallBack(T)
                                });
                            });
                        },
                        'error': function(jqXHR, textStatus, errorThrown) {
                            var T = 'ERROR! ' + textStatus;
                            chrome.tabs.getSelected(null, function(tab) { // get selected string in current tab
                                chrome.tabs.executeScript(tab.id, {file: 'js/content.js', allFrames: true}, function() {
                                    injCallBack(T)
                                });
                            });
                        }
                    });
                })
            });
        });
    });
}

var injCallBack = function(S) {
    chrome.tabs.getSelected(null, function(tab) { // get selected string in current tab
        chrome.tabs.sendRequest(tab.id, {'method': 'getContextMenus', 'string': S}, getRequestResponseCallback)
    });
}
var getRequestResponseCallback = function getRequestResponseCallback(response) {
    /*
     * TODO
     */
};


function initNotify() {
    window.open('options.html');
    var deskNoti = webkitNotifications.createNotification("icons/ico128.png", "This Extension Is Ad-supported", "Please NOTE that this extension has ads to support further development. You can disable it in the options menu.");
    deskNoti.onclick = function() {
        window.open('options.html', '_blank');
        this.cancel()
    };
    deskNoti.show();
    window.setTimeout(function() {
        deskNoti.cancel();
    }, 60000);

}


function createcontextMenusOption(opt) {
    var optString = '';
    var L = JSONSwitch(LANGUAGES);
    optString += opt.split('|')[0] ? L[opt.split('|')[0]] : t('detectLanguage');
    optString += ' ?? ';
    optString += opt.split('|')[1] ? L[opt.split('|')[1]] : t('detectLanguage');
    chrome.contextMenus.create({
        "title": optString,
        "contexts": ['selection'],
        "onclick": function(opt) {
            return function(info, tab) {
                contextMenusOnClick(info, tab, opt)
            }
        }(opt)
    });
}

function start() {
    if (localStorage.getItem('first_start') === null) {
        localStorage.setItem('first_start', 'done');
    }
    if (localStorage.getItem('preferred') === null) {
        //localStorage.setItem('preferred', '["|en","|es"]');
        localStorage.setItem('preferred', '["|en"]');
    }
    if (localStorage.getItem('similar_products') === null) {
        localStorage.setItem('similar_products', true);
    }
    localStorage.setItem('version', '1.5');

    if (localStorage.getItem('from') === null) {
        localStorage.setItem('from', '');
    }

    if (localStorage.getItem('to') === null) {
        localStorage.setItem('to', '');
    }
    if (localStorage.getItem('preferred') === null) {
        localStorage.setItem('preferred', JSON.stringify(["|" + window.navigator.language]));
        window.open('options.html');

    }
    var preferred = JSON.parse(localStorage.getItem('preferred'));
    chrome.contextMenus.removeAll();
    

	    for (var i = 0, max = preferred.length; i < max; i++) {
	        createcontextMenusOption(preferred[i]);
	    }

    /*
    chrome.contextMenus.create({
        "title": t("optionsSelection"),
        "contexts": ['selection'],
        "onclick": function() {
            chrome.tabs.create({'url': chrome.extension.getURL('options.html')}, function(tab) {
            });
        }
    });
    */
}


$(document).ready(function() {
    LANGUAGES = {};
    LOCALE = "";
    chrome.i18n.getAcceptLanguages(function(L) {
        LOCALE = L[0];
        currentLanguages = Microsoft.Translator.GetLanguages();
        languageNames = Microsoft.Translator.getLanguageNames(LOCALE);
        for (var i = 0; i < currentLanguages.length; i++) {
            LANGUAGES[languageNames[i]] = currentLanguages[i];
        }
        start();
    });
});


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.action == 'show_option_page') {
        window.open('options.html');
        sendResponse({});
    }
});
