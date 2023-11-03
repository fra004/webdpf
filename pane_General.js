/**
 * Created by rabbi on 2/13/15.
 */

var showErrorMessage = function(fieldId, message, warningFlag){
    if(message && message.length > 0) {
        if(warningFlag)
            document.getElementById(fieldId).innerHTML = 'Warning: ' + message;
        else
            document.getElementById(fieldId).innerHTML = 'Error: ' + message;
    }
    else if(message && message.message){
        if(warningFlag)
            document.getElementById(fieldId).innerHTML = 'Warning: ' + message.message;
        else
            document.getElementById(fieldId).innerHTML = 'Error: ' + message.message;
    }
};

var clearErrorMessage = function(fieldId){
    document.getElementById(fieldId).innerHTML = '';
};

var showMessage = function(fieldId, message){
    document.getElementById(fieldId).innerHTML = 'Info: ' + message;
};

var clearMessage = function(fieldId){
    document.getElementById(fieldId).innerHTML = '';
};

var displayNodeTypingOfSpec = function (nodeTypingSetting, spec) {
    switch (nodeTypingSetting) {
        case true:
            var nodes = spec.nodes;
            for(var i = 0; i < nodes.length; ++i){
                nodes[i].typing.d_line.show();
            }

            break;
        case false:
            nodes = spec.nodes;
            for(i = 0; i < nodes.length; ++i){
                nodes[i].typing.d_line.hide();
            }
            break;
    }
};



var displayEdgeTypingOfSpec = function (edgeTypingSetting, spec) {
    switch (edgeTypingSetting) {
        case true:
            var conns = spec.connections;
            for(var j = 0; j < conns.length; ++j){
                conns[j].typing.d_line.show();
            }
            break;
        case false:
            conns = spec.connections;
            for(j = 0; j < conns.length; ++j){
                conns[j].typing.d_line.hide();
            }
            break;
    }
};


var cleanupDrawingPane = function(spec, hideInstances){
    var nodes = spec.nodes;
    var connections = spec.connections;
    var predicates = spec.predicates;
    var instances;
    var i = 0, j = 0, l = 0, k;

    for (j = 0; j < nodes.length; ++j) {
        var node = nodes[j];
        node.d_node.hide();
        node.d_text.hide();
        if(node.d_nacLine)
            node.d_nacLine.hide();

        var typing = node.typing;
        if(typing)
        typing.d_line.hide();
        if(hideInstances){
            instances = node.instances;
            for(k = 0; k < instances.length; ++k){
                instances[k].d_line.hide();
            }
        }

    }
    for (j = 0; j < connections.length; ++j) {
        var conn = connections[j];
        conn.d_text.hide();
        if(conn.typing)
            conn.typing.d_line.hide();

        var lines = conn.d_lines;
        for (k = 0; k < lines.length; ++k) {
            lines[k].hide();
        }
        if(spec.level == 3 && conn.d_nacLine != null ){
            conn.d_nacLine.hide();
        }

        if(hideInstances){
            instances = conn.instances;
            for(k = 0; k < instances.length; ++k){
                instances[k].d_line.hide();
            }
        }
    }
    for(j = 0; j < predicates.length; ++j){
        predicates[j].d_text.hide();
        lines = predicates[j].d_lines;
        for (k = 0; k < lines.length; ++k) {
            lines[k].hide();
        }
    }

    var predicateConstraints = spec.predicateConstraints;
    for(j = 0; j < predicateConstraints.length; ++j){
        predicateConstraints[j].d_text.hide();

        for(l = 0; l < predicateConstraints[j].d_lines.length; ++l) {
            predicateConstraints[j].d_lines[l].hide();
        }
    }

    if(spec.level == 3) {
        for(j = 0; j < allProductionRules.length; ++j){
            var prodRule = allProductionRules[j];
            if(prodRule.annotations == null) continue;
            for(k = 0; k < prodRule.annotations.length; ++k)
                prodRule.annotations[k].hide();
        }
    }
};



