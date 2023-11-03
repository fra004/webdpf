/**
 * Created by rabbi on 2/6/15.
 */



var addNewArityNode = function(){

    var nodeName = document.getElementById('P_nodeName').value;
    if(!nodeName){
        showErrorMessage('error', 'Node name is not provided');
        return;
    }
    if(!P_selected_pred){
        showErrorMessage('error', 'Predicate name is not provided');
        return;
    }
    clearErrorMessage('error');
    P_selected_pred.addNewNodeIntoPredicate(nodeName);
    P_selected_pred.updatePredScript();

    document.getElementById('P_nodeName').value = "";
};

var P_removeDpfNode = function(){
    if(P_selected_node == null) {
        showErrorMessage('error', 'Select a node to delete');
        return;
    }
    try{
        P_selected_node.deleteDpfNode();
        P_selected_pred.removeDpfNodeFromPredicate(P_selected_node);
        refreshFields_PRefresh();
        clearErrorMessage('error');
    }catch(err){
        showErrorMessage('error', err);
    }
};


var refreshFields_PRefresh = function(){
    P_selected_node_src = null;
    document.getElementById('P_nodeName').value = '';
    document.getElementById('P_Edit').disabled = true;
};




var addNewArityEdge = function(){

    var edgeName = document.getElementById('P_edgeName').value;
    if(!edgeName || !P_selected_pred || !P_selected_node_src || !P_selected_node_trg)
        return;


    var predicateSpecification = dpfSpecifications[2];
    var newDpfConn = new DpfConnection(edgeName, P_selected_node_src, P_selected_node_trg, predicateSpecification, allConns);
    newDpfConn.drawConnection();


    P_selected_pred.conn.push(newDpfConn);

};

var refreshEdgeFeilds_PRefresh = function(){
    P_selected_pred.updatePredScript();

    P_selected_node_src = null;
    P_selected_node_trg = null;

    P_node_click = 0;

    document.getElementById('P_srcNode').value = '';
    document.getElementById('P_trgNode').value = '';
    document.getElementById('P_edgeName').value = '';
};

var P_removePredicate = function(){
  if(P_selected_pred == null){
      showErrorMessage('error', 'Select a predicate to delete');
      return;
  }

    var count = 0;
    for (var j = 0; j < theMetaModelStack.metamodel.length; ++j) {
        var modelspec = theMetaModelStack.metamodel[j].modelSpec;
        count = modelspec.predicateConstraints.length;
        while(count > 0){
            for(var p = 0; p < modelspec.predicateConstraints.length; ++p){
                if(modelspec.predicateConstraints[p].predicate == P_selected_pred ) {
                    modelspec.predicateConstraints[p].deletePredicateConstraint();
                    break;
                }
            }
            var count2 = modelspec.predicateConstraints.length;
            if(count == count2)
                break;
            else
                count = count2;
        }
    }

    count = P_selected_pred.completionRules.length;
    while(count > 0){
        C_deleteCompletionRule(P_selected_pred.completionRules[0].ruleId);
        count--;
    }

    count = P_selected_pred.conn.length;
    while(count > 0){
        P_selected_pred.conn[0].deleteDpfConnection();
        P_selected_pred.removeDpfConnectionFromPredicate(P_selected_pred.conn[0]);
        count--;
    }

    count = P_selected_pred.nodes.length;
    while(count > 0){
        P_selected_pred.nodes[0].deleteDpfNode();
        P_selected_pred.removeDpfNodeFromPredicate(P_selected_pred.nodes[0]);
        count--;
    }

    var predList = [];
    for(var i = 0; i < dpfSpecifications[2].predicates.length; ++i){
        if(dpfSpecifications[2].predicates[i] != P_selected_pred)
            predList.push(dpfSpecifications[2].predicates[i]);
    }
    dpfSpecifications[2].predicates = predList;
    P_selected_pred.d_text.remove();

    if(lastOpenedPredicate == P_selected_pred){
        lastOpenedPredicate = null;
        toggle_visibility('editor-frame');
    }

    initializePredicateFields();
    populatePredicateNames(predList);
    preparePredConstraints();
    clearErrorMessage('error');

};

var P_removeDpfConnection = function(){
    if(P_selected_arrow == null) {
        showErrorMessage('error', 'Select an edge to delete');
        return;
    }
    try{
        P_selected_arrow.deleteDpfConnection();
        P_selected_pred.removeDpfConnectionFromPredicate(P_selected_arrow);
        refreshEdgeFeilds_PRefresh();
        clearErrorMessage('error');
    }catch(err){
        showErrorMessage('error', err);
    }
};

