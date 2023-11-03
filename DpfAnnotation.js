/**
 * Created by rabbi on 1/30/15.
 */



function DpfAnnotation(predicate, parentRule, annotId) {
    this.dpfType = 'DpfAnnotation';
    if(annotId ) {
        this.ID = annotId;
        if(annotId >= maxDpfAnnotId)
            maxDpfAnnotId = annotId + 1;
    }
    else
        this.ID = maxDpfAnnotId++;

    this.predicate = predicate;
    this.attachedModelNodes = []; // [ {srcNode: null, trgNode: null} ];
    this.attachedModelConns = []; // [ {srcConn: null, trgConn: null} ];
    this.attachedModelNodeIds = []; // [ {srcNode: null, trgNode: null} ];
    this.attachedModelConnIds = []; // [ {srcConn: null, trgConn: null} ];
    this.conn = [];
    this.nodes = [];
    this.lineCoords = [];
    this.d_textCoords = [];
    this.d_nacLine = null;

    this.parameterText = "";
    this.parameters = [];
    this.outputName = predicate.name;
    this.parentRule = parentRule;

    this.d_text = null;
    this.d_lines = [];
    this.addTag = false;
    this.delTag = false;
    this.nacTag = false;

    parentRule.annotations.push(this);

    this.drawAnnotationFromCoords = drawAnnotationFromCoords;
}



DpfAnnotation.prototype.setNACTagToAnnotation = function(){
    // draw a strikethrough
    var bb = this.d_text.getBBox(),
        coords = [ bb.x + 4, bb.y + bb.height, bb.x + bb.width -4, bb.y ];

    var path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");
    var line = paper.path(path).attr({
        stroke: "#dbc",
        fill: "none",
        "stroke-width": 2
    }).data('coords', coords).data('origCoords', []).data('parent', this);
    line.attr({path: path});

    this.d_nacLine = line;
    this.nacTag = true;
};

DpfAnnotation.prototype.setAddTagToAnnotation = function(){
  this.d_text.attr({fill: '#00BB00'});
  this.addTag = true;
  this.delTag = false;
};

DpfAnnotation.prototype.setDelTagToAnnotation = function(){
    this.d_text.attr({fill: '#BB0000'});
    this.addTag = false;
    this.delTag = true;
};

DpfAnnotation.prototype.removeAnnotationFromPaper = function(){
    for(var i = 0; i < this.d_lines.length; ++i){
        this.d_lines[i].remove();
    }
    this.d_lines = [];
    this.d_text.remove();
    this.addTag = false;
    this.delTag = false;
    this.nacTag = false;
    if(this.d_nacLine != null)
        this.d_nacLine.remove();
};

