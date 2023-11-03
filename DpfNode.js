/**
 * Created by rabbi on 2/9/15.
 */

function DpfNode(name, specification, nodesRepo, nodeId){
        if(nodeId) {
            this.ID = nodeId;
            if(nodeId >= maxDpfNodeId)
                maxDpfNodeId = nodeId + 1;
        }
        else
         this.ID = maxDpfNodeId++;

         this.dpfType = 'DpfNode';
         this.name= name;
         this.spec= specification;
         this.conn= [];
         this.typing= null;
         this.instances= [];
         this.assocPredLine= [];
         this.assocPredConst = [];

         this.deepCp = 0;
         this.parentRule = null;
         this.comparisonFlag = false;
         this.creationLayer = 0;
         this.displayFlag = 0;
         this.exploreFlag = 0;

         this.param = new Map();

         this.d_node= null;
         this.d_text= null;
         this.d_x= 0;
         this.d_y= 0;
         this.d_width= 0;
         this.d_height= 0;
         this.d_nacLine = null;

         this.refToOriginal = null;

         if(specification)
            specification.nodes.push(this);

    nodesRepo.push(this);

    this.setNodePosition    = setNodePosition;
    this.drawNode           = drawNode;
    this.updateNodeGraphics = updateNodeGraphics;
    this.updateTextPosition = updateTextPosition;
    this.updateNodePosition = updateNodePosition;
    this.editNode           = editNode;
    this.setParentRule      = setParentRule;
    this.setNACTagToNode    = setNACTagToNode;
    this.setAddTagToNode    = setAddTagToNode;
    this.setDelTagToNode    = setDelTagToNode;
    this.hideDpfNode        = hideDpfNode;
    this.removeConnectionReferenceFromDpfNode = removeConnectionReferenceFromDpfNode;
    this.deleteDpfNode      = deleteDpfNode;
    this.removeNodeFromInstances = removeNodeFromInstances;
    this.removeFocusFromNode = removeFocusFromNode;
    this.makeInconsistentNode = makeInconsistentNode;
    this.clearInconsistentNode = clearInconsistentNode;
}


DpfNode.prototype.copyNodeCoords = function(){
    /*
    this.d_x = theNode.d_x;
    this.d_y = theNode.d_y;
    this.d_width = theNode.d_width;
    this.d_height = theNode.d_height;
    */
    if(this.refToOriginal == null)
        return;
    var bb = this.refToOriginal.d_node.getBBox();
    this.d_x =  bb.x;
    this.d_y =  bb.y;
    this.d_width =  bb.width;
    this.d_height = bb.height;
};

DpfNode.prototype.copyNode = function(newSpec, copyRef){
    var newNode = new DpfNode(this.name, newSpec, copyNodes, this.ID);
    newNode.creationLayer = this.creationLayer;
    newNode.displayFlag = this.displayFlag;
    if(copyRef)
        newNode.refToOriginal = this;
    else
        newNode.refToOriginal = this.refToOriginal;

    if(this.typing)
        this.typing.copyTypingOfNode(copyRef);
};

DpfNode.prototype.setCreationLayerNumber = function (layerNo){
    this.creationLayer = layerNo;
};

DpfNode.prototype.removeNodeFromPaper = function(){
    this.d_node.remove();
    this.d_text.remove();
    if(this.typing)
        this.typing.d_line.remove();
};

function removeNodeFromInstances(nodeToRemove){
    var newInstList = [];
    for(var i = 0; i < this.instances.length; ++i){
        if(this.instances[i].from.ID != nodeToRemove.ID )
            newInstList.push(this.instances[i]);
    }
    this.instances = newInstList;
}