var updatePredicateName = function(){
    var newPredName = document.getElementById('P_predName').value;
    if(!newPredName || newPredName == "")
        return;

    if(!dpfSpecifications[2]){
        showErrorMessage('error', 'Unknown Meta-model');
        return;
    }
    var predConnections = dpfSpecifications[2].predicates;
    // check for name conflict
    for(var i = 0; i < predConnections.length; ++i){
        var aPred = predConnections[i];
        if(aPred.name == newPredName) {
            showErrorMessage('error', 'Duplicate predicate name');
            return;
        }
    }


    if(!P_selected_pred){
        P_selected_pred = new DpfPredicate(newPredName, dpfSpecifications[2]);
        P_selected_pred.drawDpfPredicate();
        document.getElementById('P_disp').value = P_selected_pred.displayName;
    }
    else if(newPredName){
        if( ('[' + P_selected_pred.name + ']') == P_selected_pred.displayName){
            var newDisplayName = '[' + newPredName + ']';
            P_selected_pred.updateDisplayName(newDisplayName);
            document.getElementById('P_disp').value = P_selected_pred.displayName;
        }

        P_selected_pred.name = newPredName;
    }

    P_selected_pred.updatePredScript();
    populatePredicateNames(predConnections);
    preparePredConstraints();
    clearErrorMessage('error');
};


var updatePredicateDisplayName = function(){
    var newDispName = document.getElementById('P_disp').value;
    if(!newDispName || newDispName == "")
        return;

    if(!dpfSpecifications[2]){
        showErrorMessage('error', 'Unknown Meta-model');
        return;
    }

    if(!P_selected_pred){
        return;
    }
    P_selected_pred.updateDisplayName(newDispName);
    clearErrorMessage('error');
};

var updatePredicateParameterText = function(){
    var paramText = document.getElementById('P_parameters').value;
    if(!paramText || paramText == "")
        return;
    if(!P_selected_pred)
        return;
    //try {
        P_selected_pred.processParameter(paramText);
        P_selected_pred.processOutputName();
        clearErrorMessage('error');
    //}catch(err){showErrorMessage('error', err);}
};

var populatePredicateNames = function(predConnections){
    var predHTML = "<ul>";
    for(i = 0; i < predConnections.length; ++i) {
        aPred = predConnections[i];
        predHTML = predHTML + '<li>' +
        '<table> <tr> <td>' +
        ' <a onclick="P_showPredicate(\'' + aPred.name + '\')">'  + aPred.name + '</a>' + '</td><td>' +
        '<img  src="images/semantic.png" id="P_Semantic" height="25" width="25" onclick="toggleJSEditor(' + aPred.predicateId + ');" > </td></tr></table>'
        + '</li>';
    }
    predHTML = predHTML + '</ul>';
    document.getElementById('predChk').innerHTML = predHTML;

};

var toggleJSEditor = function(predId){
    var predConnections = dpfSpecifications[2].predicates;
    var thePred = null;
    // check for name conflict
    for(var i = 0; i < predConnections.length; ++i) {
        var aPred = predConnections[i];
        if(aPred.predicateId == predId){
            thePred = aPred;
            break;
        }
    }
    if(thePred == null) {
        console.log('predicate not found to show in the editor');
        return;
    }

    if(saveJSEditorCode() < 0)
        return;

    if(lastOpenedPredicate == thePred){
        lastOpenedPredicate = null;
        toggle_visibility('editor-frame');
    }
    else if(lastOpenedPredicate == null){
        lastOpenedPredicate = thePred;
        thePred.updatePredScript();
        window.frames[0].window.editor.setValue(thePred.predScript + thePred.validateScript, 1);
        toggle_visibility('editor-frame');
    }
    else{
        lastOpenedPredicate = thePred;
        window.frames[0].window.editor.setValue(thePred.predScript + thePred.validateScript, 1);
    }
};

var saveJSEditorCode = function(){
    if(lastOpenedPredicate){
        var theCode = window.frames[0].window.editor.getValue();
        var userCodeIndex = theCode.indexOf("@end auto-generated code");
        if(userCodeIndex < 0) {
            showErrorMessage('P_error', 'Problem in processing js code');
            return -1;
        }
        userCodeIndex += "@end auto-generated code".length;
        var userCode = theCode.substring(userCodeIndex);
        console.log('usercode: ' + userCode);
        lastOpenedPredicate.validateScript = userCode;
    }
    return 0;
}

var connectWithElement = function(){
    if( !P_selected_pred) {
        showErrorMessage('error', 'Predicate name is unknown');
        return;
    }
    if(!P_last_selected_item){
        showErrorMessage('error', 'Select an element to connect with');
        return;
    }

    P_selected_pred.addDpfElementToPredicate( P_last_selected_item);

    clearErrorMessage('error');
};

