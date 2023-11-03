/**
 * Created by rabbi on 1/30/15.
 */



function DpfPredicateConstraint(predicate, specification, constraintId) {
    this.dpfType = 'DpfPredicateConstraint';
    if(constraintId ) {
        this.ID = constraintId;
        if(constraintId >= maxDpfConstId)
            maxDpfConstId = constraintId + 1;
    }
    else
        this.ID = maxDpfConstId++;

    this.predicate = predicate;
    this.attachedModelNodes = []; // [ {srcNode: null, trgNode: null} ];
    this.attachedModelConns = []; // [ {srcConn: null, trgConn: null} ];
    this.conn = [];
    this.nodes = [];
    this.lineCoords = [];
    this.d_textCoords = [];


    this.parameterText = "";
    this.parameters = [];
    this.outputName = predicate.name;
    this.spec = specification;

    this.d_text = null;
    this.d_lines = [];

    this.refToOriginal = null;

    specification.predicateConstraints.push(this);
    this.addConstraint = addConstraint;
    this.drawConstraint = drawConstraint;
    this.addDpfConnectionToPredicateConstraint = addDpfConnectionToPredicateConstraint;
    this.movePredicate = movePredicateConstraint;
    this.drawPredicateConstFromCoords = drawPredicateConstFromCoords;
    this.deletePredicateConstraint = deletePredicateConstraint;
}


DpfPredicateConstraint.prototype.copyConstraintCoordinates = function(){
    if(this.refToOriginal == null)
        return;
    for(var l = 0; l < this.refToOriginal.d_lines.length; ++l) {
        var line = this.refToOriginal.d_lines[l];

        var coords = line.data('coords');
        var coords_copy = [];
        for (var j = 0; j < coords.length; ++j) {
            coords_copy.push(coords[j]);
        }
        this.lineCoords.push(coords_copy);
    }
    this.d_textCoords.push(this.refToOriginal.d_text.attr('x'));
    this.d_textCoords.push(this.refToOriginal.d_text.attr('y'));
};

DpfPredicateConstraint.prototype.copyConstraint = function(copySpec, copyRef){
    var predConst = new DpfPredicateConstraint(this.predicate, copySpec, this.ID);
    for(var i = 0; i < this.attachedModelNodes.length; ++i){
        var theAttachedModelNode = this.attachedModelNodes[i];
        var newTrgNode = findDpfNodeByIdFromCopyNodes( theAttachedModelNode.trgNode.ID);
        predConst.attachedModelNodes.push({srcNode: theAttachedModelNode.srcNode, trgNode: newTrgNode});
        if(theAttachedModelNode.trgNode.assocPredLine != null )
            predConst.nodes.push(newTrgNode);
    }
    for(i = 0; i < this.attachedModelConns.length; ++i){
        var theAttachedModelConn = this.attachedModelConns[i];
        var theTrgConn = findDpfConnectionByIdFromCopyConns( theAttachedModelConn.trgConn.ID);
        predConst.attachedModelConns.push({srcConn: theAttachedModelConn.srcConn, trgConn: theTrgConn});
        predConst.conn.push(theTrgConn);
    }

    predConst.outputName = this.outputName;
    //predConst.parameterText = this.parameterText;
    /*for(var p = 0; p < this.parameters.length; ++p)
        predConst.parameters.push( this.parameters[p]);*/
    predConst.processParameter(this.parameterText);
    if(copyRef)
        predConst.refToOriginal = this;
    else
        predConst.refToOriginal = this.refToOriginal;

};

DpfPredicateConstraint.prototype.removeConstraintFromPaper = function(){
    for(var i = 0; i < this.d_lines.length; ++i){
        this.d_lines[i].remove();
    }
    this.d_lines = [];
    this.d_text.remove();
};

DpfPredicateConstraint.prototype.processOutputName = function(){
    var theStr = this.predicate.displayName;
    var keys = this.parameters.keys();

    for(var i = 0; i < this.parameters.size; ++i){
        var paramName = keys.next().value;
        var paramVal  = this.parameters.get(paramName);
        var searchTag = '{' + paramName + '}';
        console.log(searchTag);
        theStr = theStr.replace(searchTag, paramVal);
    }
    console.log(theStr);
    this.outputName = theStr;

    this.d_text.attr('text', this.outputName);
};

