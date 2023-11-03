/**
 * Created by rabbi on 2/13/15.
 */

var PR_displayNodeTypingOfRules = function () {
    if(!PR_selected_rule)
        return;
    var nodeTypingSetting = document.getElementById("PR_nodeTyping").checked;
    switch (nodeTypingSetting) {
        case true:
            var nodes = PR_selected_rule.nodes;
            for(var i = 0; i < nodes.length; ++i){
                nodes[i].typing.d_line.show();
            }

            break;
        case false:
            nodes = PR_selected_rule.nodes;
            for(i = 0; i < nodes.length; ++i){
                nodes[i].typing.d_line.hide();
            }
            break;
    }
};



var PR_displayEdgeTypingOfRules = function () {
    if(!PR_selected_rule)
        return;
    var edgeTypingSetting = document.getElementById("PR_edgeTyping").checked;
    switch (edgeTypingSetting) {
        case true:
            var conns = PR_selected_rule.conn;
            for(var j = 0; j < conns.length; ++j){
                conns[j].typing.d_line.show();
            }
            break;
        case false:
            conns = PR_selected_rule.conn;
            for(j = 0; j < conns.length; ++j){
                conns[j].typing.d_line.hide();
            }
            break;
    }
};

//todo Refresh previous annotations.... (Its a bug that creates problem when you create two rules one after another)
var buildNewRule_PR = function(){
    clearErrorMessage('PR_error');
    if(!P_selected_pred){
        showErrorMessage('PR_error', 'Unknown Predicate');
        return;
    }
    cleanupProductionRulePane(false);
    PR_selected_rule = new DpfCompletionRule(P_selected_pred, dpfSpecifications[3], 'DpfProductionRule', 1);
    document.getElementById('PR_RuleId').value = PR_selected_rule.ruleId;
    document.getElementById('PR_RuleLayer').value = "1";
    makeProductionRuleTable();
    makeProductionRuleLayerTable();
};

var PR_updateLayerNumber = function(){
    var layerNumber = document.getElementById('C_RuleLayer').value;
    if(!layerNumber || layerNumber == "")
        return;

    if(!dpfSpecifications[2]){
        showErrorMessage('PR_error', 'Unknown Meta-model');
        return;
    }

    if(PR_selected_rule == null){
        showErrorMessage('PR_error', 'Unknown Rule');
        return;
    }
    PR_selected_rule.layerNumber = parseInt(layerNumber);
    makeProductionRuleLayerTable();
    clearErrorMessage('PR_error');
};


var makeProductionRuleTable= function(){
    if(!P_selected_pred)
        return;
    var productionRules = P_selected_pred.productionRules;
    var ruleHTML = "<ul>";
    for(var i = 0; i < productionRules.length; ++i) {
        var aRule = productionRules[i];
        ruleHTML = ruleHTML + '<li>' +
        '<table> <tr> <td>' +
        ' <a onclick="PR_showRule(' + aRule.ruleId + ')"> Rule: '  + aRule.ruleId + '</a>' + '</td><td>' +
        '<img  src="images/remove.png"  height="25" width="25" onclick="PR_deleteCompletionRule(' + aRule.ruleId + ')" > </td></tr></table> </li>';
    }
    ruleHTML = ruleHTML + '</ul>';
    document.getElementById('pr_ruleChk').innerHTML = ruleHTML;
};

