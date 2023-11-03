/**
 * Created by rabbi on 2/9/15.
 */


var dragDpfNodeStart = function () {
    // Save some starting values
    this.ox = this.attr('x');
    this.oy = this.attr('y');

    var dpfNode = this.data('parent');
    var dpfNodeTitle = dpfNode.d_text;
    var dpfSpec = dpfNode.spec;

    this.tox = dpfNodeTitle.attr('x');
    this.toy = dpfNodeTitle.attr('y');

    if(dpfSpec.level == 0){
        if(M_selected_model.metaLevel > 0) {
            var typeNameField = document.getElementById('M_typeName');
            typeNameField.value = dpfNode.name;
            M_selected_type_node = dpfNode;
        }
        else{
            M_selected_node = dpfNode;

            document.getElementById('M_nodeName').value = dpfNode.name;

            M_node_click = (M_node_click +1 ) % 2;

            if(M_node_click == 1) {
                M_selected_node_src = dpfNode;
                document.getElementById('M_srcNode').value = M_selected_node_src.name;
            }
            else{
                M_selected_node_trg = dpfNode;
                document.getElementById('M_trgNode').value = M_selected_node_trg.name;
            }
            document.getElementById('M_deepCpNode').checked = (dpfNode.deepCp == 1);
            // connect with predicate element
            attachModelNodeToPredicate();
        }

    }
    else if(dpfSpec.level == 1){

        M_selected_type_node = dpfNode.typing.type;
        M_selected_node = dpfNode;

        document.getElementById('M_typeName').value = M_selected_type_node.name;

        document.getElementById('M_nodeName').value = dpfNode.name;

        document.getElementById('M_Edit').disabled = false;

        M_node_click = (M_node_click +1 ) % 2;

        if(M_node_click == 1) {
            M_selected_node_src = dpfNode;
            document.getElementById('M_srcNode').value = M_selected_node_src.name;
        }
        else{
            M_selected_node_trg = dpfNode;
            document.getElementById('M_trgNode').value = M_selected_node_trg.name;
        }
        document.getElementById('M_deepCpNode').checked = (dpfNode.deepCp == 1);
        // connect with predicate element
        attachModelNodeToPredicate();
    }
    else if(dpfSpec.level == 2){

        P_selected_node = dpfNode;
        P_last_selected_item = dpfNode;

        document.getElementById('P_nodeName').value = dpfNode.name;

        document.getElementById('P_Edit').disabled = false;
        document.getElementById('P_selectedElementName').value = P_last_selected_item.name;

        P_node_click = (P_node_click +1 ) % 2;

        if(P_node_click == 1) {
            P_selected_node_src = dpfNode;
            document.getElementById('P_srcNode').value = P_selected_node_src.name;
        }
        else{
            P_selected_node_trg = dpfNode;
            document.getElementById('P_trgNode').value = P_selected_node_trg.name;
        }

        // change field values in the rule panel
        if(C_selected_rule) {
            C_selected_type_node = dpfNode;
            document.getElementById('C_typeName').value = dpfNode.name;
        }
        if(PR_selected_rule) {
            PR_selected_type_node = dpfNode;
            document.getElementById('PR_typeName').value = dpfNode.name;
        }
    }
    else if(dpfSpec.level == 3){

        if(C_selected_rule) {
            C_selected_node = dpfNode;
            C_last_selected_element = dpfNode;
            C_selected_type_node = dpfNode.typing.type;

            document.getElementById('C_typeName').value = C_selected_type_node.name;
            document.getElementById('C_nodeName').value = dpfNode.name;

            C_node_click = (C_node_click + 1 ) % 2;

            if (C_node_click == 1) {
                C_selected_node_src = dpfNode;
                document.getElementById('C_srcNode').value = C_selected_node_src.name;
            }
            else {
                C_selected_node_trg = dpfNode;
                document.getElementById('C_trgNode').value = C_selected_node_trg.name;
            }
        }
        if(PR_selected_rule){
            PR_selected_node = dpfNode;
            PR_last_selected_element = dpfNode;
            PR_selected_type_node = dpfNode.typing.type;

            document.getElementById('PR_typeName').value = PR_selected_type_node.name;
            document.getElementById('PR_nodeName').value = dpfNode.name;

            PR_node_click = (PR_node_click + 1 ) % 2;

            if (PR_node_click == 1) {
                PR_selected_node_src = dpfNode;
                document.getElementById('PR_srcNode').value = PR_selected_node_src.name;
            }
            else {
                PR_selected_node_trg = dpfNode;
                document.getElementById('PR_trgNode').value = PR_selected_node_trg.name;
            }
            PR_attachModelNodeToPredicate();
        }

    }

    putFocusOnDpfNode(dpfNode);
    this.ow = this.attr('width');
    this.oh = this.attr('height');
    this.dragging = true;

    var conns = dpfNode.conn;
    if (conns) {
        for (var i = conns.length - 1; i >= 0; i--) {
            conns[i].prepareMoveDpfConnectionForNodeMove();
        }
    }
};


