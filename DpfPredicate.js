/**
 * Created by rabbi on 1/30/15.
 */

function DpfPredicate(predName, specification, predId) {
    this.dpfType = 'DpfPredicate';
    if(predId){
        this.predicateId = predId;
        if(predId >= maxPredicateId)
            maxPredicateId = predId + 1;
    }
    else
        this.predicateId = maxPredicateId++;

    this.name= predName;
    this.displayName = '[' + predName + ']';
    this.outputName  = this.displayName;
    this.parameterText = "";
    this.parameters = new Map(); // [{'n':0}, {'m':1} ]
    this.spec= specification;
    this.nodes= [];
    this.conn= [];
    this.attachedModelNodes = []; // [ {srcNode: null, trgNode: null} ];
    this.attachedModelConns = []; // [ {srcConn: null, trgConn: null} ];
    this.completionRules= [];
    this.productionRules= [];

    this.d_text = null;
    this.d_lines = [];


    this.className = "_Pred" + this.predicateId;
    this.predScript = "";
    this.validateScript = "\n" + this.className + ".prototype.validate = function(){\n //Implement the validate function \n \n\treturn []; // return all the elements that violated the constraint...                                                                                                              \n};";


    specification.predicates.push(this);
    this.drawDpfPredicate = drawDpfPredicate;
    this.addNewNodeIntoPredicate = addNewNodeIntoPredicate;
    this.addDpfElementToPredicate = addDpfElementToPredicate;
    this.movePredicate = movePredicate;
    this.drawPredicateFromCoords = drawPredicateFromCoords;
    this.updatePredScript = updatePredScript;
}

DpfPredicate.prototype.updateDisplayName = function(newDisplayName){
    this.displayName = newDisplayName;
    this.processOutputName();
};

DpfPredicate.prototype.processOutputName = function(){
    var theStr = this.displayName;
    var keys = this.parameters.keys();

    for(var i = 0; i < this.parameters.size; ++i){
        var paramName = keys.next().value;
        var paramVal  = this.parameters.get(paramName);
        var searchTag = '{' + paramName + '}';
        //console.log(searchTag);
        theStr = theStr.replace(searchTag, paramVal);
    }
    //console.log(theStr);
    this.outputName = theStr;

    this.d_text.attr('text', this.outputName);

    //todo propagate changes to all predicate constraints...
};

