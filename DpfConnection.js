/**
 * Created by rabbi on 2/9/15.
 */

function DpfConnection(name, from, to, specification, connsRepo, connId) {
    if(connId){
        this.ID = connId;
        if(connId >= maxDpfConnectionId)
            maxDpfConnectionId = connId + 1;
    }
    else
        this.ID = maxDpfConnectionId++;

    this.dpfType = 'DpfConnection';
    this.name= name;
    this.spec= specification;
    this.fromNode= from;
    this.toNode= to;
    this.typing= null;
    this.instances= [];
    this.deepCp = 0;
    this.assocPred= [];
    this.assocPredLine= [];
    this.assocPredConst = [];
    this.creationLayer = 0;
    this.lineCoords = [];
    this.d_textCoords = [];
    this.comparisonFlag = false;
    this.displayFlag = 0;
    this.param = new Map();

    this.d_lines= [];
    this.d_text= null;
    this.d_nacLine = null;

    this.refToOriginal = null;

    this.strokeColor = "#126"; //"#b61";

    connsRepo.push(this);
    this.spec.connections.push(this);
    from.conn.push(this);
    to.conn.push(this);
    this.drawConnection = drawConnection;
    this.drawConnectionToSelf = drawConnectionToSelf;
    this.reattachDpfConnection = reattachDpfConnection;
    this.moveDirectDpfConnection = moveDirectDpfConnection;
    this.prepareMoveDpfConnectionForNodeMove = prepareMoveDpfConnectionForNodeMove;
    this.moveDpfConnectionForNodeMove = moveDpfConnectionForNodeMove;
    this.moveDpfConnection = moveDpfConnection;
    this.editDpfConnection = editDpfConnection;
    this.setNACTagToConnection = setNACTagToConnection;
    this.setDelTagToConnection = setDelTagToConnection;
    this.setAddTagToConnection = setAddTagToConnection;
    this.drawConnectionFromCoords = drawConnectionFromCoords;
    this.hideDpfConnection = hideDpfConnection;
    this.removeConnectionFromInstances = removeConnectionFromInstances;
    this.deleteDpfConnection = deleteDpfConnection;
    this.makeInconsistentConnection = makeInconsistentConnection;
    this.clearInconsistentConnection = clearInconsistentConnection;
}

DpfConnection.prototype.copyConnectionCoords = function(){
    if(this.refToOriginal == null)
        return;
    for(var i = 0; i < this.refToOriginal.d_lines.length; ++i){
        var line = this.refToOriginal.d_lines[i];
        var coords = line.data('coords');
        var coords_copy = [];
        for(var j = 0; j < coords.length; ++j) {
            coords_copy.push(coords[j]);
        }
        this.lineCoords.push(coords_copy);
    }
    this.d_textCoords.push(this.refToOriginal.d_text.attr('x'));
    this.d_textCoords.push(this.refToOriginal.d_text.attr('y'));
};


DpfConnection.prototype.copyConnection = function(newSpec, copyRef){
    var fromNode_C = findDpfNodeByIdFromCopyNodes(this.fromNode.ID);
    var toNode_C = findDpfNodeByIdFromCopyNodes(this.toNode.ID);
    console.log(copyConns);
    var newConn = new DpfConnection(this.name, fromNode_C, toNode_C, newSpec, copyConns, this.ID);
    console.log(copyConns);
    newConn.creationLayer = this.creationLayer;
    newConn.displayFlag = this.displayFlag;
    if(copyRef)
        newConn.refToOriginal = this;
    else
        newConn.refToOriginal = this.refToOriginal;

    console.log('copyConnection.... ' + newConn.name);
    if(this.typing)
        this.typing.copyTypingOfConnection(copyRef);
    console.log(copyConns);
};


DpfConnection.prototype.setCreationLayerNumber = function (layerNo){
    this.creationLayer = layerNo;
};

DpfConnection.prototype.removeConnectionFromPaper = function(){
    for(var i = 0; i < this.d_lines.length; ++i){
        this.d_lines[i].remove();
    }
    this.d_lines = [];
    this.d_text.remove();
    if(this.typing)
        this.typing.d_line.remove();
};

DpfConnection.prototype.removeFocusFromConnection = function(){
    for(var i = 0; i < this.d_lines.length; ++i){
        this.d_lines[i].attr("stroke-width", 3);
    }
    this.d_text.attr({"font-size": 12});
    var selectedTypingSetting = document.getElementById("selectedTyping").checked;
    var globalTypingSetting = document.getElementById("edgeTyping").checked;
    switch (selectedTypingSetting) {
        case true:
            if(globalTypingSetting == false && this.typing)
                this.typing.d_line.hide();
            break;
    }
};

