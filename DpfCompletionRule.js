/**
 * Created by rabbi on 2/13/15.
 */

function DpfCompletionRule(parentPredicate, specification, ruleType, layerNo, theRuleId) {
    this.dpfType = ruleType;
    if(theRuleId){
        this.ruleId = theRuleId;
        if(theRuleId >= maxRuleId)
            maxRuleId = theRuleId + 1;
    }
    else
        this.ruleId= maxRuleId++;
    if(layerNo)
        this.layerNumber = layerNo;
    else
        this.layerNumber = 1;

    this.parentPredicate= parentPredicate;
    this.spec= specification;
    this.nodes= [];
    this.conn= [];
    this.elements_in_nac = [];
    this.elements_to_add = [];
    this.elements_to_delete = [];

    this.annotations = [];

    if(ruleType == 'DpfCompletionRule'){
        allRules.push(this);
        parentPredicate.completionRules.push(this);
    }
    else{
        allProductionRules.push(this);
        parentPredicate.productionRules.push(this);
    }

    this.addNewNodeInRule = addNewNodeInRule;
}

DpfCompletionRule.prototype.findAnnotationById = function(annotId){
    console.log(this.annotations.length);
    for(var i = 0; i < this.annotations.length; ++i){
        console.log(this.annotations[i].ID);
        if(this.annotations[i].ID == annotId)
            return this.annotations[i];
    }
    return null;
};

var parseDpfCompletionRule = function(compRuleXmlRoot, parentPred, ruleSpec){
    if(!compRuleXmlRoot)
        return;

    var ruleXmls = compRuleXmlRoot[0].getElementsByTagName("DpfCompletionRule");
    for(var p = 0; p < ruleXmls.length; ++p) {
        var ruleXml = ruleXmls[p];
        var ruleId = parseInt( ruleXml.getElementsByTagName("ID")[0].childNodes[0].nodeValue );
        var layerNumber = parseInt( ruleXml.getElementsByTagName("layerNumber")[0].childNodes[0].nodeValue );
        var ruleType = 0;
        var ruleTypeXml = ruleXml.getElementsByTagName("ruleType")[0];
        if(ruleTypeXml)
            ruleType = parseInt( ruleTypeXml.childNodes[0].nodeValue);
        var theRule;
        if(ruleType == 1)
            theRule = new DpfCompletionRule(parentPred, ruleSpec, 'DpfProductionRule', layerNumber, ruleId);
        else
            theRule = new DpfCompletionRule(parentPred, ruleSpec, 'DpfCompletionRule', layerNumber, ruleId);

        var ruleNodesXml = ruleXml.getElementsByTagName("nodes");
        if(ruleNodesXml[0]) {
            var nodes = ruleNodesXml[0].getElementsByTagName("DpfNode");
            for (var i = 0; i < nodes.length; ++i) {
                var nodeXml = nodes[i];
                var aNode = parseDpfNode(nodeXml, ruleSpec);
                theRule.nodes.push(aNode);
                aNode.setParentRule(theRule);
            }
        }
        var ruleConnsXml = ruleXml.getElementsByTagName("connections");
        if(ruleConnsXml[0]) {
            var conns = ruleConnsXml[0].getElementsByTagName("DpfConnection");
            for (i = 0; i < conns.length; ++i) {
                var connXml = conns[i];
                var aConn =  parseDpfConnection(connXml, ruleSpec);
                aConn.parentRule = theRule;
                theRule.conn.push(aConn);
            }
        }

        var annotationsXml = ruleXml.getElementsByTagName("annotations");
        if(annotationsXml[0]){
            var annotsXml = annotationsXml[0].getElementsByTagName("DpfAnnotation");
            for(i = 0; i < annotsXml.length; ++i){
                var annotXml = annotsXml[i];
                var anAnnot = parseDpfAnnotation(annotXml, theRule);
            }
        }



        var elements_in_nac = ruleXml.getElementsByTagName("elements_in_nac");
        var annotIdXml, annotId, dpfAnnotation;

        if(elements_in_nac[0]) {
            var nodeIdXml = elements_in_nac[0].getElementsByTagName("NodeId");
            for (i = 0; i < nodeIdXml.length; ++i) {
                var nodeId = parseInt( nodeIdXml[i].childNodes[0].nodeValue);
                var dpfNode = findDpfNodeById(nodeId);
                dpfNode.setNACTagToNode();
                theRule.elements_in_nac.push(dpfNode);
            }
            var connIdXml = elements_in_nac[0].getElementsByTagName("ConnId");
            for (i = 0; i < connIdXml.length; ++i) {
                var connId = parseInt( connIdXml[i].childNodes[0].nodeValue);
                var dpfConn = findDpfConnectionById(connId);
                dpfConn.setNACTagToConnection();
                theRule.elements_in_nac.push(dpfConn);
            }
            annotIdXml = elements_in_nac[0].getElementsByTagName("AnnotationId");
            for(i = 0; i < annotIdXml.length; ++i){
                annotId = parseInt( annotIdXml[i].childNodes[0].nodeValue);
                console.log(annotId);
                dpfAnnotation = theRule.findAnnotationById(annotId);
                console.log(dpfAnnotation);
                dpfAnnotation.setNACTagToAnnotation();
                theRule.elements_in_nac.push(dpfAnnotation);
            }

        }


        var elements_to_add = ruleXml.getElementsByTagName("elements_to_add");

        if(elements_to_add[0]) {
            nodeIdXml = elements_to_add[0].getElementsByTagName("NodeId");
            for (i = 0; i < nodeIdXml.length; ++i) {
                nodeId = parseInt( nodeIdXml[i].childNodes[0].nodeValue);
                dpfNode = findDpfNodeById(nodeId);
                dpfNode.setAddTagToNode();
                theRule.elements_to_add.push(dpfNode);
            }
            connIdXml = elements_to_add[0].getElementsByTagName("ConnId");
            for (i = 0; i < connIdXml.length; ++i) {
                connId = parseInt( connIdXml[i].childNodes[0].nodeValue);
                dpfConn = findDpfConnectionById(connId);
                dpfConn.setAddTagToConnection();
                theRule.elements_to_add.push(dpfConn);
            }
            annotIdXml = elements_to_add[0].getElementsByTagName("AnnotationId");
            for(i = 0; i < annotIdXml.length; ++i){
                annotId = parseInt( annotIdXml[i].childNodes[0].nodeValue);
                dpfAnnotation = theRule.findAnnotationById(annotId);
                dpfAnnotation.setAddTagToAnnotation();
                theRule.elements_to_add.push(dpfAnnotation);
            }
        }

        var elements_to_delete = ruleXml.getElementsByTagName("elements_to_delete");

        if(elements_to_delete[0]) {
            nodeIdXml = elements_to_delete[0].getElementsByTagName("NodeId");
            for (i = 0; i < nodeIdXml.length; ++i) {
                nodeId = parseInt( nodeIdXml[i].childNodes[0].nodeValue);
                dpfNode = findDpfNodeById(nodeId);
                dpfNode.setDelTagToNode();
                theRule.elements_to_delete.push(dpfNode);
            }
            connIdXml = elements_to_delete[0].getElementsByTagName("ConnId");
            for (i = 0; i < connIdXml.length; ++i) {
                connId = parseInt( connIdXml[i].childNodes[0].nodeValue);
                dpfConn = findDpfConnectionById(connId);
                dpfConn.setDelTagToConnection();
                theRule.elements_to_delete.push(dpfConn);
            }
            annotIdXml = elements_to_delete[0].getElementsByTagName("AnnotationId");
            for(i = 0; i < annotIdXml.length; ++i){
                annotId = parseInt( annotIdXml[i].childNodes[0].nodeValue);
                dpfAnnotation = theRule.findAnnotationById(annotId);
                dpfAnnotation.setDelTagToAnnotation();
                theRule.elements_to_delete.push(dpfAnnotation);
            }
        }

    }

};