var moveTypingForModelSwitching= function(spec){
    var nodes = spec.nodes;
    for (var j = 0; j < nodes.length; ++j) {
        var dpfNode = nodes[j];
        for(var i = 0; i < dpfNode.instances.length; ++i)
            dpfNode.instances[i].moveTypingForDpfNodeMove();

        var conns = dpfNode.conn;
        if (conns) {
            for (i = conns.length-1; i >= 0 ;i--) {
                var instances = conns[i].instances;
                if (instances) {
                    for(var k = 0; k < instances.length; ++k)
                        instances[k].moveTypingForConnection();
                }

            }
        }
    }
};

var showDrawingPane = function(spec, typingFlag, dx, dy){
    var nodes = spec.nodes;
    var connections = spec.connections;
    var predicates = spec.predicates;
    var i = 0, j = 0, l = 0;
    if(dx != 0 || dy != 0)
        shiftDrawingPane(spec, dx, dy);

    for (j = 0; j < nodes.length; ++j) {
        var node = nodes[j];
        node.show(typingFlag);
    }
    for (j = 0; j < connections.length; ++j) {
        var conn = connections[j];
        conn.show(typingFlag);
    }
    for(j = 0; j < predicates.length; ++j){
        predicates[j].d_text.show();
        lines = predicates[j].d_lines;
        for (k = 0; k < lines.length; ++k) {
            lines[k].show();
        }
    }

    var predicateConstraints = spec.predicateConstraints;
    for(j = 0; j < predicateConstraints.length; ++j){
        predicateConstraints[j].d_text.show();

        for(l = 0; l < predicateConstraints[j].d_lines.length; ++l) {
            predicateConstraints[j].d_lines[l].show();
        }
    }

};


var initializeDrawingPane = function(spec, dx, dy){
    if(dx != 0 || dy != 0)
        shiftDrawingPane(spec, dx, dy);
};


