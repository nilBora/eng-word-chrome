var div=document.createElement("div"); document.body.appendChild(div); div.innerText="test123";
//var sel =  window.getSelection();
//var range = sel.getRangeAt(0);

//console.log(APP.translateWord);


var positions =  getSelectionTopLeft();
var tooltipDiv = document.createElement("div");
var style = 'position:absolute;z-index:999;left:'+positions.x+'px;bottom:'+positions.y+'px; background-color:#dedede;padding:5px;border:1px solid #fff;width:250px;';
tooltipDiv.setAttribute('style', style)
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