DpfPredicateConstraint.prototype.processParameter = function(paramText){
    if(paramText == ""){
        this.parameterText = "";
        this.parameters = [];
        return;
    }
    var newParameters = new Map();
    console.log(paramText);
    var params = paramText.split(';');
    for(var i = 0; i < params.length; ++i){
        var values = params[i].split(':');
        //console.log(values);
        if(values.length < 2)
            throw "Parameter format is not correct. Expected format is \"name1:value1;name2:value2\"";

        var paramName = values[0];
        var defaultVal = values[1];
        newParameters.set(paramName, defaultVal);
    }
    this.parameterText = paramText;
    this.parameters = newParameters;
};


DpfPredicateConstraint.prototype.deletePredicateConstraintOnly = function(){

    var specPredList = [];
    for(i = 0; i < this.spec.predicateConstraints.length; ++i){
        if(this.spec.predicateConstraints[i] != this)
            specPredList.push(this.spec.predicateConstraints[i]);
    }
    this.spec.predicateConstraints = specPredList;
};

DpfPredicateConstraint.prototype.hide = function(){
    console.log(this.d_text.is_visible());
    if(!this.d_text.is_visible())
        return;

    this.d_text.hide();


    for(var i = 0; i < this.d_lines.length; ++i){
        this.d_lines[i].hide();
    }

};

DpfPredicateConstraint.prototype.temporaryshow = function(){
    var dispFlag = true;
    for(var i = 0; i < this.d_lines.length; ++i){
        var assocConn = this.d_lines[i].data('assocConn');
        if(assocConn.displayFlag == 2){
            dispFlag = false; break;
        }
    }

    if(dispFlag){
        for(i = 0; i < this.d_lines.length; ++i){
            this.d_lines[i].show();
        }
        this.d_text.show();
    }
};

DpfPredicateConstraint.prototype.show = function(){
    var dispFlag = true;
    for(var i = 0; i < this.d_lines.length; ++i){
        var assocConn = this.d_lines[i].data('assocConn');
        if(assocConn.displayFlag != 0){
            dispFlag = false; break;
        }
    }

    if(dispFlag){
        for(i = 0; i < this.d_lines.length; ++i){
            this.d_lines[i].show();
        }
        this.d_text.show();
    }
};

function deletePredicateConstraint(){
    for(var i = 0; i < this.d_lines.length; ++i){
        var assocConn = this.d_lines[i].data('assocConn');
        if(assocConn != null) {
            var assocPredLine = assocConn.assocPredLine;
            var newList = [];
            var newPredConstList = [];

            for (var j = 0; j < assocPredLine.length; ++j) {
                if (assocPredLine[j] != this.d_lines[i])
                    newList.push(assocPredLine[j]);
                newPredConstList.push(assocConn.assocPredConst[j]);
            }
            assocConn.assocPredLine = newList;
            assocConn.assocPredConst = newPredConstList;
        }
        else{
            var assocNode = this.d_lines[i].data('assocNode');
            assocPredLine = assocNode.assocPredLine;
            newList = [];
            newPredConstList = [];

            for (j = 0; j < assocPredLine.length; ++j) {
                if (assocPredLine[j] != this.d_lines[i])
                    newList.push(assocPredLine[j]);
                newPredConstList.push(assocNode.assocPredConst[j]);
            }
            assocNode.assocPredLine = newList;
            assocNode.assocPredConst = newPredConstList;
        }

        this.d_lines[i].remove();
    }
    this.d_text.remove();

    var specPredList = [];
    for(i = 0; i < this.spec.predicateConstraints.length; ++i){
        if(this.spec.predicateConstraints[i] != this)
        specPredList.push(this.spec.predicateConstraints[i]);
    }
    this.spec.predicateConstraints = specPredList;
}

