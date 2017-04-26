



var markSelection = (function() {
    var markerTextChar = "\ufeff";
    var markerTextCharEntity = "&#xfeff;";

    var markerEl, markerId = "sel_" + new Date().getTime() + "_" + Math.random().toString().substr(2);

    var selectionEl;

    return function() {
        var sel, range;

        if (document.selection && document.selection.createRange) {

            range = document.selection.createRange().duplicate();
            range.collapse(false);

            range.pasteHTML('<span id="' + markerId + '" style="position: relative;">' + markerTextCharEntity + '</span>');
            markerEl = document.getElementById(markerId);
        } else if (window.getSelection) {
            sel = window.getSelection();

            if (sel.getRangeAt) {
                range = sel.getRangeAt(0).cloneRange();
            } else {
                range.setStart(sel.anchorNode, sel.anchorOffset);
                range.setEnd(sel.focusNode, sel.focusOffset);

                if (range.collapsed !== sel.isCollapsed) {
                    range.setStart(sel.focusNode, sel.focusOffset);
                    range.setEnd(sel.anchorNode, sel.anchorOffset);
                }
            }

            range.collapse(false);

            // Create the marker element containing a single invisible character using DOM methods and insert it
            markerEl = document.createElement("span");
            markerEl.id = markerId;
            markerEl.appendChild( document.createTextNode(markerTextChar) );
            range.insertNode(markerEl);
        }

        if (markerEl) {
            // Lazily create element to be placed next to the selection
            if (!selectionEl) {
                selectionEl = document.createElement("div");
                var selectionSpan = document.createElement("span");

                selectionSpan.setAttribute('class', 'tooltiptext');
                ///selectionEl.style.border = "solid darkblue 1px";
                //selectionEl.style.backgroundColor = "lightgoldenrodyellow";
               // selectionSpan.innerHTML = "&lt;- ";

                selectionEl.style.position = "absolute";
                selectionEl.setAttribute('class', 'tooltip');

                var loader = document.createElement('div');
                loader.setAttribute('class', 'loader');
                selectionSpan.appendChild(loader);


                selectionEl.appendChild(selectionSpan);

                document.body.appendChild(selectionEl);
            }

        var obj = markerEl;
        var left = 0, top = 0;
        do {
            left += obj.offsetLeft;
            top += obj.offsetTop;
        } while (obj = obj.offsetParent);
            var withHeight = getSelectionDimensions();
            top = top - withHeight.height;
            left = left - withHeight.width;
            selectionEl.style.left = left + "px";
            selectionEl.style.top = top + "px";

            markerEl.parentNode.removeChild(markerEl);
        }

        sendServerAjax(translateWord, selectionSpan);

    };
})(translateWord);




var positions =  getSelectionTopLeft();
//console.log(translateWord);
markSelection(translateWord);
//console.log(getSelectionDimensions());


function sendServerAjax(needTranslate, object)
{

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
	    console.log(response.farewell);
	  });
	});
    jQuery.post("http://eng.word.local.com/get/translate/", {'word': needTranslate}, function(data) {

        var translateData = JSON.parse(data);
        var translateWord = translateData['content']['translate'];
        if (translateWord) {
            object.innerHTML = translateWord;
        }

    });



    chrome.runtime.sendMessage({needTranslate: needTranslate}, function(response) {
        console.log(response);
       // object.innerHTML = response.translateWord;

    });

}
//
//var port = chrome.runtime.connect({name: "knockknock"});
//port.postMessage({joke: "Knock knock"});
//port.onMessage.addListener(function(msg) {
//    if (msg.question == "Who's there?")
//        port.postMessage({answer: "Madame"});
//    else if (msg.question == "Madame who?")
//        port.postMessage({answer: "Madame... Bovary"});
//});



function getSelectionDimensions() {
    var sel = document.selection, range;
    var width = 0, height = 0;
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            width = range.boundingWidth;
            height = range.boundingHeight;
        }
    } else if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getBoundingClientRect) {
                var rect = range.getBoundingClientRect();
                width = rect.right - rect.left;
                height = rect.bottom - rect.top;
            }
        }
    }
    return { width: width , height: height };
}




var tooltipDiv = document.createElement("div");
var style = 'left:'+positions.x+'px;bottom:'+positions.y+'px;';
tooltipDiv.setAttribute('style', style);
tooltipDiv.setAttribute('class', 'tooltip');
//document.body.appendChild(tooltipDiv);
tooltipDiv.innerText = translateWord;

function getSelectionTopLeft() {
    var sel = document.selection, range, rect;
    var x = 0, y = 0;
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            range.collapse(true);
            x = range.boundingLeft;
            y = range.boundingTop;
        }
    } else if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getClientRects) {
                range.collapse(true);
                if (range.getClientRects().length>0){
                    rect = range.getClientRects()[0];
                    x = rect.left;
                    y = rect.top;
                }
            }
            // Fall back to inserting a temporary element
            if (x == 0 && y == 0) {
                var span = document.createElement("span");
                if (span.getClientRects) {
                    // Ensure span has dimensions and position by
                    // adding a zero-width space character
                    span.appendChild( document.createTextNode("\u200b") );
                    range.insertNode(span);
                    rect = span.getClientRects()[0];
                    x = rect.left;
                    y = rect.top;
                    var spanParent = span.parentNode;
                    spanParent.removeChild(span);

                    // Glue any broken text nodes back together
                    spanParent.normalize();
                }
            }
        }
    }
    return { x: x, y: y };
}