DpfConnection.prototype.focusConnection = function(){
    for(var i = 0; i < this.d_lines.length; ++i){
        this.d_lines[i].attr("stroke-width", 4);
    }
    if(this.spec.level == 0)
        return;

    var selectedTypingSetting = document.getElementById("selectedTyping").checked;
    switch (selectedTypingSetting) {
        case true:
            if(this.typing && this.typing.type.spec == dpfSpecifications[0] && this.typing.type.displayFlag == 0)
                this.typing.d_line.show();
            break;
        case false:
            if(this.typing)
                this.typing.d_line.hide();
            break;
    }
};

function removeConnectionFromInstances(connToRemove){
    var newInstList = [];
    for(var i = 0; i < this.instances.length; ++i){
        if(this.instances[i].from.ID != connToRemove.ID )
            newInstList.push(this.instances[i]);
    }
    this.instances = newInstList;
}

function deleteDpfConnection(){
    if(this.instances.length > 0)
        throw "Cannot delete Connection \n" + this.name + ". \nThe connection has instances.";

    // check if any predicate constraint is attached to the connection...
    if(this.assocPredLine.length > 0) {
        var maxCount = this.assocPredLine.length;
        while(maxCount > 0){
            var predConst = this.assocPredLine[0].data('parent');
            if(predConst.dpfType == 'DpfPredicateConstraint')
                predConst.deletePredicateConstraint();

            --maxCount;
            if(this.assocPredLine.length == 0)
                break;
        }
    }

    this.fromNode.removeConnectionReferenceFromDpfNode(this);
    this.toNode.removeConnectionReferenceFromDpfNode(this);

    if(this.typing) {
        this.typing.d_line.remove();
        this.typing.type.removeConnectionFromInstances(this);
    }

    this.d_text.remove();
    for(i =0; i < this.d_lines.length; ++i){
        this.d_lines[i].remove();
    }
    if(this.d_nacLine)
        this.d_nacLine.remove();


    allConnsList = [];
    for(i = 0; i < allConns.length; ++i){
        if(allConns[i].ID != this.ID)
            allConnsList.push(allConns[i]);
    }
    allConns = allConnsList;


    var specConns = [];
    for(i = 0; i < this.spec.connections.length; ++i){
        if(this.spec.connections[i].ID != this.ID)
            specConns.push(this.spec.connections[i]);
    }
    this.spec.connections = specConns;
    if(highlightedConn == this)
        highlightedConn = null;
}


DpfConnection.prototype.deleteDpfConnectionOnly = function(connRepo){
    if(this.instances.length > 0)
        throw "Cannot delete Connection \n" + this.name + ". \nThe connection has instances.";

    // check if any predicate constraint is attached to the connection...
    if(this.assocPredConst.length > 0) {
        var maxCount = this.assocPredConst.length;
        while(maxCount > 0){
            var predConst = this.assocPredConst[0];
            if(predConst.dpfType == 'DpfPredicateConstraint')
                predConst.deletePredicateConstraintOnly();

            --maxCount;
            if(this.assocPredConst.length == 0)
                break;
        }
    }

    this.fromNode.removeConnectionReferenceFromDpfNode(this);
    this.toNode.removeConnectionReferenceFromDpfNode(this);

    if(this.typing) {
        this.typing.type.removeConnectionFromInstances(this);
    }

    var specConns = [];
    for(i = 0; i < this.spec.connections.length; ++i){
        if(this.spec.connections[i].ID != this.ID)
            specConns.push(this.spec.connections[i]);
    }
    this.spec.connections = specConns;
};