var parseDpfPredicateConstraint = function(predConstXml, spec){
    //console.log(predConstXml);
    var d_textCoords = [];
    var predId = parseInt( predConstXml.getElementsByTagName("predicate")[0].childNodes[0].nodeValue);
    var parameterText = predConstXml.getElementsByTagName("parameterText")[0].childNodes[0].nodeValue;
    var outputName = predConstXml.getElementsByTagName("outputName")[0].childNodes[0].nodeValue;
    var thePred = findDpfPredicateById(predId);
    var thePredConst = new DpfPredicateConstraint(thePred, spec);
    thePredConst.processParameter(parameterText);
    thePredConst.outputName = outputName;

    var dTextXml = predConstXml.getElementsByTagName("d_text");
    coordsVals = dTextXml[0].childNodes[0].nodeValue.split(",");

    d_textCoords.push( parseFloat(coordsVals[0]));
    d_textCoords.push( parseFloat(coordsVals[1]));

    var lineCoords = [];
    var assocConns = [];
    var assocNodes = [];

    var d_lineXml = predConstXml.getElementsByTagName("d_lines");
    if(d_lineXml[0]) {
        var lineXml = d_lineXml[0].getElementsByTagName("line");
        for (var i = 0; i < lineXml.length; ++i) {
            var coordsXml = lineXml[i].childNodes[0].nodeValue;
            var coordsVals = coordsXml.split(",");
            var coords = [];
            for (var j = 0; j < coordsVals.length - 2; ++j) {
                coords.push(parseFloat(coordsVals[j]));
            }
            //console.log('coordsVals: ' + coordsVals);
            //console.log('cords:' + coords);
            var assocConnId = parseInt(coordsVals[coordsVals.length - 2]);
            var assocType = parseInt(coordsVals[coordsVals.length - 1]);
            if(assocType == 0) {
                var connectedConn = findDpfConnectionById(assocConnId);
                if(connectedConn == null)
                    throw "Connection with ID " + assocConnId + " not found";
                assocConns.push(connectedConn);
            }
            else {
                var connectedNode = findDpfNodeById(assocConnId);
                if(connectedNode == null)
                    throw "Node with ID " + assocConnId + " not found";
                assocNodes.push(connectedNode);
            }

            lineCoords.push(coords);
        }
    }


    var attachedModelNodeXmls = predConstXml.getElementsByTagName("attachedModelNode");
    for(i = 0; i < attachedModelNodeXmls.length; ++ i){
        var srcNodeXml = attachedModelNodeXmls[i].getElementsByTagName("srcNode");
        var srcNodeId = parseInt( srcNodeXml[0].childNodes[0].nodeValue );
        var dpfSrcNode = findDpfNodeById(srcNodeId);

        var trgNodeXml = attachedModelNodeXmls[i].getElementsByTagName("trgNode");
        var trgNodeId = parseInt( trgNodeXml[0].childNodes[0].nodeValue );
        var dpfTrgNode = findDpfNodeById(trgNodeId);
        thePredConst.attachedModelNodes.push({'srcNode': dpfSrcNode, 'trgNode': dpfTrgNode});
    }

    var attachedModelConnXmls = predConstXml.getElementsByTagName("attachedModelConn");
    for(i = 0; i < attachedModelConnXmls.length; ++ i){
        var srcConnXml = attachedModelConnXmls[i].getElementsByTagName("srcConn");
        var srcConnId = parseInt( srcConnXml[0].childNodes[0].nodeValue );
        var dpfSrcConn = findDpfConnectionById(srcConnId);

        var trgConnXml = attachedModelConnXmls[i].getElementsByTagName("trgConn");
        var trgConnId = parseInt( trgConnXml[0].childNodes[0].nodeValue );
        var dpfTrgConn = findDpfConnectionById(trgConnId);
        thePredConst.attachedModelConns.push({'srcConn': dpfSrcConn, 'trgConn': dpfTrgConn});
        thePredConst.conn.push( dpfTrgConn );
    }
    thePredConst.drawPredicateConstFromCoords(lineCoords, assocConns, d_textCoords, assocNodes);

};

