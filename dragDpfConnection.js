/**
 * Created by rabbi on 2/9/15.
 */

/**
 * Created by rabbi on 1/30/15.
 */

var dragDpfConnectionStart = function () {
    var coords = this.data("coords");
    switch (this.data('direction')) {
        case 'source':
            this.ox = coords[0];
            this.oy = coords[1];
            break;
        default:
            this.ox = coords[2];
            this.oy = coords[3];
            break;
    }
    this.dragging = true;
    var conn = this.data('parent');
    var spec = conn.spec;
    var name = conn.name;

    if(spec.level == 0){
        if(M_selected_model.metaLevel > 0) {
            var edgeTypeNameField = document.getElementById('M_EdgeTypeName');
            edgeTypeNameField.value = name;
            M_selected_type_arrow = conn;
        }
        else{
            M_selected_node_src = conn.fromNode;
            M_selected_node_trg = conn.toNode;
            M_selected_arrow = conn;
            document.getElementById('M_srcNode').value = M_selected_node_src.name;
            document.getElementById('M_trgNode').value = M_selected_node_trg.name;
            document.getElementById('M_edgeName').value = conn.name;
            document.getElementById('M_deepCpEdge').checked = (conn.deepCp == 1);
        }

    }
    else if(spec.level == 1){
        M_selected_type_arrow = conn.typing.type;
        M_selected_node_src = conn.fromNode;
        M_selected_node_trg = conn.toNode;
        M_selected_arrow = conn;

        document.getElementById('M_EdgeTypeName').value = conn.typing.type.name;
        document.getElementById('M_srcNode').value = M_selected_node_src.name;
        document.getElementById('M_trgNode').value = M_selected_node_trg.name;
        document.getElementById('M_edgeName').value = conn.name;
        document.getElementById('M_deepCpEdge').checked = (conn.deepCp == 1);
        document.getElementById('M_EdgeEdit').disabled = false;
        attachModelConnToPredicate();
    }
    else if(spec.level == 2){
        P_selected_arrow = conn;
        P_selected_node_src = P_selected_arrow.fromNode;
        P_selected_node_trg = P_selected_arrow.toNode;
        P_last_selected_item = conn;


        document.getElementById('P_srcNode').value = P_selected_node_src.name;
        document.getElementById('P_trgNode').value = P_selected_node_trg.name;
        document.getElementById('P_edgeName').value = conn.name;

        document.getElementById('P_EdgeEdit').disabled = false;

        document.getElementById('P_selectedElementName').value = P_selected_arrow.name;

        if(C_selected_rule) {
            C_selected_type_arrow = conn;
            document.getElementById('C_EdgeTypeName').value = conn.name;
        }
        if(PR_selected_rule) {
            PR_selected_type_arrow = conn;
            document.getElementById('PR_EdgeTypeName').value = conn.name;
        }
    }
    else if(spec.level == 3){
        if(C_selected_rule) {
            C_selected_arrow = conn;
            C_last_selected_element = conn;
            P_selected_node_src = C_selected_arrow.fromNode;
            P_selected_node_trg = C_selected_arrow.toNode;
            P_selected_type_arrow = C_selected_arrow.typing.type;

            document.getElementById('C_EdgeTypeName').value = conn.typing.type.name;
            document.getElementById('C_srcNode').value = P_selected_node_src.name;
            document.getElementById('C_trgNode').value = P_selected_node_trg.name;
            document.getElementById('C_edgeName').value = conn.name;
        }
        if(PR_selected_rule){
            PR_selected_arrow = conn;
            PR_last_selected_element = conn;
            P_selected_node_src = PR_selected_arrow.fromNode;
            P_selected_node_trg = PR_selected_arrow.toNode;
            P_selected_type_arrow = PR_selected_arrow.typing.type;

            document.getElementById('PR_EdgeTypeName').value = conn.typing.type.name;
            document.getElementById('PR_srcNode').value = P_selected_node_src.name;
            document.getElementById('PR_trgNode').value = P_selected_node_trg.name;
            document.getElementById('PR_edgeName').value = conn.name;

            PR_attachModelConnToPredicate();
        }

    }

    putFocusOnDpfConnection(conn);
};

var dragDpfConnectionEnd = function () {
    this.dragging = false;
    var conn = this.data("parent");
    conn.reattachDpfConnection(this, this.data('direction'));
    var assocPred = conn.assocPred;
    for (var j = assocPred.length-1; j >=0; j--) {
        movePredicate(assocPred[j]);
    }
    paper.safari();
    this.data('direction', '');
};


var checkDraggingFeasibilityOfDpfConnection = function(x,y,level){
    var boxCoords = [drawingPane[level].attr('x'), drawingPane[level].attr('y'), drawingPane[level].attr('width'), drawingPane[level].attr('height')];
    return (boxCoords[0] <= x && boxCoords[1] <= y && boxCoords[2]>= x && (boxCoords[1] + boxCoords[3]) >= y);
};

