
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
            console.log(obj);
            left += obj.offsetLeft;
            top += obj.offsetTop;
        } while (obj = obj.offsetParent);
           // var withHeight = getSelectionDimensions();
          //  top = top - withHeight.height;
           // left = left - withHeight.width;
            selectionEl.style.left = left + "px";
            selectionEl.style.top = top + "px";

            markerEl.parentNode.removeChild(markerEl);
        }
	    selectionSpan.innerHTML = translateWord

    };
})(translateWord);


markSelection(translateWord);
createTooltip(translateWord);

function createTooltip(translateWord) {

    var cal1 = document.createElement("div");
    cal1.setAttribute('id', 'cal1');
    cal1.innerHTML = '&nbsp;';
    document.body.appendChild(cal1);

    var cal2 = document.createElement("div");
    cal2.setAttribute('id', 'cal2');
    cal2.innerHTML = '&nbsp;';
    document.body.appendChild(cal2);

    var selectionEl = document.createElement("div");
    selectionEl.setAttribute('id', 'tooltip');
    selectionEl.innerHTML = translateWord;
    document.body.appendChild(selectionEl);

    var ele = selectionEl;//document.getElementById('tooltip');
    var sel = window.getSelection();
    var rel1 = document.createRange();
    rel1.selectNode(cal1);
    var rel2 = document.createRange();
    rel2.selectNode(cal2);
    if (!sel.isCollapsed) {

        var r = sel.getRangeAt(0).getBoundingClientRect();
        console.log(r);
        var rb1 = rel1.getBoundingClientRect();
        var rb2 = rel2.getBoundingClientRect();
        ele.style.top = (r.bottom - rb2.top) * 100 / (rb1.top - rb2.top) + 'px'; //this will place ele below the selection
        ele.style.left = (r.left - rb2.left) * 100 / (rb1.left - rb2.left) + 'px'; //this will align the right edges together

        //code to set content

        ele.style.display = 'block';
    }
}

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