var P_showPredicate = function(predName){
    prepareBuildingNewPredicate();
    var predicates = dpfSpecifications[2].predicates;
    var thePred = null;
    for(var i = 0; i < predicates.length; ++i){
        if(predicates[i].name == predName){
            thePred = predicates[i];
            break;
        }
    }
    if(thePred == null)
        return;

    P_selected_pred = thePred;

    // bring up the drawing elements in drawingPane[0]
    var nodes= thePred.nodes;

    for(i = 0; i < nodes.length; ++i){
        nodes[i].d_text.show();
        nodes[i].d_node.show();
    }

    var conn = thePred.conn;
    for(var j = 0; j < conn.length; ++j){
        conn[j].d_text.show();

        var lines = conn[j].d_lines;
        for (var k = 0; k < lines.length; ++k) {
            lines[k].show();
        }
    }

    thePred.d_text.show();
    lines = thePred.d_lines;
    for (k = 0; k < lines.length; ++k) {
        lines[k].show();
    }

    document.getElementById('P_predName').value = thePred.name;
    document.getElementById('P_parameters').value = thePred.parameterText;
    document.getElementById('P_disp').value = thePred.displayName;

    cleanupCompletionRulePane(false);
    // make completion rule table
    makeCompletionRuleTable();

    cleanupProductionRulePane(false);
    // make production rule table
    makeProductionRuleTable();
};

var prepareBuildingNewPredicate = function(){
    clearErrorMessage('error');
    if(P_selected_pred || P_selected_pred4RuleAnnot){
        // clean up the drawing area from diagramPane[2]
        var spec = dpfSpecifications[2];
        cleanupDrawingPane(spec);
        /*
        var nodes = spec.nodes;
        var connections = spec.connections;
        var predicates = spec.predicates;

        for (j = 0; j < nodes.length; ++j) {
            var node = nodes[j];
            node.d_node.hide();
            node.d_text.hide();
        }
        for (j = 0; j < connections.length; ++j) {
            var conn = connections[j];
            conn.d_text.hide();
            var lines = conn.d_lines;
            for (k = 0; k < lines.length; ++k) {
                lines[k].hide();
            }
        }
        for(j = 0; j < predicates.length; ++j){
            predicates[j].d_text.hide();
            lines = predicates[j].d_lines;
            for (k = 0; k < lines.length; ++k) {
                lines[k].hide();
            }
        }*/
    }

    initializePredicateFields();
    // clear completion rule drawingPane and fields..
    cleanupCompletionRulePane(true);

};

var initializePredicateFields = function(){
    P_selected_node = null;
    P_selected_node_src = null;
    P_selected_node_trg = null;

    P_node_click = 0;

    P_selected_pred = null;
    P_selected_arrow = null;


    document.getElementById('P_nodeName').value = '';
    document.getElementById('P_srcNode').value = '';
    document.getElementById('P_trgNode').value = '';
    document.getElementById('P_edgeName').value = '';

    document.getElementById('P_predName').value = '';
    document.getElementById('P_parameters').value = '';
    document.getElementById('P_disp').value = '';
    document.getElementById('P_selectedElementName').value = '';

};


var PeditNode = function(){
    if(P_selected_node)
        P_selected_node.editNode('P_nodeName', null);
};

var PeditEdge = function(){
    if(P_selected_arrow)
        P_selected_arrow.editDpfConnection('P_edgeName', null, P_selected_node_src, P_selected_node_trg);
};


var P_showPredicateForAnnotatingRule = function(predName){
    var spec = dpfSpecifications[2];
    cleanupDrawingPane(spec, true);
    var predicates = dpfSpecifications[2].predicates;
    var thePred = null;
    for(var i = 0; i < predicates.length; ++i){
        if(predicates[i].name == predName){
            thePred = predicates[i];
            break;
        }
    }
    if(thePred == null)
        return;

    P_selected_pred4RuleAnnot = thePred;

    // bring up the drawing elements in drawingPane[0]
    var nodes= thePred.nodes;

    for(i = 0; i < nodes.length; ++i){
        nodes[i].d_text.show();
        nodes[i].d_node.show();
    }

    var conn = thePred.conn;
    for(var j = 0; j < conn.length; ++j){
        conn[j].d_text.show();

        var lines = conn[j].d_lines;
        for (var k = 0; k < lines.length; ++k) {
            lines[k].show();
        }
    }

    thePred.d_text.show();
    lines = thePred.d_lines;
    for (k = 0; k < lines.length; ++k) {
        lines[k].show();
    }

};