var makeProductionRuleLayerTable= function(){
    var ruleHTML = "<ul>";
    var sortedRules = [];
    if(allProductionRules.length > 0) {

        for(var i = 0; i < allProductionRules.length; ++i){
            sortedRules.push(allProductionRules[i]);
        }

        for(i = 0; i < sortedRules.length; ++i){
            for(var j = i + 1; j < sortedRules.length; ++j){
                if(sortedRules[i].layerNumber > sortedRules[j].layerNumber ){
                    var temp = sortedRules[i];
                    sortedRules[i] = sortedRules[j];
                    sortedRules[j] = temp;
                }
            }
        }
        allProductionRules = sortedRules;

        for (i = 0; i < sortedRules.length; ++i) {
            aRule = sortedRules[i];
            ruleHTML = ruleHTML + '<li>' +
            '<table> <tr> <td>' +
            ' <a onclick="PR_showRuleWithPredicate(' + aRule.ruleId + ')"> Rule: ' + aRule.ruleId + '</a>' + '</td>' +
            '<td>Layer No: ' + aRule.layerNumber + '</td></tr></table> </li>';
        }
    }
    ruleHTML = ruleHTML + '</ul>';
    document.getElementById('prr_ruleLayer').innerHTML = ruleHTML;
};

var cleanupProductionRulePane = function(flag){
    //if(C_selected_rule){
        // clean up the drawing area from diagramPane[3]
        cleanupDrawingPane(dpfSpecifications[3]);
        //console.log('cleanupDrawingPane(dpfSpecifications[3])');
    //}

    initializeProductionRuleFields();

    if(flag){
        var ruleHTML = "<ul>";
        ruleHTML = ruleHTML + '</ul>';
        document.getElementById('pr_ruleChk').innerHTML = ruleHTML;
    }
};

var PR_showRuleWithPredicate = function(ruleId){
    var theRule = null;
    for(var i = 0; i < allProductionRules.length; ++i){
        if(allProductionRules[i].ruleId == ruleId){
            theRule = allProductionRules[i]; break;
        }
    }
    if(theRule == null) {
        showErrorMessage('PR_error', 'Rule not found');
        return;
    }

    P_showPredicate(theRule.parentPredicate.name);
    PR_showRule(ruleId);
};

var PR_showRule = function(ruleId){
    console.log('inside PR_showRule..');
    cleanupDrawingPane(dpfSpecifications[3]);
    initializeProductionRuleFields();
    var productionRules = P_selected_pred.productionRules;
    var theRule = null;
    for(var i = 0; i < productionRules.length; ++i){
        if(productionRules[i].ruleId == ruleId){
            theRule = productionRules[i];
            break;
        }
    }
    if(theRule == null)
        return;

    PR_selected_rule = theRule;

    // bring up the drawing elements in drawingPane[3]
    var nodes= theRule.nodes;

    for(i = 0; i < nodes.length; ++i){
        nodes[i].d_text.show();
        nodes[i].d_node.show();
        if(nodes[i].d_nacLine)
            nodes[i].d_nacLine.show();
        nodes[i].typing.d_line.show();
    }

    var conn = theRule.conn;
    for(var j = 0; j < conn.length; ++j){
        conn[j].d_text.show();
        if(conn[j].d_nacLine)
            conn[j].d_nacLine.show();
        conn[j].typing.d_line.show();
        var lines = conn[j].d_lines;
        for (var k = 0; k < lines.length; ++k) {
            lines[k].show();
        }
    }

    for(i = 0; i < theRule.annotations.length; ++i){
        theRule.annotations[i].show();
    }

    document.getElementById('PR_RuleId').value = theRule.ruleId;
    document.getElementById('PR_RuleLayer').value = theRule.layerNumber;
    displayNodeTypingOfRules();
    displayEdgeTypingOfRules();
};

var initializeProductionRuleFields = function(){
    PR_selected_node = null;
    PR_selected_node_src = null;
    PR_selected_node_trg = null;

    PR_node_click = 0;

    PR_selected_rule = null;
    PR_selected_arrow = null;

    document.getElementById('PR_RuleLayer').value = '';
    document.getElementById('PR_typeName').value = '';
    document.getElementById('PR_nodeName').value = '';
    document.getElementById('PR_EdgeTypeName').value = '';
    document.getElementById('PR_srcNode').value = '';
    document.getElementById('PR_trgNode').value = '';
    document.getElementById('PR_edgeName').value = '';
};