var getDpfCompletionRuleXml = function(rule, indentStr0){
    var xmlText = "\n" + indentStr0 + "<DpfCompletionRule>";
    var indentStr = indentStr0 + "   ";

    xmlText += "\n" + indentStr + "<ID>" + rule.ruleId + "</ID>";
    xmlText += "\n" + indentStr + "<layerNumber>" + rule.layerNumber + "</layerNumber>";
    if(rule.dpfType == 'DpfCompletionRule')
        xmlText += "\n" + indentStr + "<ruleType>0</ruleType>";
    else
        xmlText += "\n" + indentStr + "<ruleType>1</ruleType>";

    xmlText += "\n" + indentStr + "<nodes>";

    for (var i = 0; i < rule.nodes.length; ++i) {
        var node = rule.nodes[i];
        xmlText += getDpfNodeXml(node, indentStr + "   ");

    }
    xmlText += "\n" + indentStr + "</nodes>";
    xmlText += "\n" + indentStr + "<connections>";
    for (i = 0; i < rule.conn.length; ++i) {
        var aConn = rule.conn[i];
        xmlText += getDpfConnectionXml(aConn, indentStr + "   ");

    }
    xmlText += "\n" + indentStr + "</connections>";

    xmlText += "\n" + indentStr + "<annotations>";

    if(rule.annotations) {
        for (i = 0; i < rule.annotations.length; ++i) {
            xmlText += getDpfAnnotationXml(rule.annotations[i], indentStr + "   ");
        }
    }

    xmlText += "\n" + indentStr + "</annotations>";


    xmlText += "\n" + indentStr + "<elements_in_nac>";
    for(var l = 0; l < rule.elements_in_nac.length; ++l){
        var element = rule.elements_in_nac[l];
        if(element.dpfType == 'DpfNode'){
            xmlText += "\n" + indentStr + "  <NodeId>" + element.ID + "</NodeId>";
            //xmlText += getDpfNodeXml(element, indentStr + "   ");
        }
        else if(element.dpfType == 'DpfConnection'){
            xmlText += "\n" + indentStr + "  <ConnId>" + element.ID + "</ConnId>";
            //xmlText += getDpfConnectionXml(element, indentStr + "   ");
        }
        else
            xmlText += "\n" + indentStr + "  <AnnotationId>" + element.ID + "</AnnotationId>";
    }
    xmlText += "\n" + indentStr + "</elements_in_nac>";

    xmlText += "\n" + indentStr + "<elements_to_add>";
    for(l = 0; l < rule.elements_to_add.length; ++l){
        element = rule.elements_to_add[l];
        if(element.dpfType == 'DpfNode'){
            xmlText += "\n" + indentStr + "  <NodeId>" + element.ID + "</NodeId>";
            //xmlText += getDpfNodeXml(element, indentStr + "   ");
        }
        else if(element.dpfType == 'DpfConnection'){
            xmlText += "\n" + indentStr + "  <ConnId>" + element.ID + "</ConnId>";
            //xmlText += getDpfConnectionXml(element, indentStr + "   ");
        }
        else
            xmlText += "\n" + indentStr + "  <AnnotationId>" + element.ID + "</AnnotationId>";
    }
    xmlText += "\n" + indentStr + "</elements_to_add>";

    xmlText += "\n" + indentStr + "<elements_to_delete>";
    for(l = 0; l < rule.elements_to_delete.length; ++l){
        element = rule.elements_to_delete[l];
        if(element.dpfType == 'DpfNode'){
            xmlText += "\n" + indentStr + "  <NodeId>" + element.ID + "</NodeId>";
            //xmlText += getDpfNodeXml(element, indentStr + "   ");
        }
        else if(element.dpfType == 'DpfConnection'){
            xmlText += "\n" + indentStr + "  <ConnId>" + element.ID + "</ConnId>";
            //xmlText += getDpfConnectionXml(element, indentStr + "   ");
        }
        else
            xmlText += "\n" + indentStr + "  <AnnotationId>" + element.ID + "</AnnotationId>";
    }
    xmlText += "\n" + indentStr + "</elements_to_delete>";


    xmlText += "\n" + indentStr + "</DpfCompletionRule>";

    return xmlText;
};