var parseDpfConnection = function(connXml, spec){
    //console.log(connXml);
    var connId = parseInt( connXml.getElementsByTagName("ID")[0].childNodes[0].nodeValue);
    var connName = connXml.getElementsByTagName("name")[0].childNodes[0].nodeValue;

    var from = findDpfNodeById( parseInt( connXml.getElementsByTagName("fromNode")[0].childNodes[0].nodeValue ) );
    var to = findDpfNodeById( parseInt( connXml.getElementsByTagName("toNode")[0].childNodes[0].nodeValue ) );

    var theConn = new DpfConnection(connName, from, to, spec, allConns, connId);
    var lineCoords = [];
    var d_textCoords = [];
    var nacLineCoords = [];

    var lineXml = connXml.getElementsByTagName("line");
    for(var i = 0; i < lineXml.length; ++i){
        var coordsXml = lineXml[i].childNodes[0].nodeValue;
        var coordsVals = coordsXml.split(",");
        var coords = [];
        for(var j = 0; j < coordsVals.length; ++j){
            coords.push( parseFloat(coordsVals[j]) );
        }
        lineCoords.push(coords);
    }

    var dTextXml = connXml.getElementsByTagName("d_text");
    coordsVals = dTextXml[0].childNodes[0].nodeValue.split(",");

    d_textCoords.push( parseFloat(coordsVals[0]));
    d_textCoords.push( parseFloat(coordsVals[1]));

    var naclineXml = connXml.getElementsByTagName("d_nacLine");

    if(naclineXml[0]) {
        coordsXml = naclineXml[0].childNodes[0].nodeValue;
        coordsVals = coordsXml.split(",");
        for (j = 0; j < coordsVals.length; ++j) {
            nacLineCoords.push(parseFloat(coordsVals[j]));
        }
    }

    if(connXml.getElementsByTagName("deepCp")[0])
        theConn.deepCp = parseInt( connXml.getElementsByTagName("deepCp")[0].childNodes[0].nodeValue );
    theConn.drawConnectionFromCoords(lineCoords, d_textCoords, nacLineCoords);

    var typeConn = connXml.getElementsByTagName("typing")[0];
    if(typeConn){
        var typeDpfConn = findDpfConnectionById( parseInt(typeConn.childNodes[0].nodeValue));
        var typingOfConn = new DpfTypingOfConnection(theConn, typeDpfConn);
        typingOfConn.drawTypingForConnection();
    }

    return theConn;
};

var getDpfConnectionXml = function(conn, indentStr0){
    var xmlText = "\n" + indentStr0 + "<DpfConnection>";
    var indentStr = indentStr0 + "   ";
    xmlText += "\n" + indentStr + "<ID>" + conn.ID + "</ID>";
    xmlText += "\n" + indentStr + "<name>" + conn.name + "</name>";
    xmlText += "\n" + indentStr + "<fromNode>" + conn.fromNode.ID + "</fromNode>";
    xmlText += "\n" + indentStr + "<toNode>" + conn.toNode.ID + "</toNode>";

    if(conn.typing)
        xmlText += "\n" + indentStr + "<typing>" + conn.typing.type.ID + "</typing>";

    xmlText += "\n" + indentStr + "<deepCp>" + conn.deepCp + "</deepCp>";

    xmlText += "\n" + indentStr + "<d_lines>";
    for(var i = 0; i < conn.d_lines.length; ++i){
        var line = conn.d_lines[i];
        xmlText += "\n" + indentStr + "   <line>";
        var coords = line.data('coords');
        for(var j = 0; j < coords.length; ++j) {
            xmlText += coords[j];
            if(j + 1 < coords.length)
                xmlText += ",";
        }
        xmlText += "</line>";
    }
    xmlText += "\n" + indentStr + "</d_lines>";
    xmlText += "\n" + indentStr + "<d_text>" + conn.d_text.attr('x') + "," + conn.d_text.attr('y') + "</d_text>";

    if(conn.d_nacLine){
        coords = conn.d_nacLine.data('coords');
        xmlText += "\n" + indentStr + "<d_nacLine>";
        for(i = 0; i < coords.length; ++i) {
            xmlText += coords[i];
            if(i + 1 < coords.length)
                xmlText += ",";
        }
        xmlText +=  "</d_nacLine>";
    }

    xmlText += "\n" + indentStr0 + "</DpfConnection>";
    return xmlText;
};

function clearInconsistentConnection(){
    if(this.strokeColor == '#FF0000') {
        this.strokeColor = '#b61';
        for (var i = 0; i < this.d_lines.length; ++i) {
            this.d_lines[i].attr({'fill': '#b61', 'stroke': '#b61'});
        }
    }
}

function makeInconsistentConnection(){
    this.displayFlag = 0;
    this.fromNode.displayFlag = 0;
    this.toNode.displayFlag = 0;

    var nodeTypingFlag = nodeTypingSetting;
    var edgeTypingFlag = edgeTypingSetting;
    if(this.spec == dpfSpecifications[0]) {
        nodeTypingFlag = false;
        edgeTypingFlag = false;
    }

    if(this.spec == dpfSpecifications[0] || this.spec == dpfSpecifications[1]){
        this.fromNode.show(nodeTypingFlag);
        this.toNode.show(nodeTypingFlag);
        this.show(edgeTypingFlag);
    }

    this.strokeColor = '#FF0000';
    for(var i = 0; i < this.d_lines.length; ++ i){
        this.d_lines[i].attr({'fill': '#FF0000', 'stroke': '#FF0000'});
    }
}

