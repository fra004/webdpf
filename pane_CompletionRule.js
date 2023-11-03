/**
 * Created by rabbi on 2/13/15.
 */

var displayNodeTypingOfRules = function () {
    if(!C_selected_rule)
        return;
    var nodeTypingSetting = document.getElementById("C_nodeTyping").checked;
    switch (nodeTypingSetting) {
        case true:
            var nodes = C_selected_rule.nodes;
            for(var i = 0; i < nodes.length; ++i){
                nodes[i].typing.d_line.show();
            }

            break;
        case false:
            nodes = C_selected_rule.nodes;
            for(i = 0; i < nodes.length; ++i){
                nodes[i].typing.d_line.hide();
            }
            break;
    }
};



var displayEdgeTypingOfRules = function () {
    if(!C_selected_rule)
        return;
    var edgeTypingSetting = document.getElementById("C_edgeTyping").checked;
    switch (edgeTypingSetting) {
        case true:
            var conns = C_selected_rule.conn;
            for(var j = 0; j < conns.length; ++j){
                conns[j].typing.d_line.show();
            }
            break;
        case false:
            conns = C_selected_rule.conn;
            for(j = 0; j < conns.length; ++j){
                conns[j].typing.d_line.hide();
            }
            break;
    }
};


var buildNewRule = function(){
    clearErrorMessage('C_error');
    if(!P_selected_pred){
        showErrorMessage('C_error', 'Unknown Predicate');
        return;
    }
    cleanupCompletionRulePane(false);
    C_selected_rule = new DpfCompletionRule(P_selected_pred, dpfSpecifications[3], 'DpfCompletionRule', 1);
    document.getElementById('C_RuleId').value = C_selected_rule.ruleId;
    document.getElementById('C_RuleLayer').value = "1";
    makeCompletionRuleTable();
    makeCompletionRuleLayerTable();
};

var updateLayerNumber = function(){
    var layerNumber = document.getElementById('C_RuleLayer').value;
    if(!layerNumber || layerNumber == "")
        return;

    if(!dpfSpecifications[2]){
        showErrorMessage('C_error', 'Unknown Meta-model');
        return;
    }

    if(C_selected_rule == null){
        showErrorMessage('C_error', 'Unknown Rule');
        return;
    }
    C_selected_rule.layerNumber = parseInt(layerNumber);
    makeCompletionRuleLayerTable();
    clearErrorMessage('C_error');
};


var makeCompletionRuleTable= function(){
    if(!P_selected_pred)
        return;
    var completionRules = P_selected_pred.completionRules;
    var ruleHTML = "<ul>";
    for(var i = 0; i < completionRules.length; ++i) {
        var aRule = completionRules[i];
        ruleHTML = ruleHTML + '<li>' +
        '<table> <tr> <td>' +
        ' <a onclick="C_showRule(' + aRule.ruleId + ')"> Rule: '  + aRule.ruleId + '</a>' + '</td><td>' +
        '<img  src="images/remove.png"  height="25" width="25" onclick="C_deleteCompletionRule(' + aRule.ruleId + ')" > </td></tr></table> </li>';
    }
    ruleHTML = ruleHTML + '</ul>';
    document.getElementById('ruleChk').innerHTML = ruleHTML;
};