var getDpfPredicateConstraintXml = function(predConst, indentStr0){
    var xmlText = "\n" + indentStr0 + "<DpfPredicateConstraint>";
    var indentStr = indentStr0 + "   ";

    xmlText += "\n" + indentStr + "<predicate>" + predConst.predicate.predicateId + "</predicate>";
    xmlText += "\n" + indentStr + "<parameterText><![CDATA[" + predConst.parameterText + "]]></parameterText>";
    xmlText += "\n" + indentStr + "<outputName><![CDATA[" + predConst.outputName + "]]></outputName>";
    xmlText += "\n" + indentStr + "<d_text>" + predConst.d_text.attr('x') + "," + predConst.d_text.attr('y') + "</d_text>";

    xmlText += "\n" + indentStr + "<d_lines>";
    for(var l = 0; l < predConst.d_lines.length; ++l){
        var line = predConst.d_lines[l];
        console.log(line);
        xmlText += "\n" + indentStr + "   <line>";
        var coords = line.data('coords');
        for(var j = 0; j < coords.length; ++j) {
            xmlText += coords[j];
            xmlText += ",";
        }
        // append connection id
        var assocConn = line.data("assocConn");
        console.log(assocConn);
        if(assocConn != null ) {
            console.log("Inside if block..");
            xmlText += assocConn.ID;
            xmlText += ",0";
        }
        else {
            console.log("Inside else block..");
            console.log(line.data("assocNode"));
            xmlText += line.data("assocNode").ID;
            xmlText += ",1";
        }
        xmlText += "</line>";
    }
    xmlText += "\n" + indentStr + "</d_lines>";

    xmlText += "\n" + indentStr + "<attachedModelNodes>";
    for(l =0; l < predConst.attachedModelNodes.length; ++l){
        var att = predConst.attachedModelNodes[l];
        xmlText += "\n" + indentStr + "    <attachedModelNode>";
        xmlText += "\n" + indentStr + "         <srcNode>" + att.srcNode.ID + "</srcNode>";
        xmlText += "\n" + indentStr + "         <trgNode>" + att.trgNode.ID + "</trgNode>";
        xmlText += "\n" + indentStr + "    </attachedModelNode>";
    }
    xmlText += "\n" + indentStr + "</attachedModelNodes>";

    xmlText += "\n" + indentStr + "<attachedModelConns>";
    for(l =0; l < predConst.attachedModelConns.length; ++l){
        att = predConst.attachedModelConns[l];
        xmlText += "\n" + indentStr + "    <attachedModelConn>";
        xmlText += "\n" + indentStr + "         <srcConn>" + att.srcConn.ID + "</srcConn>";
        xmlText += "\n" + indentStr + "         <trgConn>" + att.trgConn.ID + "</trgConn>";
        xmlText += "\n" + indentStr + "    </attachedModelConn>";
    }
    xmlText += "\n" + indentStr + "</attachedModelConns>";


    xmlText += "\n" + indentStr + "</DpfPredicateConstraint>";
    return xmlText;
};


function drawPredicateConstFromCoords(lineCoords, assocConns, d_textCoords, assocNodes){
    var coords = [];
    for(var i = 0; i < lineCoords.length; ++i){
        coords = lineCoords[i];
        console.log(coords);
        var path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "L", coords[2].toFixed(3), coords[3].toFixed(3)].join(",");

        var line = paper.path(path).attr({
            stroke: "#666",// "#fdb",
            "stroke-width": 2,
            fill: "none",
            "arrow-start": "oval-narrow-midium",
            "arrow-end": "oval-narrow-midium"
        }).data("parent", this).data('coords', coords).data('origCoords', []);

        if(assocConns == null || assocConns.length == 0) {
            if(assocNodes[i] == null)
                throw "Associated node is null";
            line = line.data("assocNode", assocNodes[i]); //assocNode
            assocNodes[i].assocPredLine.push(line);
        }
        else {
            if(assocConns[i] == null)
                throw "Associated connection is null";

            line = line.data("assocConn", assocConns[i]);
            assocConns[i].assocPredLine.push(line);
        }

        this.d_lines.push(line);


    }

    this.d_text = paper.text(d_textCoords[0], d_textCoords[1], this.outputName).attr({"text-anchor": "start", fill: '#666666', "font-size": 12}).data("parent", this);

    this.d_text.mousemove(changeDpfPredTextCursor);
    this.d_text.drag(dragDpfPredTextMove, dragDpfPredTextStart, dragDpfPredTextEnd);
}