function setDelTagToConnection(){
    this.strokeColor = '#DB0000';
    for(var i = 0; i < this.d_lines.length; ++ i){
        this.d_lines[i].attr({'fill': '#DB0000', 'stroke': '#DB0000'});
    }
}

function setAddTagToConnection(){
    this.strokeColor = '#00DB00';
    for(var i = 0; i < this.d_lines.length; ++ i){
        this.d_lines[i].attr({'fill': '#00DB00', 'stroke': '#00DB00'});
    }
}

function setNACTagToConnection(){
    // draw a strikethrough
    var arrowLineCoords = this.d_lines[0].data('coords');
    var coords = [];
    coords.push( (arrowLineCoords[0] + arrowLineCoords[2] ) / 2 - 10 );
    coords.push( (arrowLineCoords[1] + arrowLineCoords[3] ) / 2 + 10 );
    coords.push( (arrowLineCoords[0] + arrowLineCoords[2] ) / 2 + 10 );
    coords.push( (arrowLineCoords[1] + arrowLineCoords[3] ) / 2 - 10 );

    var path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");
    var line = paper.path(path).attr({
        stroke: "#dbc",
        fill: "none",
        "stroke-width": 2
    }).data('coords', coords).data('origCoords', []).data('parent', this);
    line.attr({path: path});

    this.d_nacLine = line;
}

function drawConnectionFromCoords(lineCoords, d_textCoords, dnacLineCoords){
    var coords = [], arrowEnd;
    for(var i = 0; i < lineCoords.length; ++i){
        coords = lineCoords[i];
        if(i + 1 < lineCoords.length)
            arrowEnd = "oval-narrow-small";
        else
            arrowEnd = "classic-wide-long";

        var path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "L", coords[2].toFixed(3), coords[3].toFixed(3)].join(",");
        var line = paper.path(path).attr({stroke: this.strokeColor, fill: "none", "stroke-width": 3, "arrow-start": "oval-narrow-small", 'arrow-end': arrowEnd }).data('coords', coords).data('parent', this);

        if(i > 0) {
            this.d_lines[i-1].data("rightLine", line);
            line.data("leftLine", this.d_lines[i-1]);
        }
        this.d_lines.push(line);
    }

    var connName = '';

    if(this.deepCp == 1)
        connName = this.name + '*';
    else
        connName = this.name;
    this.d_text = paper.text(d_textCoords[0], d_textCoords[1], connName).attr({"text-anchor": "start", fill: '#111111', "font-size": 12}).data("parent", this);
    this.d_text.mousemove(changeDpfTextCursor);
    this.d_text.drag(dragDpfTextMove, dragDpfTextStart, dragDpfTextEnd);


    for(var j = 0; j < this.d_lines.length; ++j) {
        this.d_lines[j].mousemove(changeDpfConnectionCursor);
        this.d_lines[j].drag(dragDpfConnectionMove, dragDpfConnectionStart, dragDpfConnectionEnd);
        this.d_lines[j].dblclick(splitDpfConnection);
    }
}


DpfConnection.prototype.temporaryshow = function(typingFlag){
    if(this.displayFlag < 2) {
        this.d_text.show();
        if (typingFlag && this.typing && this.typing.type.spec == dpfSpecifications[0]&& this.typing.type.displayFlag < 2)
            this.typing.d_line.show();

        var lines = this.d_lines;
        for (k = 0; k < lines.length; ++k) {
            lines[k].show();
        }
        if (this.spec.level == 3 && this.d_nacLine != null) {
            this.d_nacLine.show();
        }
        if(this.assocPredLine.length > 0) {
            for(i = 0; i < this.assocPredLine.length; ++i){
                var predConst = this.assocPredLine[i].data('parent');
                if(predConst.dpfType == 'DpfPredicateConstraint')
                    predConst.temporaryshow();
            }
        }
    }
};