var dragDpfConnectionMove = function (dx, dy) {

    // Inspect cursor to determine which resize/move process to use
    var conn = this.data("parent"),
        spec = conn.spec,
        newX = (this.ox + dx),
        newY = (this.oy + dy);

    if(!checkDraggingFeasibilityOfDpfConnection(newX,newY, spec.level))
        return;
    if (this.data('direction')) {
        conn.moveDpfConnection(this, newX, newY, this.data('direction'));

        var coords = this.data("coords");
        // if there are neighbour lines, get them

        var rightLine = this.data("rightLine");
        if (rightLine) {
            conn.moveDpfConnection(rightLine, coords[2], coords[3], "source");
        }

        var leftLine = this.data("leftLine");
        if (leftLine) {
            conn.moveDpfConnection(leftLine, coords[0], coords[1], "target");
        }

        var assocPred = conn.assocPred;
        for (var j = 0; j < assocPred.length ;j++) {
            movePredicate(assocPred[j]);
        }

        if(conn.typing)
            conn.typing.moveTypingForConnection();

        var instances = conn.instances;
        for (j = 0; j < instances.length ; j++) {
            instances[j].moveTypingForConnection();
        }
        paper.safari();
    }
};



var changeDpfConnectionCursor = function (e, mouseX, mouseY) {

    // Don't change cursor during a drag operation
    if (this.dragging === true) {
        return;
    }
    var coords = this.data("coords");
    // X,Y Coordinates relative to shape's orgin
    var relativeX1 = mouseX - menuPaneWidth; // - this.paper.canvas.offsetLeft; // $('#paper').offset().left;
    var relativeY1 = mouseY; // - this.paper.canvas.offsetTop; //$('#paper').offset().top;

    if ((Math.abs(relativeX1 - coords[0]) + Math.abs(relativeY1 - coords[1]) ) <
        (Math.abs(relativeX1 - coords[2]) + Math.abs(relativeY1 - coords[3]) ))
        this.data('direction', 'source');
    else
        this.data('direction', 'target');

    this.attr('cursor', 'move');
};


var splitDpfConnection = function (e) {
    var splitX, splitY;
    if (e.x) {
        splitX = e.x; // - paper.canvas.offsetLeft;  // $('#paper').offset().left,
        splitY = e.y; // - paper.canvas.offsetTop; // $('#paper').offset().top;
    }
    else {
        splitX = e.clientX;
        splitY = e.clientY;
    }
    splitX -= menuPaneWidth;


    var conn = this.data("parent");
    var oldCoords = this.data('coords');
    var newCoords1 = [oldCoords[0], oldCoords[1], splitX, splitY];
    var newCoords2 = [splitX, splitY, oldCoords[2], oldCoords[3]];

    var path = ["M", newCoords1[0].toFixed(3), newCoords1[1].toFixed(3), "L", newCoords1[2].toFixed(3), newCoords1[3].toFixed(3)].join(",");
    var newLine = paper.path(path).attr({
        stroke: conn.strokeColor,
        fill: "none",
        "stroke-width": 3,
        "arrow-start": "oval-narrow-midium"
    }).data('coords', newCoords1).data("parent", conn);

    var path2 = ["M", (newCoords2[0]).toFixed(3), (newCoords2[1]).toFixed(3), "L", (newCoords2[2]).toFixed(3), (newCoords2[3]).toFixed(3)].join(",");
    this.attr({
        path: path2, stroke: conn.strokeColor, fill: "none", "stroke-width": 3,
        "arrow-start": "oval-narrow-midium",
        'arrow-end': this.data('rightLine') ? 'oval-narrow-midium' : 'classic-wide-long'
    }).data('coords', newCoords2);


    // fix the array
    var lines = [], i = 0;
    for (; i < conn.d_lines.length; ++i) {
        if (conn.d_lines[i] == this)
            break;
        lines.push(conn.d_lines[i]);
    }
    lines.push(newLine);
    for (; i < conn.d_lines.length; ++i) {
        lines.push(conn.d_lines[i]);
    }
    for(i = conn.d_lines.length; i>=0; --i)
        conn.d_lines.pop();

    for(i = 0; i < lines.length; ++i)
        conn.d_lines[i] = lines[i];

    newLine.data("rightLine", this);

    var prevLeftLine = this.data("leftLine");
    if (prevLeftLine) {
        prevLeftLine.data("rightLine", newLine);
        newLine.data("leftLine", prevLeftLine);
    }

    this.data("leftLine", newLine);

    newLine.data("parent", conn);

    var assocPred = conn.assocPred;
    for (var j = assocPred.length-1; j >= 0; j--) {
        conn.movePredicate(assocPred[j]);
    }

    newLine.mousemove(changeDpfConnectionCursor);
    newLine.drag(dragDpfConnectionMove, dragDpfConnectionStart, dragDpfConnectionEnd);
    newLine.dblclick(splitDpfConnection);
};