var PR_refreshEdgeFields = function(){
    PR_selected_node_src = null;
    PR_selected_node_trg = null;

    PR_node_click = 0;

    PR_selected_arrow = null;

    document.getElementById('PR_EdgeTypeName').value = '';
    document.getElementById('PR_srcNode').value = '';
    document.getElementById('PR_trgNode').value = '';
    document.getElementById('PR_edgeName').value = '';
};

var PR_refreshNodeFields = function(){
    PR_selected_node = null;
    PR_selected_node_src = null;
    PR_selected_node_trg = null;

    PR_node_click = 0;

    PR_selected_arrow = null;

    document.getElementById('PR_EdgeTypeName').value = '';
    document.getElementById('PR_edgeName').value = '';
};


var PR_deleteCompletionRule = function(ruleId){
    var theRule = null;
    for(var i = 0; i < allProductionRules.length; ++i){
        if(allProductionRules[i].ruleId == ruleId){
            theRule = allProductionRules[i];
            break;
        }
    }

    if( PR_selected_rule != null && PR_selected_rule.ruleId == theRule.ruleId )
        initializeProductionRuleFields();

    var count = theRule.conn.length;
    while(count > 0){
        theRule.conn[0].deleteDpfConnection();
        theRule.removeConnectionFromRule(theRule.conn[0]);
        count--;
    }
    count = theRule.nodes.length;
    while(count > 0){
        theRule.nodes[0].deleteDpfNode();
        theRule.removeNodeFromRule(theRule.nodes[0]);
        count--;
    }


    for(i = 0; i < theRule.annotations.length; ++i){
        theRule.annotations[i].removeAnnotationFromPaper();
    }

    theRule.parentPredicate.removeProductionRuleFromPredicate(theRule);
    var allRules2 = [];
    for(i = 0; i < allProductionRules.length; ++i){
        if(allProductionRules[i].ruleId != theRule.ruleId)
            allRules2.push(allProductionRules[i]);
    }
    allProductionRules = allRules2;
    makeProductionRuleTable();
    makeProductionRuleLayerTable();
};

var PR_removeDpfNode = function(){
    if(PR_selected_node == null) {
        showErrorMessage('PR_error', 'Select a node to delete');
        return;
    }
    try{
        PR_selected_node.deleteDpfNode();
        PR_selected_rule.removeNodeFromRule(PR_selected_node);
        PR_refreshNodeFields();
        clearErrorMessage('PR_error');
    }catch(err){
        showErrorMessage('PR_error', err);
    }
};

var addNewNodeIntoProductionRule = function(){

    var nodeName = document.getElementById('PR_nodeName').value;
    if(!nodeName){
        showErrorMessage('PR_error', 'Node name is not provided');
        return;
    }
    if(!P_selected_node){
        showErrorMessage('PR_error', 'Node type is unknown');
        return;
    }
    if(!P_selected_pred){
        showErrorMessage('PR_error', 'Unknown predicate');
        return;
    }
    clearErrorMessage('PR_error');
    putFocusOnDpfNode( PR_selected_rule.addNewNodeInRule(nodeName) );

    document.getElementById('PR_nodeName').value = "";
};

var PR_removeDpfConnection = function(){
    if(PR_selected_arrow == null) {
        showErrorMessage('PR_error', 'Select an edge to delete');
        return;
    }
    try{
        PR_selected_arrow.deleteDpfConnection();
        PR_selected_rule.removeConnectionFromRule(PR_selected_arrow);
        PR_refreshEdgeFields();
        clearErrorMessage('PR_error');
    }catch(err){
        showErrorMessage('PR_error', err);
    }
};