DpfConnection.prototype.show = function(typingFlag){
    if(this.displayFlag == 0) {
        this.d_text.show();
        if (typingFlag && this.typing && this.typing.type.spec == dpfSpecifications[0] && this.typing.type.displayFlag == 0)
            this.typing.d_line.show();

        var lines = this.d_lines;
        for (k = 0; k < lines.length; ++k) {
            lines[k].show();
        }
        if (this.spec.level == 3 && this.d_nacLine != null) {
            this.d_nacLine.show();
        }

        if(this.assocPredLine.length > 0) {
            for(i = 0; i < this.assocPredLine.length; ++i){
                var predConst = this.assocPredLine[i].data('parent');
                if(predConst.dpfType == 'DpfPredicateConstraint')
                    predConst.show();
            }
        }
    }
};

function hideDpfConnection(){
    this.d_text.hide();
    for(var i = 0; i < this.d_lines.length; ++i){
        this.d_lines[i].hide();
    }
    if(this.typing)
        this.typing.d_line.hide();
    if(this.instances.length > 0){
        for(i = 0; i < this.instances.length; ++i){
            this.instances[i].d_line.hide();
        }
    }

    if(this.assocPredLine.length > 0) {
        for(i = 0; i < this.assocPredLine.length; ++i){
            var predConst = this.assocPredLine[i].data('parent');
            if(predConst.dpfType == 'DpfPredicateConstraint')
                predConst.hide();
        }
    }
}

function drawConnectionToSelf(){
    var bb1 = this.fromNode.d_node.getBBox(),
        x1 = bb1.x + bb1.width / 2,
        y1 = bb1.y - 1,
        x2 = x1,
        y2 = y1 - 30,
        x3 = bb1.x + bb1.width + 30,
        y3 = bb1.y + bb1.height / 2,
        x4 = bb1.x + bb1.width + 1,
        y4 = y3,
        xMid = (x2+x3)/2 + 10,
        yMid = (y2+y3)/2;

    var coords1 = [x1, y1, x2, y2];
    var coords2 = [x2, y2, x3, y3];
    var coords3 = [x3, y3, x4, y4];
    var coords  = [x1, y1, x4, y4];
    var path1 = ["M", x1.toFixed(3), y1.toFixed(3), "L", x2.toFixed(3), y2.toFixed(3)].join(",");
    var path2 = ["M", x2.toFixed(3), y2.toFixed(3), "L", x3.toFixed(3), y3.toFixed(3)].join(",");
    var path3 = ["M", x3.toFixed(3), y3.toFixed(3), "L", x4.toFixed(3), y4.toFixed(3)].join(",");


    var line1 = paper.path(path1).attr({stroke: this.strokeColor, fill: "none", "stroke-width": 3, "arrow-start": "oval-narrow-small", 'arrow-end': 'oval-narrow-small' }).data('coords', coords1).data('parent', this);
    var line2 = paper.path(path2).attr({stroke: this.strokeColor, fill: "none", "stroke-width": 3, "arrow-start": "oval-narrow-small", 'arrow-end': 'oval-narrow-small' }).data('coords', coords2).data('parent', this);
    var line3 = paper.path(path3).attr({stroke: this.strokeColor, fill: "none", "stroke-width": 3, "arrow-start": "oval-narrow-small", 'arrow-end': 'classic-wide-long' }).data('coords', coords3).data('parent', this);

    line1.data("rightLine", line2);
    line2.data("leftLine", line1);
    line2.data("rightLine", line3);
    line3.data("leftLine", line2);

    var connName = '';

    if(this.deepCp == 1)
        connName = this.name + '*';
    else
        connName = this.name;
    this.d_text = paper.text(xMid, yMid, connName).attr({"text-anchor": "start", fill: '#111111', "font-size": 12}).data("parent", this);
    this.d_text.mousemove(changeDpfTextCursor);
    this.d_text.drag(dragDpfTextMove, dragDpfTextStart, dragDpfTextEnd);

    this.d_lines.push(line1);
    this.d_lines.push(line2);
    this.d_lines.push(line3);

    for(var j = 0; j < this.d_lines.length; ++j) {
        this.d_lines[j].mousemove(changeDpfConnectionCursor);
        this.d_lines[j].drag(dragDpfConnectionMove, dragDpfConnectionStart, dragDpfConnectionEnd);
        this.d_lines[j].dblclick(splitDpfConnection);
    }
}