var dragDpfNodeEnd = function () {
    this.dragging = false;
    var dpfNode = this.data('parent');
    var predLine = dpfNode.assocPredLine;
    for (var j = predLine.length-1; j >=0; j--) {
        var predSrc = predLine[j].data('parent');
        if(predSrc.dpfType == 'DpfAnnotation' )
            predSrc.moveAnnotation();
        else
            predSrc.movePredicate();
    }
};

var checkDraggingFeasibilityOfDpfNode = function(x,y,width,height,level){
    //console.log('y: ' + y + ' drawingPane[' + level + ']:' + drawingPane[level].attr('y') + ' drawingPane[' + level + ']:' + drawingPane[level].attr('height'));
    var boxCoords = [drawingPane[level].attr('x'), drawingPane[level].attr('y'), drawingPane[level].attr('width'), drawingPane[level].attr('height')];
    //console.log(boxCoords);
    //console.log('' + x + ', ' + y + ', ' + width + ', ' + height + ' level:' + level);
    return (boxCoords[0] <= x && boxCoords[1] <= y && boxCoords[2]>= (x+width) && (boxCoords[1] + boxCoords[3]) >= (y+height));
};

var dragDpfNodeMove = function (dx, dy) {
    var newX, newY, newWidth, newHeight;
    var dpfNode = this.data('parent');
    var level = dpfNode.spec.level;
    // Inspect cursor to determine which resize/move process to use
    switch (this.attr('cursor')) {

        case 'nw-resize' :
            newX = this.ox + dx;
            newY = this.oy + dy;
            newWidth = this.ow - dx;
            newHeight = this.oh - dy;
            if(!checkDraggingFeasibilityOfDpfNode(newX,newY,newWidth,newHeight,level))
                return;
            dpfNode.updateNodeGraphics(newX, newY, newWidth, newHeight);
            break;

        case 'ne-resize' :
            newX = this.ox;
            newY = this.oy + dy;
            newWidth = this.ow + dx;
            newHeight = this.oh - dy;
            if(!checkDraggingFeasibilityOfDpfNode(newX,newY,newWidth,newHeight,level))
                return;
            dpfNode.updateNodeGraphics(newX, newY, newWidth, newHeight);
            break;

        case 'se-resize' :
            newX = this.ox;
            newY = this.oy;
            newWidth = this.ow + dx;
            newHeight = this.oh + dy;
            if(!checkDraggingFeasibilityOfDpfNode(newX,newY,newWidth,newHeight,level))
                return;
            dpfNode.updateNodeGraphics(newX, newY, newWidth, newHeight);
            break;

        case 'sw-resize' :
            newX = this.ox + dx;
            newY = this.oy;
            newWidth = this.ow - dx;
            newHeight = this.oh + dy;
            if(!checkDraggingFeasibilityOfDpfNode(newX,newY,newWidth,newHeight,level))
                return;
            dpfNode.updateNodeGraphics(newX, newY, newWidth, newHeight);
            break;

        default :
            newX = this.ox + dx;
            newY = this.oy + dy;
            newWidth = this.ow;
            newHeight = this.oh;
            if(!checkDraggingFeasibilityOfDpfNode(newX,newY,newWidth,newHeight,level)) {
                console.log('not feasible to move !! level ' + level);
                return;
            }
            dpfNode.updateNodeGraphics(newX, newY, newWidth, newHeight);
            dpfNode.updateTextPosition(this.tox + dx, this.toy + dy);
            break;

    }

    var conns = dpfNode.conn;
    if (conns) {
        for (var i = conns.length-1; i >= 0 ;i--) {
            conns[i].moveDpfConnectionForNodeMove(dpfNode, dx, dy);

            if(conns[i].typing)
                conns[i].typing.moveTypingForConnection();

            var instances = conns[i].instances;
            if (instances) {
                for(j = 0; j < instances.length; ++j)
                    instances[j].moveTypingForConnection();
            }


            var assocPred = conns[i].assocPred;
            for (j = assocPred.length-1; j >= 0; j--) {
                movePredicate(assocPred[j]);
            }
        }
    }
    var predConns = this.data("predConn");
    if (predConns) {
        movePredicate(predConns);
    }




    this.paper.safari();
};



var changeDpfNodeCursor = function (e, mouseX, mouseY) {

    // Don't change cursor during a drag operation
    if (this.dragging === true) {
        return;
    }

    // X,Y Coordinates relative to shape's orgin
    var relativeX = mouseX - this.attr('x') - menuPaneWidth; // - $('#paper').offset().left
    var relativeY = mouseY - this.attr('y'); // $('#paper').offset().top

    var shapeWidth = this.attr('width');
    var shapeHeight = this.attr('height');

    var resizeBorder = 4;

    // Change cursor
    if (this.data("t") && relativeX < resizeBorder && relativeY < resizeBorder) {
        this.attr('cursor', 'nw-resize');
    } else if (this.data("t") && relativeX > shapeWidth - resizeBorder && relativeY < resizeBorder) {
        this.attr('cursor', 'ne-resize');
    } else if (this.data("t") && relativeX > shapeWidth - resizeBorder && relativeY > shapeHeight - resizeBorder) {
        this.attr('cursor', 'se-resize');
    } else if (this.data("t") && relativeX < resizeBorder && relativeY > shapeHeight - resizeBorder) {
        this.attr('cursor', 'sw-resize');
    } else {
        this.attr('cursor', 'move');
    }
};