var addNewEdgeIntoProductionRule = function(){

    var edgeName = document.getElementById('PR_edgeName').value;
    if(!edgeName || !PR_selected_rule || !PR_selected_type_arrow || !PR_selected_node_src || !PR_selected_node_trg)
        return;

    // typing validation of source node and target node
    var typeSrcNode_e = PR_selected_type_arrow.fromNode;
    var typeTrgNode_e = PR_selected_type_arrow.toNode;
    var typeSrcNode_n = PR_selected_node_src.typing.type;
    var typeTrgNode_n = PR_selected_node_trg.typing.type;
    if(typeSrcNode_n.ID != typeSrcNode_e.ID){
        showErrorMessage('PR_error', "Type mismatch of the source node");
        return;
    }
    if(typeTrgNode_n.ID != typeTrgNode_e.ID){
        showErrorMessage('PR_error', "Type mismatch of the target node");
        return;
    }

    var ruleSpecification = dpfSpecifications[3];
    var newDpfConn = new DpfConnection(edgeName, PR_selected_node_src, PR_selected_node_trg, ruleSpecification, allConns);
    newDpfConn.drawConnection();

    var typingOfConn = new DpfTypingOfConnection(newDpfConn, PR_selected_type_arrow);
    typingOfConn.drawTypingForConnection();

    PR_selected_rule.conn.push(newDpfConn);

    putFocusOnDpfConnection(newDpfConn);
    PR_selected_node_src = null;
    PR_selected_node_trg = null;

    PR_node_click = 0;

    document.getElementById('PR_EdgeTypeName').value = '';
    document.getElementById('PR_srcNode').value = '';
    document.getElementById('PR_trgNode').value = '';
    document.getElementById('PR_edgeName').value = '';
    clearErrorMessage('PR_error');
};


//todo fix refreshing NAC line
var PR_assignNAC = function(){
    if(!PR_selected_rule){
        showErrorMessage('PR_error', 'Unknown Rule');
        return;
    }
    if(!PR_last_selected_element){
        showErrorMessage('PR_error', 'Select an element from graph');
        return;
    }
    if(PR_last_selected_element.dpfType == 'DpfNode'){
       PR_last_selected_element.setNACTagToNode();
    }
    if(PR_last_selected_element.dpfType == 'DpfConnection'){
        PR_last_selected_element.setNACTagToConnection();
    }
    if(PR_last_selected_element.dpfType == 'DpfAnnotation'){
        PR_last_selected_element.setNACTagToAnnotation();
    }

    PR_selected_rule.elements_in_nac.push(PR_last_selected_element);
};

var PR_assignAddTag = function(){
    if(!PR_selected_rule){
        showErrorMessage('PR_error', 'Unknown Rule');
        return;
    }
    if(!PR_last_selected_element){
        showErrorMessage('PR_error', 'Select an element from graph');
        return;
    }
    if(PR_last_selected_element.dpfType == 'DpfNode'){
        PR_last_selected_element.setAddTagToNode();
    }
    if(PR_last_selected_element.dpfType == 'DpfConnection'){
        PR_last_selected_element.setAddTagToConnection();
    }
    if(PR_last_selected_element.dpfType == 'DpfAnnotation'){
        PR_last_selected_element.setAddTagToAnnotation();
    }
    PR_selected_rule.elements_to_add.push(PR_last_selected_element);
};


var PR_assignDelTag = function(){
    if(!PR_selected_rule){
        showErrorMessage('PR_error', 'Unknown Rule');
        return;
    }
    if(!PR_last_selected_element){
        showErrorMessage('PR_error', 'Select an element from graph');
        return;
    }
    if(PR_last_selected_element.dpfType == 'DpfNode'){
        PR_last_selected_element.setDelTagToNode();
    }
    if(PR_last_selected_element.dpfType == 'DpfConnection'){
        PR_last_selected_element.setDelTagToConnection();
    }
    if(PR_last_selected_element.dpfType == 'DpfAnnotation'){
        PR_last_selected_element.setDelTagToAnnotation();
    }
    PR_selected_rule.elements_to_delete.push(PR_last_selected_element);
};