function drawConnection() {
    if(this.fromNode == this.toNode)
        return this.drawConnectionToSelf();

    var bb1 = this.fromNode.d_node.getBBox(),
        bb2 = this.toNode.d_node.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
            {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
            {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
            {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
            {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
            {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
            {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
            {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);


    var coords = [x1, y1, x4, y4];
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "L", x4.toFixed(3), y4.toFixed(3)].join(",");

    var aLine = paper.path(path).attr({
        stroke: this.strokeColor,
        fill: "none",
        "stroke-width": 3,
        "arrow-start": "oval-narrow-small",
        'arrow-end': 'classic-wide-long'
    }).data('coords', coords).data('parent', this);

    var connName = '';

    if(this.deepCp == 1)
        connName = this.name + '*';
    else
        connName = this.name;
    this.d_text = paper.text(0, 0, connName).attr({"text-anchor": "start", fill: '#111111', "font-size": 12}).data("parent", this);
    this.d_text.mousemove(changeDpfTextCursor);
    this.d_text.drag(dragDpfTextMove, dragDpfTextStart, dragDpfTextEnd);

    xMid = (x1 + x4) / 2 - this.d_text.getBBox().width;
    yMid = (y1 + y4) / 2 - 8;

    this.d_text.attr({x: xMid, y: yMid});

    this.d_lines.push(aLine);

    aLine.mousemove(changeDpfConnectionCursor);
    aLine.drag(dragDpfConnectionMove, dragDpfConnectionStart, dragDpfConnectionEnd);
    aLine.dblclick(splitDpfConnection);
}

function moveDpfConnection(line, x1, y1, direction) {
    var coords = line.data("coords"),
        relText = this.d_text,
        x2, y2;

    switch (direction) {
        case 'source':
            coords[0] = x1;
            coords[1] = y1;
            break;
        case 'target':
            coords[2] = x1;
            coords[3] = y1;
            break;
    }
    var xMid = (coords[0] + coords[2]) / 2 - relText.getBBox().width,
        yMid = (coords[1] + coords[3]) / 2 - 5;

    var path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");

    line.attr({path: path});

    /////// relText.attr({x: (xMid), y: (yMid)});
    relText.attr({"font-size": 13});
    line.data('coords', coords);

    var predLines = this.assocPredLine;
    for(var i =0; i < predLines.length; ++i){
        var predLine = predLines[i];
        var predSrc = predLine.data('parent');
        if(predSrc.dpfType == 'DpfAnnotation' )
            predSrc.moveAnnotation();
        else
            predSrc.movePredicate();
    }

    if(this.d_nacLine != null){
        var arrowLineCoords = this.d_lines[0].data('coords');
        coords = [];
        coords.push( (arrowLineCoords[0] + arrowLineCoords[2] ) / 2 - 10 );
        coords.push( (arrowLineCoords[1] + arrowLineCoords[3] ) / 2 + 10 );
        coords.push( (arrowLineCoords[0] + arrowLineCoords[2] ) / 2 + 10 );
        coords.push( (arrowLineCoords[1] + arrowLineCoords[3] ) / 2 - 10 );
        path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");
        this.d_nacLine.attr({path: path});
    }
}

function moveDirectDpfConnection() {
    var
        obj1 = this.fromNode,
        obj2 = this.toNode,
        relText = this.d_text;

    var bb1 = obj1.d_node.getBBox(),
        bb2 = obj2.d_node.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
            {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
            {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
            {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
            {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
            {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
            {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
            {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3),
        xMid = (x1 + x4) / 2 - relText.getBBox().width,
        yMid = (y1 + y4) / 2 - 5;

    //var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    var coords = [x1, y1, x4, y4];
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "L", x4.toFixed(3), y4.toFixed(3)].join(",");

    this.d_lines[0].attr({path: path}).data("coords", coords);
    relText.attr({x: xMid, y: yMid});

    var predLines = this.assocPredLine;
    for(var i =0; i < predLines.length; ++i){
        var predLine = predLines[i];
        var predSrc = predLine.data('parent');
        if(predSrc.dpfType == 'DpfAnnotation' )
            predSrc.moveAnnotation();
        else
            predSrc.movePredicate();
    }
}

function prepareMoveDpfConnectionForNodeMove(){

    for(var i = 0; i < this.d_lines.length; ++i){
        var initCoords = [];
        var coords = this.d_lines[i].data('coords');
        for(var j = 0; j < coords.length; ++j){
            initCoords.push(coords[j]);
        }
        this.d_lines[i].data('initCoords', initCoords);
    }

}

function moveDpfConnectionForNodeMove(theNode, dx, dy) {
    /************
    if (this.d_lines.length <= 1) {
        this.moveDirectDpfConnection();
        return;
    }
    *************/

    var
        obj1 = this.fromNode,
        obj2 = this.toNode,
        relText = this.d_text,
        lineToAdjust, index = 0, x, y, coords;

    var bb1 = theNode.d_node.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
            {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
            {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
            {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2}];

    var mindis, i, xMid, yMid, path;
    /**************
    if (obj1 == theNode) {
        lineToAdjust = this.d_lines[0];
        coords = lineToAdjust.data('coords');
        x = coords[2];
        y = coords[3];

        dx = Math.abs(p[0].x - x);
        dy = Math.abs(p[0].y - y);
        mindis = (dx + dy);

        for (i = 1; i < 4; i++) {
            dx = Math.abs(p[i].x - x);
            dy = Math.abs(p[i].y - y);
            if ((dx + dy) < mindis) {
                index = i;
                mindis = (dx + dy);
            }
        }

        coords[0] = p[index].x;
        coords[1] = p[index].y;

        xMid = (coords[0] + coords[2]) / 2 - relText.getBBox().width;
        yMid = (coords[1] + coords[3]) / 2 - 5;

        path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "L", coords[2].toFixed(3), coords[3].toFixed(3)].join(",");
        *************/
    if (obj1 == theNode) {
        lineToAdjust = this.d_lines[0];
        coords = lineToAdjust.data('coords');
        var initCoords = lineToAdjust.data('initCoords');
        coords[0] = initCoords[0] + dx;
        coords[1] = initCoords[1] + dy;
        console.log(coords);
        path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "L", coords[2].toFixed(3), coords[3].toFixed(3)].join(",");
        lineToAdjust.attr({path: path}).data("coords", coords);
    }
    if(obj2 == theNode){
        lineToAdjust = this.d_lines[this.d_lines.length - 1];
        coords = lineToAdjust.data('coords');
        /**********
        x = coords[0];
        y = coords[1];

        dx = Math.abs(p[0].x - x);
        dy = Math.abs(p[0].y - y);
        mindis = (dx + dy);

        for (i = 1; i < 4; i++) {
            dx = Math.abs(p[i].x - x);
            dy = Math.abs(p[i].y - y);
            if ((dx + dy) < mindis) {
                index = i;
                mindis = (dx + dy);
            }
        }
        coords[2] = p[index].x;
        coords[3] = p[index].y;
        xMid = (coords[0] + coords[2]) / 2 - relText.getBBox().width;
        yMid = (coords[1] + coords[3]) / 2 - 5;
        ********/
        initCoords = lineToAdjust.data('initCoords');
        coords[2] = initCoords[2] + dx;
        coords[3] = initCoords[3] + dy;
        console.log(coords);
        console.log(coords);
        path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "L", coords[2].toFixed(3), coords[3].toFixed(3)].join(",");
        //console.log(path);

        lineToAdjust.attr({path: path}).data("coords", coords);
    }

    /*******
    if(obj1 == theNode || obj2 == theNode)
        relText.attr({x: xMid, y: yMid});
    *******/

    var predLines = this.assocPredLine;
    for(i =0; i < predLines.length; ++i){
        var predLine = predLines[i];
        var predSrc = predLine.data('parent');
        if(predSrc.dpfType == 'DpfAnnotation' )
            predSrc.moveAnnotation();
        else
            predSrc.movePredicate();
    }
}



function reattachDpfConnection(line, direction) {

    var obj1 = this.fromNode,
        obj2 = this.toNode,
        lineCoords = line.data('coords'),
        relText = this.d_text,
        obj,
        x, y;

        //console.log(lineCoords);

    if (direction == "source" && this.d_lines[0] == line) {
        obj = obj1;
        x = lineCoords[0];
        y = lineCoords[1];
    }
    else if (direction == "target" && this.d_lines[this.d_lines.length - 1] == line) {
        obj = obj2;
        x = lineCoords[2];
        y = lineCoords[3];
    }
    else {
        return;
    }

    var bb = obj.d_node.getBBox(),
        p = [{x: bb.x + bb.width / 2, y: bb.y - 1},
            {x: bb.x + bb.width / 2, y: bb.y + bb.height + 1},
            {x: bb.x - 1, y: bb.y - 1},
            {x: bb.x - 1, y: bb.y + bb.height / 2},
            {x: bb.x - 1, y: bb.y + bb.height + 1},
            {x: bb.x + bb.width + 1, y: bb.y - 1},
            {x: bb.x + bb.width + 1, y: bb.y + bb.height / 2},
            {x: bb.x + bb.width + 1, y: bb.y + bb.height + 1}],
        index = 0;
    var dx = Math.abs(p[0].x - x),
        dy = Math.abs(p[0].y - y),
        mindis = (dx + dy);

    for (var i = 1; i < 8; i++) {
        dx = Math.abs(p[i].x - x);
        dy = Math.abs(p[i].y - y);
        if ((dx + dy) < mindis) {
            index = i;
            mindis = (dx + dy);
        }
    }

    //console.log(p);
    //console.log('index: ' + index);
    if (direction == "source") {
        lineCoords[0] = p[index].x;
        lineCoords[1] = p[index].y;
    }
    else {
        lineCoords[2] = p[index].x;
        lineCoords[3] = p[index].y;
    }

    //console.log(lineCoords);
    var xMid = (lineCoords[0] + lineCoords[2]) / 2 - relText.getBBox().width,
        yMid = (lineCoords[1] + lineCoords[3]) / 2 - 5;

    var path = ["M", (lineCoords[0]).toFixed(3), (lineCoords[1]).toFixed(3), "L", (lineCoords[2]).toFixed(3), (lineCoords[3]).toFixed(3)].join(",");


    line.attr({path: path});
    line.data('coords', lineCoords);

    ///////// relText.attr({x: (xMid), y: (yMid)});
    relText.attr({"font-size": 13});

    if(this.typing)
        this.typing.moveTypingForConnection();

    var instances = this.instances;
    for (j = 0; j < instances.length ; j++) {
        instances[j].moveTypingForConnection();
    }

    var predLines = this.assocPredLine;
    for(i =0; i < predLines.length; ++i){
        var predLine = predLines[i];
        var predSrc = predLine.data('parent');
        if(predSrc.dpfType == 'DpfAnnotation' )
            predSrc.moveAnnotation();
        else
            predSrc.movePredicate();
    }

}


function editDpfConnection(fieldNameId, selected_type_arrow, selected_node_src, selected_node_trg){

    var edgeName = document.getElementById(fieldNameId).value;
    if(!edgeName  || !selected_node_src || !selected_node_trg)
        return;
    if(selected_node_src.spec.level == 2 || selected_node_src.spec.level == 0){
        // typing is not required
    }
    else {
        if(!selected_type_arrow)
            return;

        var updateRequired = false;
        // check if type has been changed....
        var oldType = this.typing.type;
        if (oldType && oldType != selected_type_arrow) {
            // remove this from oldTypes instances array
            var inst = oldType.instances;
            var newInst = [];
            for (var t = 0; t < inst.length; ++t) {
                if (inst[t] == this.typing)
                    continue;
                newInst.push(inst[t]);
            }
            oldType.instances = newInst;

            // add this into newTypes instances array
            this.typing.type = selected_type_arrow;
            selected_type_arrow.instances.push(this.typing);
            updateRequired = true;
        }
    }

    // check if source has been changed
    var oldSrc = this.fromNode;
    if(oldSrc != selected_node_src){

        var cn = oldSrc.conn;
        var newCn = [];
        var itemPopped = false;
        for(var c = 0; c < cn.length; ++c){
            if(!itemPopped && cn[c] == this) {
                itemPopped = true;
                continue;
            }
            newCn.push(cn[c]);
        }
        oldSrc.conn = newCn;

        this.fromNode = selected_node_src;
        selected_node_src.conn.push(this);
        updateRequired = true;
    }

    // check if target has been changed
    var oldTrg = this.toNode;
    if(oldTrg != selected_node_trg){
        conn = oldTrg.conn;
        newConn = [];
        itemPopped = false;
        for(t = 0; t < conn.length; ++t){
            if(!itemPopped && conn[t] == this) {
                itemPopped = true;
                continue;
            }
            newConn.push(conn[t]);
        }
        oldTrg.conn = newConn;


        this.toNode = selected_node_trg;
        selected_node_trg.conn.push(this);
        updateRequired = true;
    }

    // check if edge text has been changed
    if(edgeName != this.name){
        this.d_text.attr('text', edgeName);
        this.name = edgeName;
    }

    if(updateRequired) {
        this.reattachDpfConnection( this.d_lines[0], "source");
        this.reattachDpfConnection( this.d_lines[this.d_lines.length-1], "target");

        if(this.typing)
            this.typing.moveTypingForConnection();
    }

    paper.safari();
}