function addConstraint(attachedModelNodes, attachedModelConns){
    this.attachedModelNodes = attachedModelNodes;
    this.attachedModelConns = attachedModelConns;
    for(var c = 0; c < attachedModelNodes.length; ++c){
        if(attachedModelNodes[c].srcNode.assocPredLine.length > 0 )
            this.nodes.push(attachedModelNodes[c].trgNode);
    }
    for(c = 0; c < attachedModelConns.length; ++c){
        if(attachedModelConns[c].srcConn.assocPredLine.length > 0 )
            this.conn.push(attachedModelConns[c].trgConn);
    }
}

function drawConstraint(){
    this.d_text = paper.text(0, 0, this.outputName).attr({"text-anchor": "start", fill: '#666666', "font-size": 13}).data("parent", this);

    var xPos = drawingPane[1].attr('x') + 50;
    var yPos = drawingPane[1].attr('y') + 50;

    this.d_text.attr({x: xPos, y: yPos });

    this.d_text.mousemove(changeDpfPredTextCursor);
    this.d_text.drag(dragDpfPredTextMove, dragDpfPredTextStart, dragDpfPredTextEnd);
    this.addDpfConnectionToPredicateConstraint();
}



function addDpfConnectionToPredicateConstraint() {
    var predX1 = 0, predX2 = 0;
    var predY1 = 0, predY2 = 0;
    var coords1, coords2, nodeCoords;
    var bb1, p, fx, fy, mindx, mindy, i, dx, dy, path1, line1, bb;

    if(this.conn.length == 0 && this.nodes.length == 0)
        return;
    else if(this.conn.length == 1){
        coords1 = this.conn[0].d_lines[0].data('coords');

        predX1 = (coords1[0] + coords1[2] ) / 2;
        predY1 = (coords1[1] + coords1[3] ) / 2;
    }
    else if(this.conn.length > 1){
        coords1 = this.conn[0].d_lines[0].data('coords');

        predX1 = (coords1[0] + coords1[2] ) / 2;
        predY1 = (coords1[1] + coords1[3] ) / 2;

        for(var j = 1; j < this.conn.length; ++j){
            coords2 = this.conn[j].d_lines[0].data('coords');

            predX2 = (coords2[0] + coords2[2] ) / 2;
            predY2 = (coords2[1] + coords2[3] ) / 2;

            predX1 = (predX1 + predX2) / 2;
            predY1 = (predY1 + predY2) / 2;
        }
    }
    else{
        bb = this.nodes[0].d_node.getBBox();
        nodeCoords = [bb.x + (bb.width / 2), bb.y];
        predX1 = nodeCoords[0];
        predY1 = nodeCoords[1]-30;
    }

    predX1 += 15;
    predY1 += 15;

    var predText = this.d_text;
    predText.attr({x: predX1, y: predY1});

    if(this.conn.length > 0) {
        for (j = 0; j < this.conn.length; ++j) {
            coords1 = this.conn[j].d_lines[0].data('coords');

            predX1 = (coords1[0] + coords1[2] ) / 2;
            predY1 = (coords1[1] + coords1[3] ) / 2;

             bb1 = predText.getBBox();
             p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
                    {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
                    {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
                    {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2}];
             fx = p[0].x;
             fy = p[0].y;
             mindx = Math.abs(fx - predX1);
             mindy = Math.abs(fy - predY1);

            for (i = 1; i < 4; ++i) {
                    dx = Math.abs(p[i].x - predX1);
                    dy = Math.abs(p[i].y - predY1);

                if ((dx + dy) < (mindx + mindy)) {
                    fx = p[i].x;
                    fy = p[i].y;
                    mindx = Math.abs(fx - predX1);
                    mindy = Math.abs(fy - predY1);
                }
            }


            path1 = ["M", predX1, predY1, "L", fx, fy].join(",");
            line = paper.path(path1).attr({
                stroke: "#666",
                "stroke-width": 2,
                fill: "none",
                "arrow-start": "oval-narrow-midium",
                "arrow-end": "oval-narrow-midium"
            }).data("parent", this).data('coords', [predX1, predY1, fx, fy]).data('origCoords', []).data('assocConn', this.conn[j]);

            this.d_lines.push(line);
            this.conn[j].assocPredLine.push(line);
            this.conn[j].assocPredConst.push(this);
        }
    }
    else{
        for (j = 0; j < this.nodes.length; ++j) {
            bb = this.nodes[j].d_node.getBBox();
            nodeCoords = [bb.x + (bb.width / 2), bb.y];
            predX1 = nodeCoords[0];
            predY1 = nodeCoords[1];

            bb1 = predText.getBBox();
            p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
                {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
                {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
                {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2}];
            fx = p[0].x;
            fy = p[0].y;
            mindx = Math.abs(fx - predX1);
            mindy = Math.abs(fy - predY1);

            for (i = 1; i < 4; ++i) {
                dx = Math.abs(p[i].x - predX1);
                dy = Math.abs(p[i].y - predY1);

                if ((dx + dy) < (mindx + mindy)) {
                    fx = p[i].x;
                    fy = p[i].y;
                    mindx = Math.abs(fx - predX1);
                    mindy = Math.abs(fy - predY1);
                }
            }


            path1 = ["M", predX1, predY1, "L", fx, fy].join(",");
            line = paper.path(path1).attr({
                stroke: "#666",
                "stroke-width": 2,
                fill: "none",
                "arrow-start": "oval-narrow-midium",
                "arrow-end": "oval-narrow-midium"
            }).data("parent", this).data('coords', [predX1, predY1, fx, fy]).data('origCoords', []).data('assocNode', this.nodes[j]);

            this.d_lines.push(line);
            this.nodes[j].assocPredLine.push(line);
            this.nodes[j].assocPredConst.push(this);
        }
    }
}


function movePredicateConstraint() {
    //console.log('inside DpfPredicateConstraint.movePredicateConstraint()..');
    var predText = this.d_text;

    var bb1 = predText.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
            {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
            {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
            {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2}],
        fx = p[0].x,
        fy = p[0].y,
        lx = p[3].x,
        ly = p[3].y;

    for(var l = 0; l < this.d_lines.length; ++l) {
        var aLine = this.d_lines[l];
        var dpfElement = aLine.data('assocConn');
        var x2, predX1, predY1;

        if(dpfElement != null && dpfElement.dpfType == 'DpfConnection') {
            x2 = dpfElement.d_lines[0].data('coords');

            predX1 = (x2[0] + x2[2] ) / 2;
            predY1 = (x2[1] + x2[3] ) / 2;
        }
        else{
            dpfElement = aLine.data('assocNode');
            var bb = dpfElement.d_node.getBBox();
            var nodeCoords = [bb.x + (bb.width / 2), bb.y];
            predX1 = nodeCoords[0];
            predY1 = nodeCoords[1];
        }

        var mindx = Math.abs(fx - predX1),
            mindy = Math.abs(fy - predY1);

        for (var i = 1; i < 4; ++i) {
            var dx = Math.abs(p[i].x - predX1),
                dy = Math.abs(p[i].y - predY1);

            if ((dx + dy) < (mindx + mindy)) {
                fx = p[i].x;
                fy = p[i].y;
                mindx = Math.abs(fx - predX1);
                mindy = Math.abs(fy - predY1);
            }
        }
        var path1 = ["M", predX1.toFixed(3), predY1.toFixed(3), "L", fx.toFixed(3), fy.toFixed(3)].join(",");


        aLine.attr({path: path1});
        aLine.data('coords', [predX1, predY1, fx, fy]);
    }
}

