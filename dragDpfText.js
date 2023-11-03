/**
 * Created by rabbi on 2/9/15.
 */


var dragDpfTextStart = function () {
    // Save some starting values
    this.tox = this.attr('x');
    this.toy = this.attr('y');
    this.ow = this.attr('width');
    this.oh = this.attr('height');
    this.dragging = true;


};


var dragDpfTextEnd = function () {
    this.dragging = false;
};

var checkDraggingFeasibilityOfDpfText = function(x,y,width,height,level){
    //console.log('y: ' + y + ' drawingPane[' + level + ']:' + drawingPane[level].attr('y') + ' drawingPane[' + level + ']:' + drawingPane[level].attr('height'));
    var boxCoords = [drawingPane[level].attr('x'), drawingPane[level].attr('y'), drawingPane[level].attr('width'), drawingPane[level].attr('height')];
    //console.log(boxCoords);
    //console.log('' + x + ', ' + y + ', ' + width + ', ' + height + ' level:' + level);
    return (boxCoords[0] <= x && boxCoords[1] <= y && boxCoords[2]>= (x+width) && (boxCoords[1] + boxCoords[3]) >= (y+height));
};

var dragDpfTextMove = function (dx, dy) {
    var newX, newY, newWidth, newHeight;
    var dpfConn = this.data('parent');
    var level = dpfConn.spec.level;

    newX = this.tox + dx;
    newY = this.toy + dy;
    newWidth = this.ow;
    newHeight = this.oh;
    if(!checkDraggingFeasibilityOfDpfText(newX,newY,newWidth,newHeight,level)) {
        //console.log('not feasible to move !!');
        return;
    }
    updateEdgeTextPosition(this, newX, newY);
    paper.safari();
};



var changeDpfTextCursor = function (e, mouseX, mouseY) {

    // Don't change cursor during a drag operation
    if (this.dragging === true) {
        return;
    }

    this.attr('cursor', 'move');

};


var updateEdgeTextPosition = function(text, newX, newY){
    text.attr({x: newX, y: newY});
};