DpfAnnotation.prototype.processOutputName = function(){
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

DpfAnnotation.prototype.processParameter = function(paramText){
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


DpfAnnotation.prototype.deleteAnnotationOnly = function(){
    var ruleAnnotList = [];
    for(i = 0; i < this.parentRule.annotations.length; ++i){
        if(this.parentRule.annotations[i] != this)
            ruleAnnotList.push(this.parentRule.annotations[i]);
    }
    this.parentRule.annotations = ruleAnnotList;
};

DpfAnnotation.prototype.hide = function(){
    console.log(this.d_text.is_visible());
    if(!this.d_text.is_visible())
        return;

    this.d_text.hide();


    for(var i = 0; i < this.d_lines.length; ++i){
        this.d_lines[i].hide();
    }
    if(this.d_nacLine != null)
        this.d_nacLine.hide();
};


DpfAnnotation.prototype.show = function(){
    var dispFlag = true;
    for(var i = 0; i < this.d_lines.length; ++i){
        var assocConn = this.d_lines[i].data('assocConn');
        if(assocConn != null){
            if(assocConn.displayFlag != 0) {
                dispFlag = false;
                break;
            }
        }
        else{
            var assocNode = this.d_lines[i].data('assocNode');
            if(assocNode.displayFlag != 0) {
                dispFlag = false;
                break;
            }
        }
    }

    if(dispFlag){
        for(i = 0; i < this.d_lines.length; ++i){
            this.d_lines[i].show();
        }
        this.d_text.show();
        if(this.d_nacLine != null)
            this.d_nacLine.show();
    }

};

DpfAnnotation.prototype.deleteAnnotation = function(){
    for(var i = 0; i < this.d_lines.length; ++i){
        var assocConn = this.d_lines[i].data('assocConn');
        if(assocConn != null) {
            var assocAnnotLine = assocConn.assocPredLine;
            var newList = [];
            var newAnnotList = [];

            for (var j = 0; j < assocAnnotLine.length; ++j) {
                if (assocAnnotLine[j] != this.d_lines[i])
                    newList.push(assocAnnotLine[j]);
                newAnnotList.push(assocConn.assocPredConst[j]);
            }
            assocConn.assocPredLine = newList;
            assocConn.assocPredConst = newAnnotList;
        }
        else{
            var assocNode = this.d_lines[i].data('assocNode');
            assocAnnotLine = assocNode.assocPredLine;
            newList = [];
            newAnnotList = [];

            for (j = 0; j < assocAnnotLine.length; ++j) {
                if (assocAnnotLine[j] != this.d_lines[i])
                    newList.push(assocAnnotLine[j]);
                newAnnotList.push(assocNode.assocPredConst[j]);
            }
            assocNode.assocPredLine = newList;
            assocNode.assocPredConst = newAnnotList;
        }

        this.d_lines[i].remove();
    }

    if(this.d_nacLine != null)
        this.d_nacLine.remove();

    this.d_text.remove();

    var theParentRule = this.parentRule;
    var ruleAnnotList = [];
    for(i = 0; i < theParentRule.annotations.length; ++i){
        if(theParentRule.annotations[i] != this)
        ruleAnnotList.push(theParentRule.annotations[i]);
    }
    theParentRule.annotations = ruleAnnotList;

    ruleAnnotList = [];
    for(i = 0; i < theParentRule.elements_to_add.length; ++i){
        if(theParentRule.elements_to_add[i] != this)
            ruleAnnotList.push(theParentRule.elements_to_add[i]);
    }
    theParentRule.elements_to_add = ruleAnnotList;

    ruleAnnotList = [];
    for(i = 0; i < theParentRule.elements_in_nac.length; ++i){
        if(theParentRule.elements_in_nac[i] != this)
            ruleAnnotList.push(theParentRule.elements_in_nac[i]);
    }
    theParentRule.elements_in_nac = ruleAnnotList;

    ruleAnnotList = [];
    for(i = 0; i < theParentRule.elements_to_delete.length; ++i){
        if(theParentRule.elements_to_delete[i] != this)
            ruleAnnotList.push(theParentRule.elements_to_delete[i]);
    }
    theParentRule.elements_to_delete = ruleAnnotList;
};

var parseDpfAnnotation = function(annotXml, parentRule){
    console.log(annotXml);
    var d_textCoords = [];
    var annotId = parseInt( annotXml.getElementsByTagName("ID")[0].childNodes[0].nodeValue);
    var predId = parseInt( annotXml.getElementsByTagName("predicate")[0].childNodes[0].nodeValue);
    var parameterText = annotXml.getElementsByTagName("parameterText")[0].childNodes[0].nodeValue;
    var outputName = annotXml.getElementsByTagName("outputName")[0].childNodes[0].nodeValue;
    var thePredicate = findDpfPredicateById(predId);

    var theAnnotation = new DpfAnnotation(thePredicate, parentRule, annotId);
    theAnnotation.processParameter(parameterText);
    theAnnotation.outputName = outputName;

    var dTextXml = annotXml.getElementsByTagName("d_text");
    coordsVals = dTextXml[0].childNodes[0].nodeValue.split(",");

    d_textCoords.push( parseFloat(coordsVals[0]));
    d_textCoords.push( parseFloat(coordsVals[1]));

    var lineCoords = [];
    var assocConns = [];
    var assocNodes = [];

    var d_lineXml = annotXml.getElementsByTagName("d_lines");
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
            var assocId = parseInt(coordsVals[coordsVals.length - 2]);
            var assocType = parseInt(coordsVals[coordsVals.length - 1]);
            if(assocType == 0)
                assocConns.push(findDpfConnectionById(assocId));
            else
                assocNodes.push(findDpfNodeById(assocId));

            lineCoords.push(coords);
        }
    }


    var attachedModelNodeXmls = annotXml.getElementsByTagName("attachedModelNode");
    for(i = 0; i < attachedModelNodeXmls.length; ++ i){
        var srcNodeXml = attachedModelNodeXmls[i].getElementsByTagName("srcNode");
        var srcNodeId = parseInt( srcNodeXml[0].childNodes[0].nodeValue );
        //var dpfSrcNode = findDpfNodeById(srcNodeId);

        var trgNodeXml = attachedModelNodeXmls[i].getElementsByTagName("trgNode");
        var trgNodeId = parseInt( trgNodeXml[0].childNodes[0].nodeValue );
        //var dpfTrgNode = findDpfNodeById(trgNodeId);
        //theAnnotation.attachedModelNodes.push({'srcNode': dpfSrcNode, 'trgNode': dpfTrgNode});
        theAnnotation.attachedModelNodeIds.push({'srcNode': srcNodeId, 'trgNode': trgNodeId});
    }

    var attachedModelConnXmls = annotXml.getElementsByTagName("attachedModelConn");
    for(i = 0; i < attachedModelConnXmls.length; ++ i){
        var srcConnXml = attachedModelConnXmls[i].getElementsByTagName("srcConn");
        var srcConnId = parseInt( srcConnXml[0].childNodes[0].nodeValue );
        //var dpfSrcConn = findDpfConnectionById(srcConnId);

        var trgConnXml = attachedModelConnXmls[i].getElementsByTagName("trgConn");
        var trgConnId = parseInt( trgConnXml[0].childNodes[0].nodeValue );
        //var dpfTrgConn = findDpfConnectionById(trgConnId);
        //theAnnotation.attachedModelConns.push({'srcConn': dpfSrcConn, 'trgConn': dpfTrgConn});
        //theAnnotation.conn.push( dpfTrgConn );
        theAnnotation.attachedModelConnIds.push({'srcConn': srcConnId, 'trgConn': trgConnId});
    }

    theAnnotation.drawAnnotationFromCoords(lineCoords, assocConns, d_textCoords, assocNodes);
};