var prepareAnnotations = function(){
    var predConnections = dpfSpecifications[2].predicates;
    var predHTML = "<ul>";
    for(i = 0; i < predConnections.length; ++i) {
        aPred = predConnections[i];
        predHTML = predHTML + '<li onclick="P_showPredicateForAnnotatingRule(\'' + aPred.name + '\'); PR_showConnectingOptions();">'  + aPred.name + '</li>';
    }
    predHTML = predHTML + '</ul>';

    document.getElementById('annotations').innerHTML = predHTML;
};

var PR_showConnectingOptions = function(pred){
    if(!pred)
        return;

    var optionsHTML = "<table class=\"gridtable\"><tr><th>Predicate Element</th><th>Model Element</th></tr>";

    var nodes = pred.nodes;
    var conn = pred.conn;
    var attachedModelNodes = pred.attachedModelNodes;
    var attachedModelConns = pred.attachedModelConns;

    for(var i = 0; i < nodes.length; ++i){
        optionsHTML = optionsHTML + "<tr><td>" + nodes[i].name + "</td> <td>";
        // check if the element has been bound to any model element
        for(var j = 0; j < attachedModelNodes.length; ++j){
            if(attachedModelNodes[j].srcNode == nodes[i])
                optionsHTML = optionsHTML + attachedModelNodes[j].trgNode.name;
        }
        optionsHTML = optionsHTML + "</td></tr>";
    }
    for(i = 0; i < conn.length; ++i){
        optionsHTML = optionsHTML + "<tr><td>" + conn[i].name + "</td> <td> ";
        // check if the element has been bound to any model element
        for(j = 0; j < attachedModelConns.length; ++j){
            if(attachedModelConns[j].srcConn == conn[i])
                optionsHTML = optionsHTML + attachedModelConns[j].trgConn.name;
        }
        optionsHTML = optionsHTML + "</td></tr>";
    }

    optionsHTML = optionsHTML + "</table><br>";


    optionsHTML += "<table class=\"gridtable\"><tr><th>Parameter Name</th><th>Value</th></tr>";

    var keys = pred.parameters.keys();

    for(i = 0; i < pred.parameters.size; ++i){
        var paramName = keys.next().value;
        var paramVal  = pred.parameters.get(paramName);

        optionsHTML = optionsHTML + "<tr><td>" + paramName + "</td> <td><textarea id='PR_param_" + paramName + "' style='color:#444444;'  rows='1' cols='9'>" + paramVal + "</textarea>";
        optionsHTML = optionsHTML + "</td></tr>";
    }

    optionsHTML = optionsHTML + "</table>";

    document.getElementById('annotOptions').innerHTML = optionsHTML;
    clearErrorMessage('PR_error');
};

var PR_attachModelNodeToPredicate = function(){
    PR_attachAModelNodeToPredicate(P_selected_pred4RuleAnnot, PR_selected_node, P_selected_node);
    PR_showConnectingOptions(P_selected_pred4RuleAnnot);
};

var PR_attachAModelNodeToPredicate = function(selected_pred_const, selected_model_node, selected_pred_node){
    if(!selected_pred_const || !selected_model_node || !selected_pred_node)
        return;

    // check if already exists
    var attachedModelNodes = selected_pred_const.attachedModelNodes;
    for(var j = 0; j < attachedModelNodes.length; ++j){
        if(attachedModelNodes[j].srcNode == selected_pred_node) {
            attachedModelNodes[j].trgNode = selected_model_node;
            return;
        }
    }

    selected_pred_const.attachedModelNodes.push({srcNode: selected_pred_node, trgNode: selected_model_node});
};