var shiftDrawingPane= function (spec, dx, dy) {
        var coords;
        var nodes = spec.nodes;
        var level = spec.level;
        var connections = spec.connections;

        for (j = 0; j < nodes.length; ++j) {
            var node = nodes[j];
            node.d_node.attr({y: (node.d_node.attr('y') + dy)});
            node.d_node.attr({x: (node.d_node.attr('x') + dx)});

            node.d_text.attr({x: (node.d_text.attr('x') + dx)});
            node.d_text.attr({y: (node.d_text.attr('y') + dy)});

            var instances = node.instances;
            for(k = 0; k < instances.length; ++k){
                coords = instances[k].d_line.data('coords');
                coords[0] = coords[0] + dx;
                coords[1] = coords[1] + dy;
                coords[2] = coords[2] + dx;
                coords[3] = coords[3] + dy;
                coords[4] = coords[4] + dx;
                coords[5] = coords[5] + dy;
                coords[6] = coords[6] + dx;
                coords[7] = coords[7] + dy;

                path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "C", coords[2].toFixed(3), coords[3].toFixed(3), coords[4].toFixed(3), coords[5].toFixed(3), coords[6].toFixed(3), coords[7].toFixed(3)].join(",");
                instances[k].d_line.attr({path: path});
            }
            if(level == 3 && node.d_nacLine != null ){
                coords = node.d_nacLine.data('coords');
                coords[0] = coords[0] + dx;
                coords[1] = coords[1] + dy;
                coords[2] = coords[2] + dx;
                coords[3] = coords[3] + dy;
                path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");
                node.d_nacLine.attr({path: path});
                node.d_nacLine.data('coords', coords);
            }
        }
        for (j = 0; j < connections.length; ++j) {
            var conn = connections[j];
            conn.d_text.attr({x: (conn.d_text.attr('x') + dx) });
            conn.d_text.attr({y: (conn.d_text.attr('y') + dy) });

            var lines = conn.d_lines;
            for (k = 0; k < lines.length; ++k) {
                coords = lines[k].data("coords");
                coords[0] = coords[0] + dx;
                coords[1] = coords[1] + dy;
                coords[2] = coords[2] + dx;
                coords[3] = coords[3] + dy;
                var path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "L", coords[2].toFixed(3), coords[3].toFixed(3)].join(",");
                lines[k].attr({path: path}).data("coords", coords);
            }


            instances = conn.instances;
            for(k = 0; k < instances.length; ++k){
                coords = instances[k].d_line.data('coords');
                coords[0] = coords[0] + dx;
                coords[1] = coords[1] + dy;
                coords[2] = coords[2] + dx;
                coords[3] = coords[3] + dy;
                coords[4] = coords[4] + dx;
                coords[5] = coords[5] + dy;
                coords[6] = coords[6] + dx;
                coords[7] = coords[7] + dy;
                path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "C", coords[2].toFixed(3), coords[3].toFixed(3), coords[4].toFixed(3), coords[5].toFixed(3), coords[6].toFixed(3), coords[7].toFixed(3)].join(",");
                instances[k].d_line.attr({path: path});
            }

            if(level == 3 && conn.d_nacLine != null ){
                coords = conn.d_nacLine.data('coords');
                coords[0] = coords[0] + dx;
                coords[1] = coords[1] + dy;
                coords[2] = coords[2] + dx;
                coords[3] = coords[3] + dy;
                path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");
                conn.d_nacLine.attr({path: path});
                conn.d_nacLine.data('coords', coords);
            }
        }

        var predicates = spec.predicates;
        for(var j = 0; j < predicates.length; ++j){
            predicates[j].d_text.attr({x: (predicates[j].d_text.attr('x') + dx)});
            predicates[j].d_text.attr({y: (predicates[j].d_text.attr('y') + dy)});

            for(var l = 0; l < predicates[j].d_lines.length; ++l) {
                coords = predicates[j].d_lines[l].data('coords');
                coords[0] = coords[0] + dx;
                coords[1] = coords[1] + dy;
                coords[2] = coords[2] + dx;
                coords[3] = coords[3] + dy;
                var path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                predicates[j].d_lines[l].attr('path', path1).data('coords', coords);
            }
        }

        var predicateConstraints = spec.predicateConstraints;
        for(j = 0; j < predicateConstraints.length; ++j){
            predicateConstraints[j].d_text.attr({x: (predicateConstraints[j].d_text.attr('x') + dx)});
            predicateConstraints[j].d_text.attr({y: (predicateConstraints[j].d_text.attr('y') + dy)});

            for(l = 0; l < predicateConstraints[j].d_lines.length; ++l) {
                coords = predicateConstraints[j].d_lines[l].data('coords');
                coords[0] = coords[0] + dx;
                coords[1] = coords[1] + dy;
                coords[2] = coords[2] + dx;
                coords[3] = coords[3] + dy;
                path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                predicateConstraints[j].d_lines[l].attr('path', path1).data('coords', coords);
            }
        }

        if(level == 3) {
            for (j = 0; j < allProductionRules.length; ++j) {
                var prodRule = allProductionRules[j];
                if (prodRule.annotations == null) continue;
                for (var k = 0; k < prodRule.annotations.length; ++k) {
                    prodRule.annotations[k].d_text.attr({x: (prodRule.annotations[k].d_text.attr('x') + dx)});
                    prodRule.annotations[k].d_text.attr({y: (prodRule.annotations[k].d_text.attr('y') + dy)});

                    for (l = 0; l < prodRule.annotations[k].d_lines.length; ++l) {
                        coords = prodRule.annotations[k].d_lines[l].data('coords');
                        coords[0] = coords[0] + dx;
                        coords[1] = coords[1] + dy;
                        coords[2] = coords[2] + dx;
                        coords[3] = coords[3] + dy;
                        path1 = ["M", coords[0], coords[1], "L", coords[2], coords[3]].join(",");
                        prodRule.annotations[k].d_lines[l].attr('path', path1).data('coords', coords);
                    }
                }
            }
        }

};