function deleteDpfNode(){
    // the node must not have any connections...
    if(this.conn.length > 0)
        throw "Cannot delete node " + this.name + ".\nThe node has connections.";

    if(this.instances.length > 0)
        throw "Cannot delete node \n" + this.name + ". \nThe node has instances.";

    if(this.typing) {
        this.typing.d_line.remove();
        this.typing.type.removeNodeFromInstances(this);
    }
    this.d_text.remove();
    this.d_node.remove();
    if(this.d_nacLine)
        this.d_nacLine.remove();

    var specPredConst = this.spec.predicateConstraints;
    var predConstToDel = [];
    for(i = 0; i < specPredConst.length; ++i){
        var attModelNodes = specPredConst[i].attachedModelNodes;
        for(var j = 0; j < attModelNodes.length; ++j){
            if(attModelNodes[j].trgNode.ID == this.ID)
                predConstToDel.push(specPredConst[i]);
        }
    }
    for(i = 0; i < predConstToDel.length; ++i){
        predConstToDel[i].deletePredicateConstraint();
    }

    allNodesList = [];
    for(i = 0; i < allNodes.length; ++i){
        if(allNodes[i].ID != this.ID)
            allNodesList.push(allNodes[i]);
    }
    allNodes = allNodesList;


    var specNodes = [];
    for(i = 0; i < this.spec.nodes.length; ++i){
        if(this.spec.nodes[i].ID != this.ID)
            specNodes.push(this.spec.nodes[i]);
    }
    this.spec.nodes = specNodes;
    if(highlightedNode == this)
    highlightedNode = null;
}

DpfNode.prototype.deleteDpfNodeOnly = function(nodeRepo){
    // the node must not have any connections...
    if(this.conn.length > 0)
        throw "Cannot delete node " + this.name + ".\nThe node has connections.";

    if(this.instances.length > 0)
        throw "Cannot delete node \n" + this.name + ". \nThe node has instances.";

    if(this.typing) {
        this.typing.type.removeNodeFromInstances(this);
    }

    var specPredConst = this.spec.predicateConstraints;
    var predConstToDel = [];
    for(i = 0; i < specPredConst.length; ++i){
        var attModelNodes = specPredConst[i].attachedModelNodes;
        for(var j = 0; j < attModelNodes.length; ++j){
            if(attModelNodes[j].trgNode.ID == this.ID)
                predConstToDel.push(specPredConst[i]);
        }
    }
    for(i = 0; i < predConstToDel.length; ++i){
        predConstToDel[i].deletePredicateConstraintOnly();
    }



    var specNodes = [];
    for(i = 0; i < this.spec.nodes.length; ++i){
        if(this.spec.nodes[i].ID != this.ID)
            specNodes.push(this.spec.nodes[i]);
    }
    this.spec.nodes = specNodes;
};


function removeConnectionReferenceFromDpfNode(theConn){
    var newConnList = [];
    for(var i = 0; i < this.conn.length; ++i){
        if(this.conn[i].ID != theConn.ID)
            newConnList.push(this.conn[i]);
    }
    this.conn = newConnList;
}

var parseDpfNode = function(nodeXml, spec){
    //console.log(nodeXml);
    var nodeId = parseInt( nodeXml.getElementsByTagName("ID")[0].childNodes[0].nodeValue );
    var nodeName = nodeXml.getElementsByTagName("name")[0].childNodes[0].nodeValue;
    var theNode = new DpfNode(nodeName, spec, allNodes, nodeId);

    theNode.d_x = parseFloat( nodeXml.getElementsByTagName("d_x")[0].childNodes[0].nodeValue );
    theNode.d_y = parseFloat( nodeXml.getElementsByTagName("d_y")[0].childNodes[0].nodeValue );
    theNode.d_width = parseFloat( nodeXml.getElementsByTagName("d_width")[0].childNodes[0].nodeValue );
    theNode.d_height = parseFloat( nodeXml.getElementsByTagName("d_height")[0].childNodes[0].nodeValue );

    if(nodeXml.getElementsByTagName("deepCp")[0])
        theNode.deepCp = parseInt( nodeXml.getElementsByTagName("deepCp")[0].childNodes[0].nodeValue);

    theNode.drawNode();

    var typeNode = nodeXml.getElementsByTagName("typing")[0];
    if(typeNode){
        var typeDpfNode = findDpfNodeById( parseInt(typeNode.childNodes[0].nodeValue) );
        var typingOfNode = new DpfTypingOfNode(theNode, typeDpfNode);
        typingOfNode.drawTypingForNode();
    }

    return theNode;
};

