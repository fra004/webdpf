/**
 * Created by rabbi on 1/31/15.
 */
var changeSeperatorCursor = function (e, mouseX, mouseY) {
    // Don't change cursor during a drag operation
    if (this.dragging === true) {
        return;
    }
    this.attr('cursor', 'move');
};

function setOriginalCoordinates() {

    var i, j, k, lineCoords, origCoords, coords;

    for(i = 0; i < dpfSpecifications.length; ++i){
        var spec = dpfSpecifications[i];
        var level = spec.level;

        var nodes = spec.nodes;
        var connections = spec.connections;
        var predicates = spec.predicates;
        var predicateConstraints = spec.predicateConstraints;

        for (j = 0; j < nodes.length; ++j) {
            var node = nodes[j];
            node.d_node.ox = node.d_node.attr('x');
            node.d_node.oy = node.d_node.attr('y');
            node.d_text.ox = node.d_text.attr('x');
            node.d_text.oy = node.d_text.attr('y');
            var instances = node.instances;
            for(k = 0; k < instances.length; ++k){
                lineCoords = instances[k].d_line.data('coords');
                origCoords = [lineCoords[0], lineCoords[1], lineCoords[2], lineCoords[3], lineCoords[4], lineCoords[5], lineCoords[6], lineCoords[7]];
                instances[k].d_line.data("origCoords", origCoords);
            }
            if(level == 3 && node.d_nacLine != null ){
                coords = node.d_nacLine.data('coords');
                origCoords = [coords[0], coords[1], coords[2], coords[3]];
                console.log(origCoords);
                node.d_nacLine.data("origCoords", origCoords);
            }
        }
        for (j = 0; j < connections.length; ++j) {
            var conn = connections[j];
            conn.d_text.ox = conn.d_text.attr('x');
            conn.d_text.oy = conn.d_text.attr('y');
            var lines = conn.d_lines;
            for (k = 0; k < lines.length; ++k) {
                lineCoords = lines[k].data('coords');
                origCoords = [lineCoords[0], lineCoords[1], lineCoords[2], lineCoords[3]];
                lines[k].data("origCoords", origCoords);
            }

            instances = conn.instances;
            for(k = 0; k < instances.length; ++k){
                lineCoords = instances[k].d_line.data('coords');
                origCoords = [lineCoords[0], lineCoords[1], lineCoords[2], lineCoords[3], lineCoords[4], lineCoords[5], lineCoords[6], lineCoords[7]];
                instances[k].d_line.data("origCoords", origCoords);
            }
            if(level == 3 && conn.d_nacLine != null ){
                coords = conn.d_nacLine.data('coords');
                origCoords = [coords[0], coords[1], coords[2], coords[3]];
                conn.d_nacLine.data("origCoords", origCoords);
                console.log(origCoords);
            }
        }
        for(j = 0; j < predicates.length; ++j){
            predicates[j].d_text.ox = predicates[j].d_text.attr('x');
            predicates[j].d_text.oy = predicates[j].d_text.attr('y');
                for(var l = 0; l < predicates[j].d_lines.length; ++l) {
                    coords = predicates[j].d_lines[l].data('coords');
                    var oCoords = [coords[0], coords[1], coords[2], coords[3]];
                    predicates[j].d_lines[l].data('origCoords', oCoords);
                }
        }

        for(j = 0; j < predicateConstraints.length; ++j){
            predicateConstraints[j].d_text.ox = predicateConstraints[j].d_text.attr('x');
            predicateConstraints[j].d_text.oy = predicateConstraints[j].d_text.attr('y');
            for(l = 0; l < predicateConstraints[j].d_lines.length; ++l) {
                coords = predicateConstraints[j].d_lines[l].data('coords');
                oCoords = [coords[0], coords[1], coords[2], coords[3]];
                predicateConstraints[j].d_lines[l].data('origCoords', oCoords);
            }
        }

    }


    for(i = 0; i < allRules.length; ++i){
        var aRule = allRules[i];
        for(j = 0; j < aRule.annotations.length; ++j){
            var annot = aRule.annotations[j];
            if(aRule.annotations == null) continue;
            annot.d_text.ox = annot.d_text.attr('x');
            annot.d_text.oy = annot.d_text.attr('y');

            for(l = 0; l < annot.d_lines.length; ++l) {
                coords = annot.d_lines[l].data('coords');
                oCoords = [coords[0], coords[1], coords[2], coords[3]];
                path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                annot.d_lines[l].data('origCoords', oCoords);
            }
        }
    }

    for(i = 0; i < allProductionRules.length; ++i){
         aRule = allProductionRules[i];
        if(aRule.annotations == null) continue;
        for(j = 0; j < aRule.annotations.length; ++j){
            annot = aRule.annotations[j];
            annot.d_text.ox = annot.d_text.attr('x');
            annot.d_text.oy = annot.d_text.attr('y');

            for(l = 0; l < annot.d_lines.length; ++l) {
                coords = annot.d_lines[l].data('coords');
                oCoords = [coords[0], coords[1], coords[2], coords[3]];
                path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                annot.d_lines[l].data('origCoords', oCoords);
            }
        }
    }

    for(j = 0; j < drawingPane.length; ++j) {
        drawingPane[j].ox = drawingPane[j].attr('x');
        drawingPane[j].oy = drawingPane[j].attr('y');
        drawingPane[j].ow = drawingPane[j].attr('width');
        drawingPane[j].oh = drawingPane[j].attr('height');
    }

}