var getCornerCoordinate = function(spec){
    var nodes = spec.nodes;
    var connections = spec.connections;
    var predicates = spec.predicates;
    var i = 0, j = 0, l = 0,
        left = 2000, right = 0,
        top = 2000,  bottom = 0,
        lt = 0, rt = 0, tp = 0, bm = 0,
        bb, coords;

    for (j = 0; j < nodes.length; ++j) {
        var node = nodes[j];
        console.log(node);
        /*
        ////bb = node.d_node.getBBox();
        lt = node.d_x; //// bb.x;
        rt = node.d_x + node.d_width; //// bb.x + bb.width;
        tp = node.d_y; ////bb.y;
        bm = node.d_y + node.d_height; ////bb.y + bb.height;
        */
        bb = node.d_node.getBBox();
        lt =  bb.x;
        rt =  bb.x + bb.width;
        tp =  bb.y;
        bm = bb.y + bb.height;
        if(lt < left ) left = lt;
        if(rt > right) right = rt;
        if(tp < top) top = tp;
        if(bm > bottom) bottom = bm;
    }
    for (j = 0; j < connections.length; ++j) {
        var conn = connections[j];
        console.log(conn);
        bb = conn.d_text.getBBox();
        lt = bb.x;
        rt = bb.x + bb.width;
        tp = bb.y;
        bm = bb.y + bb.height;
        if(lt < left ) left = lt;
        if(rt > right) right = rt;
        if(tp < top) top = tp;
        if(bm > bottom) bottom = bm;

        var lines = conn.d_lines;
        for (k = 0; k < lines.length; ++k) {
            coords = lines[k].data('coords');
            if(coords[0] < left) left = coords[0];
            if(coords[0] > right) right = coords[0];

            if(coords[1] < top) top = coords[1];
            if(coords[1] > bottom) bottom = coords[1];

            if(coords[2] < left) left = coords[2];
            if(coords[2] > right) right = coords[2];

            if(coords[3] < top) top = coords[3];
            if(coords[3] > bottom) bottom = coords[3];
        }
        if(spec.level == 3 && conn.d_nacLine != null ){
            coords = conn.d_nacLine.data('coords');
            if(coords[0] < left) left = coords[0];
            if(coords[0] > right) right = coords[0];

            if(coords[1] < top) top = coords[1];
            if(coords[1] > bottom) bottom = coords[1];

            if(coords[2] < left) left = coords[2];
            if(coords[2] > right) right = coords[2];

            if(coords[3] < top) top = coords[3];
            if(coords[3] > bottom) bottom = coords[3];
        }
    }
    for(j = 0; j < predicates.length; ++j){
        bb = predicates[j].d_text.getBBox();
        lt = bb.x;
        rt = bb.x + bb.width;
        tp = bb.y;
        bm = bb.y + bb.height;
        if(lt < left ) left = lt;
        if(rt > right) right = rt;
        if(tp < top) top = tp;
        if(bm > bottom) bottom = bm;

        lines = predicates[j].d_lines;
        for (k = 0; k < lines.length; ++k) {
            coords = lines[k].data('coords');
            if(coords[0] < left) left = coords[0];
            if(coords[0] > right) right = coords[0];

            if(coords[1] < top) top = coords[1];
            if(coords[1] > bottom) bottom = coords[1];

            if(coords[2] < left) left = coords[2];
            if(coords[2] > right) right = coords[2];

            if(coords[3] < top) top = coords[3];
            if(coords[3] > bottom) bottom = coords[3];
        }
    }

    var predicateConstraints = spec.predicateConstraints;
    for(j = 0; j < predicateConstraints.length; ++j){
        bb = predicateConstraints[j].d_text.getBBox();
        lt = bb.x;
        rt = bb.x + bb.width;
        tp = bb.y;
        bm = bb.y + bb.height;
        if(lt < left ) left = lt;
        if(rt > right) right = rt;
        if(tp < top) top = tp;
        if(bm > bottom) bottom = bm;

        for(l = 0; l < predicateConstraints[j].d_lines.length; ++l) {
            coords = predicateConstraints[j].d_lines[l].data('coords');
            if(coords[0] < left) left = coords[0];
            if(coords[0] > right) right = coords[0];

            if(coords[1] < top) top = coords[1];
            if(coords[1] > bottom) bottom = coords[1];

            if(coords[2] < left) left = coords[2];
            if(coords[2] > right) right = coords[2];

            if(coords[3] < top) top = coords[3];
            if(coords[3] > bottom) bottom = coords[3];
        }
    }
    return [left, right, top, bottom];
};


Raphael.el.is_visible = function() {
    return (this.node.style.display !== "none");
};

var putFocusOnDpfNode = function(dpfNode){
    if(highlightedNode)
        highlightedNode.removeFocusFromNode();

    highlightedNode = dpfNode;
    highlightedNode.focusNode();

};

var putFocusOnDpfConnection = function(dpfConnection){
    if(highlightedConn)
        highlightedConn.removeFocusFromConnection();

    highlightedConn = dpfConnection;
    highlightedConn.focusConnection();

};