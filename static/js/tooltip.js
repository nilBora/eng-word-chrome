var markSelection = (function() {
    var markerTextChar = "\ufeff";
    var markerTextCharEntity = "&#xfeff;";

    var markerEl, markerId = "sel_" + new Date().getTime() + "_" + Math.random().toString().substr(2);

    var selectionEl;

    return function() {
        var sel, range;

        if (document.selection && document.selection.createRange) {
            // Clone the TextRange and collapse
            range = document.selection.createRange().duplicate();
            range.collapse(false);

            // Create the marker element containing a single invisible character by creating literal HTML and insert it
            range.pasteHTML('<span id="' + markerId + '" style="position: relative;">' + markerTextCharEntity + '</span>');
            markerEl = document.getElementById(markerId);
        } else if (window.getSelection) {
            sel = window.getSelection();

            if (sel.getRangeAt) {
                range = sel.getRangeAt(0).cloneRange();
            } else {
                // Older WebKit doesn't have getRangeAt
                range.setStart(sel.anchorNode, sel.anchorOffset);
                range.setEnd(sel.focusNode, sel.focusOffset);

                // Handle the case when the selection was selected backwards (from the end to the start in the
                // document)
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
                selectionEl.style.border = "solid darkblue 1px";
                selectionEl.style.backgroundColor = "lightgoldenrodyellow";
                selectionEl.innerHTML = "&lt;- selection";
                selectionEl.style.position = "absolute";

                document.body.appendChild(selectionEl);
            }

            // Find markerEl position http://www.quirksmode.org/js/findpos.html
        var obj = markerEl;
        var left = 0, top = 0;
        do {
            left += obj.offsetLeft;
            top += obj.offsetTop;
        } while (obj = obj.offsetParent);

            // Move the button into place.
            // Substitute your jQuery stuff in here
            selectionEl.style.left = left + "px";
            selectionEl.style.top = top + "px";

            markerEl.parentNode.removeChild(markerEl);
        }
    };
})();


var positions =  getSelectionTopLeft();
console.log(markSelection());
var tooltipDiv = document.createElement("div");
var style = 'left:'+positions.x+'px;bottom:'+positions.y+'px;';
tooltipDiv.setAttribute('style', style);
tooltipDiv.setAttribute('class', 'tooltip');
document.body.appendChild(tooltipDiv);
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