var dragSeperatorStart = function () {
    this.ox = this.attr('x');
    this.oy = this.attr('y');
    setOriginalCoordinates();
    this.dragging = true;
};

var dragSeperatorMove = function (dx, dy) {
    // Inspect cursor to determine which resize/move process to use
    var newX = this.ox,
        newY = (this.oy + dy);
    if(newY <= 0 || newY >= (drawingPaneHeight-10))
        return;

    this.attr({x: newX, y: newY});
    translateModel(0, dy);
};

var dragSeperatorEnd = function () {
    this.dragging = false;
};

var translateModel = function (dx, dy) {
    var coords, origCoords;

    for(var i = 0; i < dpfSpecifications.length; ++i){
        var spec = dpfSpecifications[i];
        var nodes = spec.nodes;
        var level = spec.level;
        var connections = spec.connections;

        for (j = 0; j < nodes.length; ++j) {
            var node = nodes[j];
            node.d_node.attr({y: (node.d_node.oy + dy)});
            node.d_text.attr({y: (node.d_text.oy + dy)});

            var instances = node.instances;
            for(k = 0; k < instances.length; ++k){
                origCoords = instances[k].d_line.data('origCoords');
                coords = instances[k].d_line.data('coords');
                coords[1] = origCoords[1] + dy;
                coords[3] = origCoords[3] + dy;
                coords[5] = origCoords[5] + dy;
                coords[7] = origCoords[7] + dy;

                path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "C", coords[2].toFixed(3), coords[3].toFixed(3), coords[4].toFixed(3), coords[5].toFixed(3), coords[6].toFixed(3), coords[7].toFixed(3)].join(",");
                instances[k].d_line.attr({path: path});
            }
            if(level == 3 && node.d_nacLine != null ){
                origCoords = node.d_nacLine.data('origCoords');
                console.log(origCoords);
                coords = [];
                coords[0] = origCoords[0];
                coords[1] = origCoords[1] + dy;
                coords[2] = origCoords[2];
                coords[3] = origCoords[3] + dy;
                path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");
                node.d_nacLine.attr({path: path});
                node.d_nacLine.data('coords', coords);
            }
        }
        for (j = 0; j < connections.length; ++j) {
            var conn = connections[j];
            conn.d_text.attr({y: (conn.d_text.oy + dy) });

            var lines = conn.d_lines;
            for (k = 0; k < lines.length; ++k) {
                var origLCoords = lines[k].data("origCoords");
                var lineCoords = [];
                lineCoords[0] = origLCoords[0];
                lineCoords[1] = origLCoords[1] + dy;
                lineCoords[2] = origLCoords[2];
                lineCoords[3] = origLCoords[3] + dy;
                var path = ["M", lineCoords[0].toFixed(3), lineCoords[1].toFixed(3), "L", lineCoords[2].toFixed(3), lineCoords[3].toFixed(3)].join(",");
                lines[k].attr({path: path}).data("coords", lineCoords);
            }


            instances = conn.instances;
            for(k = 0; k < instances.length; ++k){
                origCoords = instances[k].d_line.data('origCoords');
                coords = instances[k].d_line.data('coords');
                coords[1] = origCoords[1] + dy;
                coords[3] = origCoords[3] + dy;
                coords[5] = origCoords[5] + dy;
                coords[7] = origCoords[7] + dy;
                path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "C", coords[2].toFixed(3), coords[3].toFixed(3), coords[4].toFixed(3), coords[5].toFixed(3), coords[6].toFixed(3), coords[7].toFixed(3)].join(",");
                instances[k].d_line.attr({path: path});
            }

            if(level == 3 && conn.d_nacLine != null ){
                origCoords = conn.d_nacLine.data('origCoords');
                coords = [];
                coords[0] = origCoords[0];
                coords[1] = origCoords[1] + dy;
                coords[2] = origCoords[2];
                coords[3] = origCoords[3] + dy;
                console.log(origCoords);
                path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");
                conn.d_nacLine.attr({path: path});
                conn.d_nacLine.data('coords', coords);
            }
        }

        var predicates = spec.predicates;
        for(var j = 0; j < predicates.length; ++j){
            predicates[j].d_text.attr({y: (predicates[j].d_text.oy + dy)});

            for(var l = 0; l < predicates[j].d_lines.length; ++l) {
                var oCoords = predicates[j].d_lines[l].data('origCoords');
                coords = predicates[j].d_lines[l].data('coords');
                coords[1] = oCoords[1] + dy;
                coords[3] = oCoords[3] + dy;
                var path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                predicates[j].d_lines[l].attr('path', path1).data('coords', coords);
            }
        }

        var predicateConstraints = spec.predicateConstraints;
        for(j = 0; j < predicateConstraints.length; ++j){
            predicateConstraints[j].d_text.attr({y: (predicateConstraints[j].d_text.oy + dy)});

            for(l = 0; l < predicateConstraints[j].d_lines.length; ++l) {
                oCoords = predicateConstraints[j].d_lines[l].data('origCoords');
                coords = predicateConstraints[j].d_lines[l].data('coords');
                coords[1] = oCoords[1] + dy;
                coords[3] = oCoords[3] + dy;
                path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                predicateConstraints[j].d_lines[l].attr('path', path1).data('coords', coords);
            }
        }

    }

    for(i = 0; i < allRules.length; ++i){
        var aRule = allRules[i];
        if(aRule.annotations == null) continue;
        for(j = 0; j < aRule.annotations.length; ++j){
            var annot = aRule.annotations[j];
            annot.d_text.attr({y: (annot.d_text.oy + dy)});

            for(l = 0; l < annot.d_lines.length; ++l) {
                oCoords = annot.d_lines[l].data('origCoords');
                coords = annot.d_lines[l].data('coords');
                coords[1] = oCoords[1] + dy;
                coords[3] = oCoords[3] + dy;
                path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                annot.d_lines[l].attr('path', path1).data('coords', coords);
            }

        }
    }

    for(i = 0; i < allProductionRules.length; ++i){
        aRule = allProductionRules[i];
        if(aRule.annotations == null) continue;
        for(j = 0; j < aRule.annotations.length; ++j){
            annot = aRule.annotations[j];
            annot.d_text.attr({y: (annot.d_text.oy + dy)});

            for(l = 0; l < annot.d_lines.length; ++l) {
                oCoords = annot.d_lines[l].data('origCoords');
                coords = annot.d_lines[l].data('coords');
                coords[1] = oCoords[1] + dy;
                coords[3] = oCoords[3] + dy;
                path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                annot.d_lines[l].attr('path', path1).data('coords', coords);
            }

        }
    }

    drawingPane[0].attr({height: drawingPane[0].oh + dy});
    drawingPane[1].attr({y: drawingPane[1].oy + dy, height: drawingPane[1].oh - dy});
    drawingPane[2].attr({height: drawingPane[2].oh + dy});
    drawingPane[3].attr({y: drawingPane[3].oy + dy, height: drawingPane[3].oh - dy});
    resizeJSEditor();

};