function addNewNodeInRule(nodeName) {

    var ruleSpecification = dpfSpecifications[3];

    var xPos = drawingPane[3].attr('x') + 20;
    var yPos = drawingPane[3].attr('y') + 20;

    var newDpfNode;
    if(this.dpfType == 'DpfCompletionRule')
        newDpfNode = new DpfNode(nodeName, ruleSpecification, allNodes);
    else
        newDpfNode = new DpfNode(nodeName, ruleSpecification, allProductionRules);

    newDpfNode.setNodePosition(xPos, yPos);
    newDpfNode.drawNode();

    xPos = drawingPane[3].attr('width') - (newDpfNode.d_text.getBBox().width + 20) - 10;
    yPos = drawingPane[3].attr('y') + (newDpfNode.d_text.getBBox().height + 20) + 10;
    newDpfNode.updateNodePosition(xPos, yPos);
    newDpfNode.setParentRule(this);

    var typingOfNode = new DpfTypingOfNode(newDpfNode, P_selected_node);
    typingOfNode.drawTypingForNode();
    this.nodes.push(newDpfNode);
    return newDpfNode;
}


DpfCompletionRule.prototype.removeConnectionFromRule = function(dpfConnection) {
    var connList = [];
    for(var i = 0; i < this.conn.length; ++i){
        if(this.conn[i].ID != dpfConnection.ID){
            connList.push(this.conn[i]);
        }
    }
    this.conn = connList;

    this.removeElementFromTags(dpfConnection);

};

DpfCompletionRule.prototype.removeNodeFromRule = function(dpfNode) {
    var nodeList = [];
    for(var i = 0; i < this.nodes.length; ++i){
        if(this.nodes[i].ID != dpfNode.ID){
            nodeList.push(this.nodes[i]);
        }
    }
    this.nodes = nodeList;

    this.removeElementFromTags(dpfNode);

};

DpfCompletionRule.prototype.removeElementFromTags = function(dpfElement){
    var nodeList = [];
    for(var i = 0; i < this.elements_in_nac.length; ++i){
        if(this.elements_in_nac.dpfType == dpfElement.dpfType && this.elements_in_nac[i].ID != dpfElement.ID){
            nodeList.push(this.elements_in_nac[i]);
        }
    }
    this.elements_in_nac = nodeList;

    nodeList = [];
    for(i = 0; i < this.elements_to_add.length; ++i){
        if(this.elements_to_add.dpfType == dpfElement.dpfType && this.elements_to_add[i].ID != dpfElement.ID){
            nodeList.push(this.elements_to_add[i]);
        }
    }
    this.elements_to_add = nodeList;

    nodeList = [];
    for(i = 0; i < this.elements_to_delete.length; ++i){
        if(this.elements_to_delete.dpfType == dpfElement.dpfType && this.elements_to_delete[i].ID != dpfElement.ID){
            nodeList.push(this.elements_to_delete[i]);
        }
    }
    this.elements_to_delete = nodeList;
};



function setNAC(){

}