DpfAnnotation.prototype.setupAttachedModelElements = function(){
    var i, att;
    for(i = 0; i < this.attachedModelNodeIds.length; ++i) {
        att = this.attachedModelNodeIds[i];
        var dpfSrcNode = findDpfNodeById(att.srcNode);
        var dpfTrgNode = findDpfNodeById(att.trgNode);
        this.attachedModelNodes.push({'srcNode': dpfSrcNode, 'trgNode': dpfTrgNode});
        this.nodes.push(dpfTrgNode);
    }
    for(i = 0; i < this.attachedModelConnIds.length; ++i) {
        att = this.attachedModelConnIds[i];
        var dpfSrcConn = findDpfNodeById(att.srcConn);
        var dpfTrgConn = findDpfNodeById(att.trgConn);
        this.attachedModelConns.push({'srcConn': dpfSrcConn, 'trgConn': dpfTrgConn});
        this.conn.push( dpfTrgConn );
    }
};

function getDpfAnnotationXml(annot, indentStr0){
    var coords;
    var xmlText = "\n" + indentStr0 + "<DpfAnnotation>";
    var indentStr = indentStr0 + "   ";

    xmlText += "\n" + indentStr + "<ID>" + annot.ID + "</ID>";
    xmlText += "\n" + indentStr + "<predicate>" + annot.predicate.predicateId + "</predicate>";
    xmlText += "\n" + indentStr + "<parameterText><![CDATA[" + annot.parameterText + "]]></parameterText>";
    xmlText += "\n" + indentStr + "<outputName><![CDATA[" + annot.outputName + "]]></outputName>";
    xmlText += "\n" + indentStr + "<d_text>" + annot.d_text.attr('x') + "," + annot.d_text.attr('y') + "</d_text>";

    xmlText += "\n" + indentStr + "<d_lines>";
    for(var l = 0; l < annot.d_lines.length; ++l){
        var line = annot.d_lines[l];
        xmlText += "\n" + indentStr + "   <line>";
        coords = line.data('coords');
        for(var j = 0; j < coords.length; ++j) {
            xmlText += coords[j];
            xmlText += ",";
        }
        // append connection id
        var assocConn = line.data('assocConn');
        if(assocConn != null) {
            xmlText += assocConn.ID;
            xmlText += ",0";
        }
        else {
            var assocNode = line.data('assocNode');
            xmlText += assocNode.ID;
            xmlText += ",1";

        }

        xmlText += "</line>";
    }
    xmlText += "\n" + indentStr + "</d_lines>";

    xmlText += "\n" + indentStr + "<attachedModelNodes>";
    console.log(annot.attachedModelNodes);
    for(l =0; l < annot.attachedModelNodes.length; ++l){
        var att = annot.attachedModelNodes[l];
        console.log(att);
        xmlText += "\n" + indentStr + "    <attachedModelNode>";
        xmlText += "\n" + indentStr + "         <srcNode>" + att.srcNode.ID + "</srcNode>";
        xmlText += "\n" + indentStr + "         <trgNode>" + att.trgNode.ID + "</trgNode>";
        xmlText += "\n" + indentStr + "    </attachedModelNode>";
    }
    xmlText += "\n" + indentStr + "</attachedModelNodes>";

    xmlText += "\n" + indentStr + "<attachedModelConns>";
    for(l =0; l < annot.attachedModelConns.length; ++l){
        att = annot.attachedModelConns[l];
        xmlText += "\n" + indentStr + "    <attachedModelConn>";
        xmlText += "\n" + indentStr + "         <srcConn>" + att.srcConn.ID + "</srcConn>";
        xmlText += "\n" + indentStr + "         <trgConn>" + att.trgConn.ID + "</trgConn>";
        xmlText += "\n" + indentStr + "    </attachedModelConn>";
    }
    xmlText += "\n" + indentStr + "</attachedModelConns>";

    if(annot.d_nacLine){
        coords = annot.d_nacLine.data('coords');
        xmlText += "\n" + indentStr + "<d_nacLine>";
        for(var i = 0; i < coords.length; ++i) {
            xmlText += coords[i];
            if(i + 1 < coords.length)
                xmlText += ",";
        }
        xmlText +=  "</d_nacLine>";
    }

    xmlText += "\n" + indentStr + "</DpfAnnotation>";
    return xmlText;
}


