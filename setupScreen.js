/* Created by rabbi on 2/4/15.
*/


var wWidth = $(window).width();
var wHeight = $(window).height();

if(windowWidth < wWidth)
    windowWidth =  wWidth;

if(windowHeight < wHeight)
    windowHeight = wHeight;

menuPaneWidth = 300;
menuPaneHeight = windowHeight;
drawingPaneWidth = windowWidth - menuPaneWidth;
drawingPaneHeight = windowHeight;
var settingsPaneHeight = menuPaneHeight - 225;

var s = document.getElementsByClassName('settingsPane');
for(var n = 0; n < s.length; ++n){
    s[n].style.height = settingsPaneHeight + 'px';
}

var d = document.getElementById('paper');
d.style.position = "absolute";
d.style.left = 300 + 'px';
d.style.top = 0 + 'px';


var simulationFrame = document.getElementById('simulator-frame');
var simulationFrameLeft = (wWidth - 450 - 40 ) + 'px';
simulationFrame.style.top = (wHeight - 800 - 30 ) + 'px';


function toggle_visibility(id)
{
    var e = document.getElementById(id);
    /*
    if ( e.style.display == 'block' )
        e.style.display = 'none';
    else
        e.style.display = 'block';
    */
    if(e.style.left != '-3000px')
        e.style.left = '-3000px';
    else {
        e.style.left = '300px';
        e.style.top = (drawingPane[3].attr('y') ) + 'px';
        e.style.width = (drawingPane[3].attr('width') -4) + 'px';
        e.style.height = (drawingPane[3].attr('height') - 5) + 'px';
    }
    //console.log( ' ' + e.style.top + ', ' + e.style.left + ', ' + e.style.width + ', ' + e.style.height  );
}

function resizeJSEditor(){
    var e = document.getElementById('editor-frame');
    e.style.top = (drawingPane[3].attr('y') ) + 'px';
    e.style.width = (drawingPane[3].attr('width')-4) + 'px';
    e.style.height = (drawingPane[3].attr('height') - 5) + 'px';
    //console.log(e.style.top + ', ' + e.style.left + ', ' + e.style.width + ', ' + e.style.height  );
}