var makeCompletionRuleLayerTable= function(){
    var ruleHTML = "<ul>";
    var sortedRules = [];
    if(allRules.length > 0) {

        for(var i = 0; i < allRules.length; ++i){
            sortedRules.push(allRules[i]);
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
        allRules = sortedRules;

        for (i = 0; i < sortedRules.length; ++i) {
            aRule = sortedRules[i];
            ruleHTML = ruleHTML + '<li>' +
            '<table> <tr> <td>' +
            ' <a onclick="C_showRuleWithPredicate(' + aRule.ruleId + ')"> Rule: ' + aRule.ruleId + '</a>' + '</td>' +
            '<td>Layer No: ' + aRule.layerNumber + '</td></tr></table> </li>';
        }
    }
    ruleHTML = ruleHTML + '</ul>';
    document.getElementById('ruleLayer').innerHTML = ruleHTML;
};

var cleanupCompletionRulePane = function(flag){
    //if(C_selected_rule){
        // clean up the drawing area from diagramPane[3]
        cleanupDrawingPane(dpfSpecifications[3]);
        //console.log('cleanupDrawingPane(dpfSpecifications[3])');
    //}

    initializeRuleFields();

    if(flag){
        var ruleHTML = "<ul>";
        ruleHTML = ruleHTML + '</ul>';
        document.getElementById('ruleChk').innerHTML = ruleHTML;
    }
};

var C_showRuleWithPredicate = function(ruleId){
    var theRule = null;
    for(var i = 0; i < allRules.length; ++i){
        if(allRules[i].ruleId == ruleId){
            theRule = allRules[i]; break;
        }
    }
    if(theRule == null) {
        showErrorMessage('C_error', 'Rule not found')
        return;
    }

    P_showPredicate(theRule.parentPredicate.name);
    C_showRule(ruleId);
};

var C_showRule = function(ruleId){
    cleanupDrawingPane(dpfSpecifications[3]);
    initializeRuleFields();
    var completionRules = P_selected_pred.completionRules;
    var theRule = null;
    for(var i = 0; i < completionRules.length; ++i){
        if(completionRules[i].ruleId == ruleId){
            theRule = completionRules[i];
            break;
        }
    }
    if(theRule == null)
        return;

    C_selected_rule = theRule;

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

    document.getElementById('C_RuleId').value = theRule.ruleId;
    document.getElementById('C_RuleLayer').value = theRule.layerNumber;
    displayNodeTypingOfRules();
    displayEdgeTypingOfRules();
};

var initializeRuleFields = function(){
    C_selected_node = null;
    //C_selected_type_arrow = null;
    //C_selected_type_node = null;
    C_selected_node_src = null;
    C_selected_node_trg = null;

    C_node_click = 0;

    C_selected_rule = null;
    C_selected_arrow = null;

    document.getElementById('C_RuleLayer').value = '';
    document.getElementById('C_typeName').value = '';
    document.getElementById('C_nodeName').value = '';
    document.getElementById('C_EdgeTypeName').value = '';
    document.getElementById('C_srcNode').value = '';
    document.getElementById('C_trgNode').value = '';
    document.getElementById('C_edgeName').value = '';
};


var C_refreshEdgeFields = function(){
    C_selected_node_src = null;
    C_selected_node_trg = null;

    C_node_click = 0;

    C_selected_arrow = null;

    document.getElementById('C_EdgeTypeName').value = '';
    document.getElementById('C_srcNode').value = '';
    document.getElementById('C_trgNode').value = '';
    document.getElementById('C_edgeName').value = '';
};

var C_refreshNodeFields = function(){
    C_selected_node = null;
    C_selected_node_src = null;
    C_selected_node_trg = null;

    C_node_click = 0;

    C_selected_arrow = null;

    document.getElementById('C_EdgeTypeName').value = '';
    document.getElementById('C_edgeName').value = '';
};


var C_deleteCompletionRule = function(ruleId){
    var theRule = null;
    for(var i = 0; i < allRules.length; ++i){
        if(allRules[i].ruleId == ruleId){
            theRule = allRules[i];
            break;
        }
    }

    if( C_selected_rule != null && C_selected_rule.ruleId == theRule.ruleId )
        initializeRuleFields();

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

    theRule.parentPredicate.removeRuleFromPredicate(theRule);
    var allRules2 = [];
    for(i = 0; i < allRules.length; ++i){
        if(allRules[i].ruleId != theRule.ruleId)
            allRules2.push(allRules[i]);
    }
    allRules = allRules2;
    makeCompletionRuleTable();
    makeCompletionRuleLayerTable();
};

var C_removeDpfNode = function(){
    if(C_selected_node == null) {
        showErrorMessage('C_error', 'Select a node to delete');
        return;
    }
    try{
        C_selected_node.deleteDpfNode();
        C_selected_rule.removeNodeFromRule(C_selected_node);
        C_refreshNodeFields();
        clearErrorMessage('C_error');
    }catch(err){
        showErrorMessage('C_error', err);
    }
};

var addNewNodeIntoCompletionRule = function(){

    var nodeName = document.getElementById('C_nodeName').value;
    if(!nodeName){
        showErrorMessage('C_error', 'Node name is not provided');
        return;
    }
    if(!P_selected_node){
        showErrorMessage('C_error', 'Node type is unknown');
        return;
    }
    if(!P_selected_pred){
        showErrorMessage('C_error', 'Unknown predicate');
        return;
    }
    clearErrorMessage('C_error');
    putFocusOnDpfNode( C_selected_rule.addNewNodeInRule(nodeName) );

    document.getElementById('C_nodeName').value = "";
};

var C_removeDpfConnection = function(){
    if(C_selected_arrow == null) {
        showErrorMessage('C_error', 'Select an edge to delete');
        return;
    }
    try{
        C_selected_arrow.deleteDpfConnection();
        C_selected_rule.removeConnectionFromRule(C_selected_arrow);
        C_refreshEdgeFields();
        clearErrorMessage('C_error');
    }catch(err){
        showErrorMessage('C_error', err);
    }
};

var addNewEdgeIntoCompletionRule = function(){

    var edgeName = document.getElementById('C_edgeName').value;
    if(!edgeName || !C_selected_rule || !C_selected_type_arrow || !C_selected_node_src || !C_selected_node_trg)
        return;

    // typing validation of source node and target node
    var typeSrcNode_e = C_selected_type_arrow.fromNode;
    var typeTrgNode_e = C_selected_type_arrow.toNode;
    var typeSrcNode_n = C_selected_node_src.typing.type;
    var typeTrgNode_n = C_selected_node_trg.typing.type;
    if(typeSrcNode_n.ID != typeSrcNode_e.ID){
        showErrorMessage('C_error', "Type mismatch of the source node");
        return;
    }
    if(typeTrgNode_n.ID != typeTrgNode_e.ID){
        showErrorMessage('C_error', "Type mismatch of the target node");
        return;
    }

    var ruleSpecification = dpfSpecifications[3];
    var newDpfConn = new DpfConnection(edgeName, C_selected_node_src, C_selected_node_trg, ruleSpecification, allConns);
    newDpfConn.drawConnection();

    var typingOfConn = new DpfTypingOfConnection(newDpfConn, C_selected_type_arrow);
    typingOfConn.drawTypingForConnection();

    C_selected_rule.conn.push(newDpfConn);

    putFocusOnDpfConnection(newDpfConn);
    C_selected_node_src = null;
    C_selected_node_trg = null;

    C_node_click = 0;

    document.getElementById('C_EdgeTypeName').value = '';
    document.getElementById('C_srcNode').value = '';
    document.getElementById('C_trgNode').value = '';
    document.getElementById('C_edgeName').value = '';
    clearErrorMessage('C_error');
};


//todo fix refreshing NAC line
var assignNAC = function(){
    if(!C_selected_rule){
        showErrorMessage('C_error', 'Unknown Rule');
        return;
    }
    if(!C_last_selected_element){
        showErrorMessage('C_error', 'Select an element from graph');
        return;
    }
    if(C_last_selected_element.dpfType == 'DpfNode'){
       C_last_selected_element.setNACTagToNode();
    }
    if(C_last_selected_element.dpfType == 'DpfConnection'){
        C_last_selected_element.setNACTagToConnection();
    }
    C_selected_rule.elements_in_nac.push(C_last_selected_element);
};

var assignAddTag = function(){
    if(!C_selected_rule){
        showErrorMessage('C_error', 'Unknown Rule');
        return;
    }
    if(!C_last_selected_element){
        showErrorMessage('C_error', 'Select an element from graph');
        return;
    }
    if(C_last_selected_element.dpfType == 'DpfNode'){
        C_last_selected_element.setAddTagToNode();
    }
    if(C_last_selected_element.dpfType == 'DpfConnection'){
        C_last_selected_element.setAddTagToConnection();
    }
    C_selected_rule.elements_to_add.push(C_last_selected_element);
};


var assignDelTag = function(){
    if(!C_selected_rule){
        showErrorMessage('C_error', 'Unknown Rule');
        return;
    }
    if(!C_last_selected_element){
        showErrorMessage('C_error', 'Select an element from graph');
        return;
    }
    if(C_last_selected_element.dpfType == 'DpfNode'){
        C_last_selected_element.setDelTagToNode();
    }
    if(C_last_selected_element.dpfType == 'DpfConnection'){
        C_last_selected_element.setDelTagToConnection();
    }
    C_selected_rule.elements_to_delete.push(C_last_selected_element);
};