var dragSeperatorStartHorizontal = function () {
    this.ox = this.attr('x');
    this.oy = this.attr('y');
    setOriginalCoordinates();
    this.dragging = true;
};

var dragSeperatorMoveHorizontal = function (dx, dy) {
    // Inspect cursor to determine which resize/move process to use
    var newX = this.ox  + dx,
        newY = (this.oy);
    if(newX <= 0 || newX > (drawingPaneWidth-10))
        return;

    this.attr({x: newX, y: newY});
    translateModelHorizontal(dx, 0);
};

var dragSeperatorEndHorizontal = function () {
    this.dragging = false;
};

var translateModelHorizontal = function (dx, dy) {
    var coords, origCoords;
    for(i = 0; i < dpfSpecifications.length; ++i){
        var spec = dpfSpecifications[i];
        var nodes = spec.nodes;
        var level = spec.level;
        var connections = spec.connections;

        for (j = 0; j < nodes.length; ++j) {
            var node = nodes[j];
            node.d_node.attr({x: (node.d_node.ox + dx)});
            node.d_text.attr({x: (node.d_text.ox + dx)});

            var instances = node.instances;
            for(k = 0; k < instances.length; ++k){
                origCoords = instances[k].d_line.data('origCoords');
                coords = instances[k].d_line.data('coords');
                coords[0] = origCoords[0] + dx;
                coords[2] = origCoords[2] + dx;
                coords[4] = origCoords[4] + dx;
                coords[6] = origCoords[6] + dx;

                path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "C", coords[2].toFixed(3), coords[3].toFixed(3), coords[4].toFixed(3), coords[5].toFixed(3), coords[6].toFixed(3), coords[7].toFixed(3)].join(",");
                instances[k].d_line.attr({path: path});
            }
            if(level == 3 && node.d_nacLine != null ){
                origCoords = node.d_nacLine.data('origCoords');
                coords = [];
                coords[0] = origCoords[0] + dx;
                coords[1] = origCoords[1];
                coords[2] = origCoords[2] + dx;
                coords[3] = origCoords[3];
                path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");
                node.d_nacLine.attr({path: path});
                node.d_nacLine.data('coords', coords);
            }
        }
        for (j = 0; j < connections.length; ++j) {
            var conn = connections[j];
            conn.d_text.attr({x: (conn.d_text.ox + dx) });

            var lines = conn.d_lines;
            for (k = 0; k < lines.length; ++k) {
                var origLCoords = lines[k].data("origCoords");
                var lineCoords = [];
                lineCoords[0] = origLCoords[0] + dx;
                lineCoords[1] = origLCoords[1];
                lineCoords[2] = origLCoords[2] + dx;
                lineCoords[3] = origLCoords[3];
                var path = ["M", lineCoords[0].toFixed(3), lineCoords[1].toFixed(3), "L", lineCoords[2].toFixed(3), lineCoords[3].toFixed(3)].join(",");
                lines[k].attr({path: path}).data("coords", lineCoords);
            }


            instances = conn.instances;
            for(k = 0; k < instances.length; ++k){
                origCoords = instances[k].d_line.data('origCoords');
                coords = instances[k].d_line.data('coords');
                coords[0] = origCoords[0] + dx;
                coords[2] = origCoords[2] + dx;
                coords[4] = origCoords[4] + dx;
                coords[6] = origCoords[6] + dx;
                path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "C", coords[2].toFixed(3), coords[3].toFixed(3), coords[4].toFixed(3), coords[5].toFixed(3), coords[6].toFixed(3), coords[7].toFixed(3)].join(",");
                instances[k].d_line.attr({path: path});
            }
            if(level == 3 && conn.d_nacLine != null ){
                origCoords = conn.d_nacLine.data('origCoords');
                coords = [];
                coords[0] = origCoords[0] + dx;
                coords[1] = origCoords[1];
                coords[2] = origCoords[2] + dx;
                coords[3] = origCoords[3];
                path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");
                conn.d_nacLine.attr({path: path});
                conn.d_nacLine.data('coords', coords);
            }
        }

        var predicates = spec.predicates;
        for(var j = 0; j < predicates.length; ++j){
            predicates[j].d_text.attr({x: (predicates[j].d_text.ox + dx)});

            for(var l = 0; l < predicates[j].d_lines.length; ++l) {
                var oCoords = predicates[j].d_lines[l].data('origCoords');
                coords = predicates[j].d_lines[l].data('coords');
                coords[0] = oCoords[0] + dx;
                coords[2] = oCoords[2] + dx;
                var path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                predicates[j].d_lines[l].attr('path', path1).data('coords', coords);
            }
        }
        var predicateConstraints = spec.predicateConstraints;
        for(j = 0; j < predicateConstraints.length; ++j){
            predicateConstraints[j].d_text.attr({x: (predicateConstraints[j].d_text.ox + dx)});

            for(l = 0; l < predicateConstraints[j].d_lines.length; ++l) {
                oCoords = predicateConstraints[j].d_lines[l].data('origCoords');
                coords = predicateConstraints[j].d_lines[l].data('coords');
                coords[0] = oCoords[0] + dx;
                coords[2] = oCoords[2] + dx;
                path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                predicateConstraints[j].d_lines[l].attr('path', path1).data('coords', coords);
            }
        }
    }

    for(i = 0; i < allRules.length; ++i){
        var aRule = allRules[i];
        if(aRule.annotations == null) continue;
        for(j = 0; j < aRule.annotations.length; ++j){
            var annot = aRule.annotations[j];
            annot.d_text.attr({x: (annot.d_text.ox + dx)});

            for(l = 0; l < annot.d_lines.length; ++l) {
                oCoords = annot.d_lines[l].data('origCoords');
                coords = annot.d_lines[l].data('coords');
                coords[0] = oCoords[0] + dx;
                coords[2] = oCoords[2] + dx;
                path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                annot.d_lines[l].attr('path', path1).data('coords', coords);
            }

        }
    }

    for(i = 0; i < allProductionRules.length; ++i){
        aRule = allProductionRules[i];
        if(aRule.annotations == null) continue;
        for(j = 0; j < aRule.annotations.length; ++j){
            annot = aRule.annotations[j];
            annot.d_text.attr({x: (annot.d_text.ox + dx)});

            for(l = 0; l < annot.d_lines.length; ++l) {
                oCoords = annot.d_lines[l].data('origCoords');
                coords = annot.d_lines[l].data('coords');
                coords[0] = oCoords[0] + dx;
                coords[2] = oCoords[2] + dx;
                path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                annot.d_lines[l].attr('path', path1).data('coords', coords);
            }

        }
    }
    drawingPane[0].attr({x: drawingPane[0].ox + dx});
    drawingPane[1].attr({x: drawingPane[1].ox + dx});
    drawingPane[2].attr({width: drawingPane[2].ow + dx});
    drawingPane[3].attr({width: drawingPane[3].ow + dx});
    resizeJSEditor();
};