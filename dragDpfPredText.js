/**
 * Created by rabbi on 2/9/15.
 */


var dragDpfPredTextStart = function () {
    // Save some starting values
    this.tox = this.attr('x');
    this.toy = this.attr('y');
    this.ow = this.attr('width');
    this.oh = this.attr('height');
    this.dragging = true;
    var predItem = this.data('parent');
    if(predItem.dpfType == 'DpfPredicateConstraint') {
        var level = predItem.spec.level;
        if (level == 1 && predItem.dpfType == 'DpfPredicateConstraint') {
            M_selected_predicate_const = predItem;
            showConnectionsOfPredConst();
        }
    }
    else{
        PR_selected_annotation = predItem;
        P_selected_pred4RuleAnnot = PR_selected_annotation.predicate;
        PR_last_selected_element = PR_selected_annotation;
        PR_showConnectingOptions(PR_selected_annotation);
    }
};


var dragDpfPredTextEnd = function () {
    this.dragging = false;
};

var checkDraggingFeasibilityOfDpfPredText = function(x,y,width,height,level){
    //console.log('y: ' + y + ' drawingPane[' + level + ']:' + drawingPane[level].attr('y') + ' drawingPane[' + level + ']:' + drawingPane[level].attr('height'));
    var boxCoords = [drawingPane[level].attr('x'), drawingPane[level].attr('y'), drawingPane[level].attr('width'), drawingPane[level].attr('height')];
    //console.log(boxCoords);
    //console.log('' + x + ', ' + y + ', ' + width + ', ' + height + ' level:' + level);
    return (boxCoords[0] <= x && boxCoords[1] <= y && boxCoords[2]>= (x+width) && (boxCoords[1] + boxCoords[3]) >= (y+height));
};

var dragDpfPredTextMove = function (dx, dy) {
    var newX, newY, newWidth, newHeight;
    var predSrc = this.data('parent');
    var level = 3;
    newX = this.tox + dx;
    newY = this.toy + dy;
    newWidth = this.ow;
    newHeight = this.oh;

    if(predSrc.dpfType == 'DpfPredicateConstraint') {
        level = predSrc.spec.level;
        //console.log('level : ' + level);
        if (!checkDraggingFeasibilityOfDpfPredText(newX, newY, newWidth, newHeight, level)) {
            console.log('not feasible to move !!');
            return;
        }
        this.attr({x: newX, y: newY});
        predSrc.movePredicate();
    }
    else if(predSrc.dpfType == 'DpfPredicate') {
        level = predSrc.spec.level;
        //console.log('level : ' + level);
        if (!checkDraggingFeasibilityOfDpfPredText(newX, newY, newWidth, newHeight, level)) {
            console.log('not feasible to move !!');
            return;
        }
        this.attr({x: newX, y: newY});
        predSrc.movePredicate();
    }
    else{
        if (!checkDraggingFeasibilityOfDpfPredText(newX, newY, newWidth, newHeight, level)) {
            console.log('not feasible to move !!');
            return;
        }
        this.attr({x: newX, y: newY});
        predSrc.moveAnnotation();
    }
    paper.safari();
};



var changeDpfPredTextCursor = function (e, mouseX, mouseY) {

    // Don't change cursor during a drag operation
    if (this.dragging === true) {
        return;
    }

    this.attr('cursor', 'move');

};