function drawAnnotationFromCoords(lineCoords, assocConns, d_textCoords, assocNodes){
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

        if(assocConns != null && assocConns.length > 0) {
            line.data('assocConn', assocConns[i]);
            assocConns[i].assocPredLine.push(line);
        }
        else {
            line.data('assocNode', assocNodes[i]);
            assocNodes[i].assocPredLine.push(line);
        }

        this.d_lines.push(line);

    }

    this.d_text = paper.text(d_textCoords[0], d_textCoords[1], this.outputName).attr({"text-anchor": "start", fill: '#666666', "font-size": 12}).data("parent", this);
    this.d_text.mousemove(changeDpfPredTextCursor);
    this.d_text.drag(dragDpfPredTextMove, dragDpfPredTextStart, dragDpfPredTextEnd);
}


DpfAnnotation.prototype.addAnnotations = function(attachedModelNodes, attachedModelConns){
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
};

DpfAnnotation.prototype.drawAnnotation = function(){
    this.d_text = paper.text(0, 0, this.outputName).attr({"text-anchor": "start", fill: '#666666', "font-size": 13}).data("parent", this);

    var xPos = drawingPane[1].attr('x') + 50;
    var yPos = drawingPane[1].attr('y') + 50;

    this.d_text.attr({x: xPos, y: yPos });

    this.d_text.mousemove(changeDpfPredTextCursor);
    this.d_text.drag(dragDpfPredTextMove, dragDpfPredTextStart, dragDpfPredTextEnd);
    this.addDpfConnectionToAnnotation();
};



DpfAnnotation.prototype.addDpfConnectionToAnnotation = function() {
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


DpfAnnotation.prototype.moveAnnotation = function() {
    //console.log('inside DpfPredicateConstraint.movePredicateConstraint()..');
    var predText = this.d_text;
    var bb, coords;

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
            bb = dpfElement.d_node.getBBox();
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


        if(this.d_nacLine != null){
            bb = this.d_text.getBBox();
            coords = [bb.x + 4, bb.y + bb.height, bb.x + bb.width - 4, bb.y];

            var path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");
            this.d_nacLine.attr({path: path});
        }
    }
};