var getDpfNodeXml = function(node, indentStr0){
    var xmlText = "\n" + indentStr0 + "<DpfNode>";
    var indentStr = indentStr0 + "   ";
    xmlText += "\n" + indentStr + "<ID>" + node.ID + "</ID>";
    xmlText += "\n" + indentStr + "<name>" + node.name + "</name>";
    if(node.typing)
        xmlText += "\n" + indentStr + "<typing>" + node.typing.type.ID + "</typing>";

    xmlText += "\n" + indentStr + "<deepCp>" + node.deepCp + "</deepCp>";
    var bb = node.d_node.getBBox();
    xmlText += "\n" + indentStr + "<d_x>" + bb.x + "</d_x>";
    xmlText += "\n" + indentStr + "<d_y>" + bb.y + "</d_y>";
    xmlText += "\n" + indentStr + "<d_width>" + bb.width + "</d_width>";
    xmlText += "\n" + indentStr + "<d_height>" + bb.height + "</d_height>";
    if(node.d_nacLine){
        var coords = node.d_nacLine.data('coords');
        xmlText += "\n" + indentStr + "<d_nacLine>";
        for(var i = 0; i < coords.length; ++i) {
            xmlText += coords[i];
            if(i + 1 < coords.length)
            xmlText += ",";
        }
        xmlText +=  "</d_nacLine>";
    }

    xmlText += "\n" + indentStr0 + "</DpfNode>";
    return xmlText;
};

function setParentRule(parentRule){
    this.parentRule = parentRule;
}

function setNodePosition(x,y) {
    this.d_x = x;
    this.d_y = y;
}


DpfNode.prototype.temporaryshow = function(typingFlag){
    if(this.displayFlag < 2) {
        this.d_text.show();
        this.d_node.show();
        if(this.d_nacLine)
            this.d_nacLine.show();
        var typing = this.typing;
        if(typingFlag && typing && typing.type.spec == dpfSpecifications[0] && typing.type.displayFlag < 2) {
            typing.d_line.show();
        }
    }
};

DpfNode.prototype.show = function(typingFlag){
    if(this.displayFlag == 0) {
        this.d_text.show();
        this.d_node.show();
        if(this.d_nacLine)
            this.d_nacLine.show();
        var typing = this.typing;
        if(typingFlag && typing && typing.type.spec == dpfSpecifications[0] && typing.type.displayFlag == 0) {
            typing.d_line.show();
        }
    }
};

function hideDpfNode(){
    this.d_text.hide();
    this.d_node.hide();
    if(this.typing)
        this.typing.d_line.hide();
    if(this.instances.length > 0){
        for(var i = 0; i < this.instances.length; ++i){
            this.instances[i].d_line.hide();
        }
    }
}

function removeFocusFromNode(){
    this.d_node.attr('opacity', 0.7);
    var selectedTypingSetting = document.getElementById("selectedTyping").checked;
    var globalTypingSetting = document.getElementById("nodeTyping").checked;
    switch (selectedTypingSetting) {
        case true:
            if(globalTypingSetting == false && this.typing)
                this.typing.d_line.hide();
            break;
    }
}