var PR_attachModelConnToPredicate = function(){
    if(!P_selected_arrow4RuleAnnot || !PR_selected_arrow || !P_selected_arrow)
        return;

    // check if already exists
    var attachedModelConns = P_selected_arrow4RuleAnnot.attachedModelConns;
    for (var j = 0; j < attachedModelConns.length; ++j) {
        if (attachedModelConns[j].srcConn == P_selected_arrow) {
            attachedModelConns[j].trgConn = PR_selected_arrow;

            PR_attachAModelNodeToPredicate(P_selected_arrow4RuleAnnot, PR_selected_arrow.fromNode, P_selected_arrow.fromNode);
            PR_attachAModelNodeToPredicate(P_selected_arrow4RuleAnnot, PR_selected_arrow.toNode, P_selected_arrow.toNode);

            PR_showConnectingOptions(P_selected_pred4RuleAnnot);
            return;
        }
    }

    P_selected_arrow4RuleAnnot.attachedModelConns.push({srcConn: P_selected_arrow, trgConn: PR_selected_arrow});
    PR_attachAModelNodeToPredicate(P_selected_arrow4RuleAnnot, PR_selected_arrow.fromNode, P_selected_arrow.fromNode);
    PR_attachAModelNodeToPredicate(P_selected_arrow4RuleAnnot, PR_selected_arrow.toNode, P_selected_arrow.toNode);
    PR_showConnectingOptions(P_selected_pred4RuleAnnot);
};


var createAnnotation = function(){

    if(!P_selected_pred4RuleAnnot){
        showErrorMessage('PR_error', 'Predicate is unknown');
        return;
    }
    // check all the nodes and connections are attached to model elements
    var nodes = P_selected_pred4RuleAnnot.nodes;
    var conn = P_selected_pred4RuleAnnot.conn;
    var attachedModelNodes = P_selected_pred4RuleAnnot.attachedModelNodes;
    var attachedModelConns = P_selected_pred4RuleAnnot.attachedModelConns;
    var found = false;
    for(var c = 0; c < conn.length; ++c){
        var aConn = conn[c];
        found = false;
        for(var j = 0; j < attachedModelConns.length; ++j){
            if(attachedModelConns[j].srcConn == aConn){
                found = true;
                break;
            }
        }
        if(found == false){
            showErrorMessage('PR_error', 'Please connect all elements ');
        }
    }
    for(c = 0; c < nodes.length; ++c){
        var aNode = nodes[c];
        found = false;
        for(j = 0; j < attachedModelNodes.length; ++j){
            if(attachedModelNodes[j].srcNode == aNode){
                found = true;
                break;
            }
        }
        if(found == false){
            showErrorMessage('PR_error', 'Please connect all elements ');
        }
    }

    if(!checkGHforPredicateConst(P_selected_pred4RuleAnnot, 'PR_error'))
        return;

    // retrieve the parameter values..
    var constParameters = new Map();
    var constParamText = "";
    if(P_selected_pred4RuleAnnot.parameters.size > 0){
        var keys = P_selected_pred4RuleAnnot.parameters.keys();

        for(var i = 0; i < P_selected_pred4RuleAnnot.parameters.size; ++i){
            var paramName = keys.next().value;
            var paramNameFieldId = 'PR_param_' + paramName;
            var paramValue = document.getElementById(paramNameFieldId).value;
            constParameters.set(paramName, paramValue);
            if(i != 0)
                constParamText += ";";

            constParamText += paramName + ":" + paramValue;
            console.log(paramName);
            console.log(paramValue);
        }
    }

    var annot = new DpfAnnotation(P_selected_pred4RuleAnnot, PR_selected_rule);


    annot.addAnnotations(attachedModelNodes, attachedModelConns);
    annot.drawAnnotation();

    annot.parameters = constParameters;
    annot.parameterText = constParamText;
    annot.processOutputName();

    P_selected_pred4RuleAnnot.attachedModelNodes = [];
    P_selected_pred4RuleAnnot.attachedModelConns = [];
    PR_showConnectingOptions(P_selected_pred4RuleAnnot);

};

var PR_deleteAnnotation = function(){
    if(PR_selected_annotation == null)
        return;
    PR_selected_annotation.deleteAnnotation();
    clearErrorMessage('PR_error');
};