DpfPredicate.prototype.processParameter = function(paramText){
  if(paramText == ""){
      this.parameterText = "";
      this.parameters = [];
      return;
  }
    var newParameters = new Map();
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

function updatePredScript(){
    this.predScript = "//@begin auto-generated code";
    this.predScript += "\n function " + this.className + "(){";
    for(var i = 0; i < this.nodes.length; ++i){
        this.predScript += "\n\t this." + this.nodes[i].name + "\t = [];";
    }
    for(i = 0; i < this.conn.length; ++i ){
        this.predScript += "\n\t this." + this.conn[i].name + "\t = [];";
    }
    this.predScript += "\n}\n//@end auto-generated code";
}


var parseDpfPredicate = function(predXmlRoot, predSpec, ruleSpec){
    //console.log(predXmlRoot);

    var predXmls = predXmlRoot.getElementsByTagName("DpfPredicate");
    for(var p = 0; p < predXmls.length; ++p) {
        var predXml = predXmls[p];
        console.log(predXml);
        var predId = parseInt( predXml.getElementsByTagName("ID")[0].childNodes[0].nodeValue);
        var name = predXml.getElementsByTagName("name")[0].childNodes[0].nodeValue;

        var thePredicate = new DpfPredicate(name, predSpec, predId);

        var displayName = predXml.getElementsByTagName("displayName")[0].childNodes[0].nodeValue;
        var outputName = predXml.getElementsByTagName("outputName")[0].childNodes[0].nodeValue;
        thePredicate.displayName = displayName;
        thePredicate.outputName = outputName;

        if(predXml.getElementsByTagName("parameterText")[0].childNodes[0]) {
            var parameterText = predXml.getElementsByTagName("parameterText")[0].childNodes[0].nodeValue;
            thePredicate.processParameter(parameterText);
        }

        thePredicate.predScript = predXml.getElementsByTagName("predScript")[0].childNodes[0].nodeValue;
        thePredicate.validateScript = predXml.getElementsByTagName("validateScript")[0].childNodes[0].nodeValue;

        var predNodesXml = predXml.getElementsByTagName("predicate_nodes");
        if(predNodesXml[0]) {
            var nodes = predNodesXml[0].getElementsByTagName("DpfNode");
            for (var i = 0; i < nodes.length; ++i) {
                var nodeXml = nodes[i];
                thePredicate.nodes.push(parseDpfNode(nodeXml, predSpec));
            }
        }
        var predConnsXml = predXml.getElementsByTagName("predicate_connections");
        if(predConnsXml[0]) {
            var conns = predConnsXml[0].getElementsByTagName("DpfConnection");
            for (i = 0; i < conns.length; ++i) {
                var connXml = conns[i];
                thePredicate.conn.push(parseDpfConnection(connXml, predSpec));
            }
        }


        var lineCoords = [];
        var d_textCoords = [];
        var assocConns = [];

        var d_lineXml = predXml.getElementsByTagName("predicate_lines");
        if(d_lineXml[0]) {
            var lineXml = d_lineXml[0].getElementsByTagName("line");
            for (i = 0; i < lineXml.length; ++i) {
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
                if(assocType == 0)
                    assocConns.push(findDpfConnectionById(assocConnId));
                else
                    assocConns.push(findDpfNodeById(assocConnId));
                lineCoords.push(coords);
            }
        }

        var dTextXml = predXml.getElementsByTagName("predicate_text_pos");
        coordsVals = dTextXml[0].childNodes[0].nodeValue.split(",");

        d_textCoords.push(parseFloat(coordsVals[0]));
        d_textCoords.push(parseFloat(coordsVals[1]));

        thePredicate.drawPredicateFromCoords(lineCoords, assocConns, d_textCoords);

        var compRuleXml = predXml.getElementsByTagName("completionRules");
        parseDpfCompletionRule(compRuleXml, thePredicate, ruleSpec);

        var productionRuleXml = predXml.getElementsByTagName("productionRules");
        parseDpfCompletionRule(productionRuleXml, thePredicate, ruleSpec);

    }

    predSpec.leftOffSet = parseFloat(predXmlRoot.getElementsByTagName("leftOffSet")[0].childNodes[0].nodeValue );
    predSpec.rightOffSet = parseFloat(predXmlRoot.getElementsByTagName("rightOffSet")[0].childNodes[0].nodeValue );
    predSpec.topOffSet = parseFloat(predXmlRoot.getElementsByTagName("topOffSet")[0].childNodes[0].nodeValue );
    predSpec.bottomOffSet = parseFloat(predXmlRoot.getElementsByTagName("bottomOffSet")[0].childNodes[0].nodeValue );
};

var getDpfPredicateXml = function(spec, indentStr0){
    var xmlText = "\n" + indentStr0 + "<DpfPredicateList>";
    var indentStr = indentStr0 + "   ";

    for(var p = 0; p < spec.predicates.length; ++p) {
        var pred = spec.predicates[p];
        xmlText += "\n" + indentStr + "<DpfPredicate>";
        xmlText += "\n" + indentStr + "<ID>" + pred.predicateId + "</ID>";
        xmlText += "\n" + indentStr + "<name>" + pred.name + "</name>";
        xmlText += "\n" + indentStr + "<displayName><![CDATA[" + pred.displayName + "]]></displayName>";
        xmlText += "\n" + indentStr + "<parameterText><![CDATA[" + pred.parameterText + "]]></parameterText>";
        xmlText += "\n" + indentStr + "<outputName><![CDATA[" + pred.outputName + "]]></outputName>";

        xmlText += "\n" + indentStr + "<predScript><![CDATA[" + pred.predScript + "]]></predScript>";
        xmlText += "\n" + indentStr + "<validateScript><![CDATA[" + pred.validateScript + "]]></validateScript>";


        xmlText += "\n" + indentStr + "<predicate_nodes>";

        for (var i = 0; i < pred.nodes.length; ++i) {
            var node = pred.nodes[i];
            xmlText += getDpfNodeXml(node, indentStr + "   ");

        }
        xmlText += "\n" + indentStr + "</predicate_nodes>";
        xmlText += "\n" + indentStr + "<predicate_connections>";
        for (i = 0; i < pred.conn.length; ++i) {
            var aConn = pred.conn[i];
            xmlText += getDpfConnectionXml(aConn, indentStr + "   ");

        }
        xmlText += "\n" + indentStr + "</predicate_connections>";
        xmlText += "\n" + indentStr + "<predicate_text_pos>" + pred.d_text.attr('x') + "," + pred.d_text.attr('y') + "</predicate_text_pos>";

        xmlText += "\n" + indentStr + "<predicate_lines>";
        for(var l = 0; l < pred.d_lines.length; ++l){
            var line = pred.d_lines[l];
            xmlText += "\n" + indentStr + "   <line>";
            var coords = line.data('coords');
            for(var j = 0; j < coords.length; ++j) {
                xmlText += coords[j];
                    xmlText += ",";
            }
            // append connection id
            var assocConn = line.data('assocConn');
            xmlText += assocConn.ID ;
            if(assocConn.dpfType == 'DpfConnection')
                xmlText += ",0" ;
            else
                xmlText += ",1" ;
            xmlText += "</line>";
        }
        xmlText += "\n" + indentStr + "</predicate_lines>";

        xmlText += "\n" + indentStr + "<completionRules>";
        for(l =0; l < pred.completionRules.length; ++l){
            xmlText += getDpfCompletionRuleXml(pred.completionRules[l], indentStr + "   ");
        }
        xmlText += "\n" + indentStr + "</completionRules>";

        xmlText += "\n" + indentStr + "<productionRules>";
        for(l =0; l < pred.productionRules.length; ++l){
            xmlText += getDpfCompletionRuleXml(pred.productionRules[l], indentStr + "   ");
        }
        xmlText += "\n" + indentStr + "</productionRules>";

        xmlText += "\n" + indentStr + "</DpfPredicate>";
    }
    xmlText += "\n" + indentStr + "<leftOffSet>" + spec.leftOffSet + "</leftOffSet>";
    xmlText += "\n" + indentStr + "<rightOffSet>" + spec.rightOffSet + "</rightOffSet>";
    xmlText += "\n" + indentStr + "<topOffSet>" + spec.topOffSet + "</topOffSet>";
    xmlText += "\n" + indentStr + "<bottomOffSet>" + spec.bottomOffSet + "</bottomOffSet>";
    xmlText += "\n" + indentStr0 + "</DpfPredicateList>";
    return xmlText;
};

function drawPredicateFromCoords(lineCoords, assocConns, d_textCoords){
    var coords = [], arrowEnd;
    for(var i = 0; i < lineCoords.length; ++i){
        coords = lineCoords[i];
        console.log(coords);
        var path = ["M", coords[0].toFixed(3), coords[1].toFixed(3), "L", coords[2].toFixed(3), coords[3].toFixed(3)].join(",");

        var line = paper.path(path).attr({
            stroke: "#666",
            "stroke-width": 2,
            fill: "none",
            "arrow-start": "oval-narrow-midium",
            "arrow-end": "oval-narrow-midium"
        }).data("parent", this).data('coords', coords).data('origCoords', []).data('assocConn', assocConns[i]);

        this.d_lines.push(line);
        assocConns[i].assocPredLine.push(line);
    }

    this.d_text = paper.text(d_textCoords[0], d_textCoords[1], this.outputName).attr({"text-anchor": "start", fill: '#666666', "font-size": 12}).data("parent", this);
    this.d_text.mousemove(changeDpfPredTextCursor);
    this.d_text.drag(dragDpfPredTextMove, dragDpfPredTextStart, dragDpfPredTextEnd);
}

function drawDpfPredicate() {
    this.d_text = paper.text(0, 0, this.outputName).attr({"text-anchor": "start", fill: '#666666', "font-size": 13}).data("parent", this);

    var xPos = drawingPane[2].attr('width') - (this.d_text.getBBox().width + 20) - 10;
    var yPos = drawingPane[2].attr('height') - (this.d_text.getBBox().height + 20) - 10;

    this.d_text.attr({x: xPos, y: yPos });

    this.d_text.mousemove(changeDpfPredTextCursor);
    this.d_text.drag(dragDpfPredTextMove, dragDpfPredTextStart, dragDpfPredTextEnd);
}

function addNewNodeIntoPredicate(nodeName) {

    var predicateSpecification = dpfSpecifications[2];

    var xPos = drawingPane[2].attr('x') + 20;
    var yPos = drawingPane[2].attr('y') + 20;

    var newDpfNode = new DpfNode(nodeName, predicateSpecification, allNodes);
    newDpfNode.setNodePosition(xPos, yPos);
    newDpfNode.drawNode();

    xPos = drawingPane[2].attr('width') - (newDpfNode.d_text.getBBox().width + 20) - 10;
    yPos = drawingPane[2].attr('height') - (newDpfNode.d_text.getBBox().height + 20) - 10;
    newDpfNode.updateNodePosition(xPos, yPos);

    this.nodes.push(newDpfNode);
}

DpfPredicate.prototype.removeDpfNodeFromPredicate = function(dpfNode){
    var nodeList = [];
    for(var i = 0; i < this.nodes.length; ++i){
        if(this.nodes[i].ID != dpfNode.ID)
            nodeList.push(this.nodes[i]);
    }
    this.nodes = nodeList;

    var attachedModelNodeList = [];
    for(i = 0; i < this.attachedModelNodes.length; ++i){
        if(this.attachedModelNodes[i].srcNode.ID == dpfNode.ID)
            continue;
        attachedModelNodeList.push(this.attachedModelNodes[i]);
    }
    this.attachedModelNodes = attachedModelNodeList;
};

DpfPredicate.prototype.removeDpfConnectionFromPredicate = function(dpfConnection){
    var connList = [];
    if(dpfConnection.assocPredLine.length > 0){
        for(var l = 0; l < dpfConnection.assocPredLine.length; ++l){
            var aline = dpfConnection.assocPredLine[l];
            aline.remove();
            var newd_lines = [];
            for(var a = 0; a < this.d_lines.length; ++a){
                if(aline != this.d_lines[a])
                    newd_lines.push(this.d_lines[a]);
            }
            this.d_lines = newd_lines;
        }
    }

    for(var i = 0; i < this.conn.length; ++i){
        if(this.conn[i].ID != dpfConnection.ID)
            connList.push(this.conn[i]);
    }
    this.conn = connList;

    var attachedModelConnList = [];
    for(i = 0; i < this.attachedModelConns.length; ++i){
        if(this.attachedModelConns[i].srcConn.ID == dpfConnection.ID)
            continue;
        attachedModelConnList.push(this.attachedModelConns[i]);
    }
    this.attachedModelConns = attachedModelConnList;
};

DpfPredicate.prototype.removeProductionRuleFromPredicate = function(theRule){
    var newRuleList = [];
    for(var i = 0; i < this.productionRules.length; ++i){
        if(this.productionRules[i].ruleId != theRule.ruleId)
            newRuleList.push(this.productionRules[i]);
    }
    this.productionRules = newRuleList;
};

DpfPredicate.prototype.removeRuleFromPredicate = function(theRule){
    var newRuleList = [];
    for(var i = 0; i < this.completionRules.length; ++i){
        if(this.completionRules[i].ruleId != theRule.ruleId)
            newRuleList.push(this.completionRules[i]);
    }
    this.completionRules = newRuleList;
};

function addDpfElementToPredicate(dpfElement) {
    var coords = null;
    if(dpfElement.dpfType == 'DpfConnection')
        coords = dpfElement.d_lines[0].data('coords');
    else{
        var bb = dpfElement.d_node.getBBox();
        coords = [bb.x, bb.y, bb.x + bb.width, bb.y];
    }

    var predX1 = (coords[0] + coords[2] ) / 2;
    var predY1 = (coords[1] + coords[3] ) / 2;

    var predText = this.d_text;

    var bb1 = predText.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
            {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
            {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
            {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2}],
        fx = p[0].x,
        fy = p[0].y,
        mindx = Math.abs(fx - predX1),
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


    var path1 = ["M", predX1, predY1, "L", fx, fy].join(",");
    var line = paper.path(path1).attr({
        stroke: "#666", // "#fdb",
        "stroke-width": 2,
        fill: "none",
        "arrow-start": "oval-narrow-midium",
        "arrow-end": "oval-narrow-midium"
    }).data("parent", this).data('coords', [predX1, predY1, fx, fy]).data('origCoords', []).data('assocConn', dpfElement);//todo: need to rename 'assocConn' with 'assocElement'

    this.d_lines.push(line);
    dpfElement.assocPredLine.push(line);
}



function movePredicate() {
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
        var x2 = null;
        if(dpfElement.dpfType == 'DpfConnection')
            x2 = dpfElement.d_lines[0].data('coords');
        else{
            var bb = dpfElement.d_node.getBBox();
            x2 = [bb.x, bb.y, bb.x + bb.width, bb.y];
        }


        var predX1 = (x2[0] + x2[2] ) / 2;
        var predY1 = (x2[1] + x2[3] ) / 2;

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