DpfNode.prototype.focusNode = function(){
    this.d_node.attr('opacity', 1.0);

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

function clearInconsistentNode(){
    if(this.d_node.attr('fill') == '#FF0000')
        this.d_node.attr({'fill': '#759dcd', 'stroke': '#3b5068'});
}

function makeInconsistentNode(){
    this.displayFlag = 0;
    var nodeTypingFlag = nodeTypingSetting;
    if(this.spec == dpfSpecifications[0]) {
        nodeTypingFlag = false;
    }

    if(this.spec == dpfSpecifications[0] || this.spec == dpfSpecifications[1]){
        this.show(nodeTypingFlag);
    }
    this.d_node.attr({'fill': '#FF0000', 'stroke': '#FF7777'});
}

function drawNode(){

    this.d_node = paper.rect(this.d_x, this.d_y, 7, 20, 4).attr({
        'fill': '#759dcd',
        'stroke': '#3b5068',
        'stroke-width': 4,
        'opacity': 0.7
    }).data('parent', this);


    var nodeName = '';

    if(this.deepCp == 1)
        nodeName = this.name + '*';
    else
        nodeName = this.name;


        this.d_text = paper.text((this.d_x + 10), (this.d_y + 18), nodeName).attr({"text-anchor": "start",fill: '#000000',"font-size": 14}).data('parent', this);


    //console.log('drawing d_text at : ' + this.d_x + ', ' + this.d_y + ' ' + this.name + ' and ');
    //console.log(this);
    this.d_width = this.d_text.getBBox().width + 20;
    this.d_height = this.d_text.getBBox().height + 25;
    this.d_node.attr({width: this.d_width, height: this.d_height});
    this.d_node.mousemove(changeDpfNodeCursor);
    this.d_node.drag(dragDpfNodeMove, dragDpfNodeStart, dragDpfNodeEnd);
}

function setDelTagToNode(){
    // change node color to red
    this.d_node.attr({'fill': '#DB0000', 'stroke': '#777777'});
}

function setAddTagToNode(){
    // change node color to red
    this.d_node.attr({'fill': '#00DB00', 'stroke': '#444444'});
}

function setNACTagToNode(){
    // draw a strikethrough
    var bb = this.d_node.getBBox(),
        coords = [ bb.x + 4, bb.y + bb.height, bb.x + bb.width -4, bb.y ];

    var path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");
    var line = paper.path(path).attr({
        stroke: "#dbc",
        fill: "none",
        "stroke-width": 2
    }).data('coords', coords).data('origCoords', []).data('parent', this);
    line.attr({path: path});

    this.d_nacLine = line;
}

function updateNodeGraphics(newX, newY, newWidth, newHeight){
    this.d_node.attr({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
    });
    if(this.typing != null)
        this.typing.moveTypingForDpfNodeMove();


    for(var i = 0; i < this.instances.length; ++i)
        this.instances[i].moveTypingForDpfNodeMove();

    if(this.d_nacLine != null){
        var bb = this.d_node.getBBox(),
            coords = [bb.x + 4, bb.y + bb.height, bb.x + bb.width - 4, bb.y];

        var path = ["M", (coords[0]).toFixed(3), (coords[1]).toFixed(3), "L", (coords[2]).toFixed(3), (coords[3]).toFixed(3)].join(",");
        this.d_nacLine.attr({path: path});
    }
}

function updateTextPosition(newX, newY){
    this.d_text.attr({x: newX, y: newY});
}

function updateNodePosition(newX, newY){
    this.d_node.attr({x: newX, y: newY});
    this.d_text.attr({x: newX + 10, y: newY + 18});
}


function editNode(nodeNameFieldId, selected_type_node){

    var nodeName = document.getElementById(nodeNameFieldId).value;
    if(!nodeName )
        return;

    if( (M_selected_model == M_selected_metamodel && M_selected_metamodel.metaLevel == 0) || this.spec.level == 2){
        // typing is not required
    }
    else {
        if(!selected_type_node)
            return;

        // check if type has been changed....
        var oldType = this.typing.type;
        if (oldType && oldType != selected_type_node) {
            // remove this from oldTypes instances array
            var inst = oldType.instances;
            var newInst = [];
            for (var t = 0; t < inst.length; ++t) {
                if (inst[t] == M_selected_node)
                    continue;
                newInst.push(inst[t]);
            }
            oldType.instances = newInst;

            // add this into newTypes instances array
            selected_type_node.instances.push(this.typing);
            this.typing.type = selected_type_node;
        }
    }
    // check if the name has been changed...
    var oldNodeName = this.name;
    if(nodeName == oldNodeName) {
        console.log('No changes to make in node name..');
        return;
    }

    var theText = this.d_text;
    theText.attr('text', nodeName);
    this.d_node.attr({width: (theText.getBBox().width + 20), height: (theText.getBBox().height + 25)});
    this.name = nodeName;

    var conns = this.conn;
    if (conns) {
        for (var i = conns.length-1; i >= 0 ;i--) {
            conns[i].moveDpfConnectionForNodeMove(this);

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


    if(this.typing)
        this.typing.moveTypingForDpfNodeMove();


    for(i = 0; i < this.instances.length; ++i)
        this.instances[i].moveTypingForDpfNodeMove();

    paper.safari();
}