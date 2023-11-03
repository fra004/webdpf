/**
 * Created by rabbi on 2/4/15.
 */

    var nodeTypingSetting = false;
    var edgeTypingSetting = false;


var turnOnSimulation = function(){
  simulateFlag = !simulateFlag;
};

var displayNodeTyping = function () {
    nodeTypingSetting = document.getElementById("nodeTyping").checked;
    switch (nodeTypingSetting) {
        case true:

            var nodes = dpfSpecifications[1].nodes;
            for(var i = 0; i < nodes.length; ++i){
                if(nodes[i].typing) {
                    if (nodes[i].displayFlag == 0) {
                        if (nodes[i].typing.type.spec == dpfSpecifications[0] && nodes[i].typing.type.displayFlag == 0)
                            nodes[i].typing.d_line.show();
                        else {
                            nodes[i].typing.d_line.hide();
                        }
                    }
                    else
                        nodes[i].typing.d_line.hide();
                }
            }

            break;
        case false:
            nodes = dpfSpecifications[1].nodes;
            for(i = 0; i < nodes.length; ++i){
                nodes[i].typing.d_line.hide();
            }
            break;
    }
};



var displayEdgeTyping = function () {
    edgeTypingSetting = document.getElementById("edgeTyping").checked;
    switch (edgeTypingSetting) {
        case true:
            var conns = dpfSpecifications[1].connections;
            for(var j = 0; j < conns.length; ++j){
                if(conns[j].typing) {
                    if (conns[j].displayFlag == 0) {
                        if (conns[j].typing.type.spec == dpfSpecifications[0] && conns[j].typing.type.displayFlag == 0)
                            conns[j].typing.d_line.show();
                        else
                            conns[j].typing.d_line.hide();
                    }
                    else
                        conns[j].typing.d_line.hide();
                }
            }
            break;
        case false:
            conns = dpfSpecifications[1].connections;
            for(j = 0; j < conns.length; ++j){
                conns[j].typing.d_line.hide();
            }
            break;
    }
};


var addNewDpfNode = function(){

    if(!M_selected_metamodel){
        showErrorMessage('M_error', 'Unknown metamodel.');
        return;
    }
    var xPos = 0;
    var yPos = 0;
    var specification = null;

    console.log(M_selected_metamodel);
    console.log(M_selected_model);

    if(M_selected_model.metaLevel == 0){
        specification= dpfSpecifications[0];
        xPos = drawingPane[0].attr('x') + 20;
        yPos = drawingPane[0].attr('y') + 20;
    }
    else {
        specification = dpfSpecifications[1];
        xPos = drawingPane[1].attr('x') + 20;
        yPos = drawingPane[1].attr('y') + 20;
    }

    var nodeName = document.getElementById('M_nodeName').value;
    if(!nodeName)
        return;

    if(M_selected_model.metaLevel > 0 ){
        if(!M_selected_type_node)
            return;

        if(M_selected_metamodel.metaLevel > M_selected_model.metaLevel)
            return;
        else if( (M_selected_metamodel.metaModelSpec == dpfSpecifications[0]  && ( M_selected_model.metaLevel - M_selected_metamodel.metaLevel >= 1 ))
              || (M_selected_metamodel.modelSpec == dpfSpecifications[0]  && ( M_selected_model.metaLevel - M_selected_metamodel.metaLevel > 1 ))
              ){
            if(!M_selected_type_node.deepCp) {
                showErrorMessage('M_error', 'Cannot instantiate the node');
                return;
            }
        }
    }


    var newDpfNode = new DpfNode(nodeName, specification, allNodes);
    newDpfNode.deepCp = document.getElementById('M_deepCpNode').checked ? 1 : 0;
    newDpfNode.setNodePosition(xPos, yPos);
    newDpfNode.drawNode();

    if(M_selected_model.metaLevel > 0) {
        var typingOfNode = new DpfTypingOfNode(newDpfNode, M_selected_type_node);
        typingOfNode.drawTypingForNode();
    }

    putFocusOnDpfNode(newDpfNode);
    M_selected_node = null;
    document.getElementById('M_nodeName').value = "";
    clearErrorMessage('M_error');
};

var M_removeDpfNode = function(){
    if(M_selected_node == null) {
        showErrorMessage('M_error', 'Select a node to delete');
        return;
    }
    try{
        M_selected_node.deleteDpfNode();
        refreshFields();
        clearErrorMessage('M_error');
    }catch(err){
        showErrorMessage('M_error', err);
    }
};



var refreshFields = function(){
    M_selected_node = null;
    M_selected_type_node = null;
    document.getElementById('M_typeName').value = '';
    document.getElementById('M_nodeName').value = '';
    document.getElementById('M_Edit').disabled = true;
};



var addNewDpfConnection = function(){

    var edgeName = document.getElementById('M_edgeName').value;
    if(!edgeName ||  !M_selected_node_src || !M_selected_node_trg)
        return;

    var spec = null;
    var newDpfConn = null;

    if(M_selected_model.metaLevel > 0 ){
        if(!M_selected_type_arrow)
            return;

        if(M_selected_metamodel.metaLevel > M_selected_model.metaLevel)
            return;
        else if( (M_selected_metamodel.metaModelSpec == dpfSpecifications[0]  && ( M_selected_model.metaLevel - M_selected_metamodel.metaLevel >= 1 ))
            || (M_selected_metamodel.modelSpec == dpfSpecifications[0]  && ( M_selected_model.metaLevel - M_selected_metamodel.metaLevel > 1 ))
            ){
            if(!M_selected_type_arrow.deepCp) {
                showErrorMessage('M_error', 'Cannot instantiate the edge');
                return;
            }
        }
    }


    if(M_selected_model.metaLevel == 0){
        spec = dpfSpecifications[0];
        newDpfConn = new DpfConnection(edgeName, M_selected_node_src, M_selected_node_trg, spec, allConns);
        newDpfConn.deepCp = document.getElementById('M_deepCpEdge').checked ? 1 : 0;
        newDpfConn.drawConnection();
    }
    else{
        spec = dpfSpecifications[1];
        // typing validation of source node and target node
        var typeSrcNode_e = M_selected_type_arrow.fromNode;
        var typeTrgNode_e = M_selected_type_arrow.toNode;
        var typeSrcNode_n = M_selected_node_src.typing.type;
        var typeTrgNode_n = M_selected_node_trg.typing.type;
        var flag = false, nodeType;

        console.log(M_selected_type_arrow.deepCp);
        if(M_selected_type_arrow.deepCp == true){
            if (typeSrcNode_n.ID != typeSrcNode_e.ID) {
                // try ancestors..
                nodeType = typeSrcNode_n;
                while(nodeType != null){
                    if(nodeType.ID == typeSrcNode_e.ID){
                        flag = true; break;
                    }
                    if(nodeType.spec == typeSrcNode_e.spec)
                        break;

                    if(nodeType.typing)
                        nodeType = nodeType.typing.type;
                    else
                        break;
                }
                if(flag == false) {
                    showErrorMessage('M_error', "Type mismatch of the source node");
                    return;
                }
            }
            if (typeTrgNode_n.ID != typeTrgNode_e.ID) {
                // try ancestors
                flag = false;
                nodeType = typeTrgNode_n;
                while(nodeType != null){
                    if(nodeType.ID == typeTrgNode_e.ID){
                        flag = true; break;
                    }
                    if(nodeType.spec == typeTrgNode_e.spec)
                        break;

                    if(nodeType.typing)
                        nodeType = nodeType.typing.type;
                    else
                        break;
                }
                if(flag == false) {
                    showErrorMessage('M_error', "Type mismatch of the target node");
                    return;
                }
            }
        }
        else {
            if (typeSrcNode_n.ID != typeSrcNode_e.ID) {
                showErrorMessage('M_error', "Type mismatch of the source node");
                return;
            }
            if (typeTrgNode_n.ID != typeTrgNode_e.ID) {
                showErrorMessage('M_error', "Type mismatch of the target node");
                return;
            }
        }

        newDpfConn = new DpfConnection(edgeName, M_selected_node_src, M_selected_node_trg, spec, allConns);
        newDpfConn.deepCp = document.getElementById('M_deepCpEdge').checked ? 1 : 0;
        newDpfConn.drawConnection();

        var typingOfConn = new DpfTypingOfConnection(newDpfConn, M_selected_type_arrow);
        typingOfConn.drawTypingForConnection();
    }

    putFocusOnDpfConnection(newDpfConn);
    M_selected_node_src = null;
    M_selected_node_trg = null;

    document.getElementById('M_srcNode').value = '';
    document.getElementById('M_trgNode').value = '';
    document.getElementById('M_edgeName').value = '';
    document.getElementById('M_EdgeEdit').disabled = true;
    clearErrorMessage('M_error');
};

var MeditNode = function(){
    if(M_selected_node) {
        M_selected_node.editNode('M_nodeName', M_selected_type_node);
        clearErrorMessage('M_error');
    }

};

var M_removeDpfConnection = function(){
    if(M_selected_arrow == null) {
        showErrorMessage('M_error', 'Select an edge to delete');
        return;
    }
    try{
        M_selected_arrow.deleteDpfConnection();
        refreshEdgeFields();
        clearErrorMessage('M_error');
    }catch(err){
        showErrorMessage('M_error', err);
    }
};

var MeditEdge = function(){
    if(M_selected_arrow) {
        M_selected_arrow.editDpfConnection('M_edgeName', M_selected_type_arrow, M_selected_node_src, M_selected_node_trg);
        clearErrorMessage('M_error');
    }
};

var refreshEdgeFields = function(){
    M_node_click = 0;
    M_selected_node_src = null;
    M_selected_node_trg = null;

    document.getElementById('M_EdgeTypeName').value = '';
    document.getElementById('M_srcNode').value = '';
    document.getElementById('M_trgNode').value = '';
    document.getElementById('M_edgeName').value = '';
    document.getElementById('M_EdgeEdit').disabled = true;
};

var preparePredConstraints = function(){
    var predConnections = dpfSpecifications[2].predicates;
    var predHTML = "<ul>";
    for(i = 0; i < predConnections.length; ++i) {
        aPred = predConnections[i];
        predHTML = predHTML + '<li onclick="P_showPredicate(\'' + aPred.name + '\'); showConnectingOptions();">'  + aPred.name + '</li>';
    }
    predHTML = predHTML + '</ul>';

    document.getElementById('predConst').innerHTML = predHTML;
    prepareAnnotations();
};

var showConnectionsOfPredConst = function(){
    if(!M_selected_predicate_const)
        return;

    var optionsHTML = "<table class=\"gridtable\"><tr><th>Predicate Element</th><th>Model Element</th></tr>";

    var attachedModelNodes = M_selected_predicate_const.attachedModelNodes;
    var attachedModelConns = M_selected_predicate_const.attachedModelConns;

    for(var i = 0; i < attachedModelNodes.length; ++i){
        optionsHTML = optionsHTML + "<tr><td>" + attachedModelNodes[i].srcNode.name + "</td> <td>";
        optionsHTML = optionsHTML + attachedModelNodes[i].trgNode.name;
        optionsHTML = optionsHTML + "</td></tr>";
    }
    for(i = 0; i < attachedModelConns.length; ++i){
        optionsHTML = optionsHTML + "<tr><td>" + attachedModelConns[i].srcConn.name + "</td> <td> ";
        optionsHTML = optionsHTML + attachedModelConns[i].trgConn.name;
        optionsHTML = optionsHTML + "</td></tr>";
    }

    optionsHTML = optionsHTML + "</table><br>";


    optionsHTML += "<table class=\"gridtable\"><tr><th>Parameter Name</th><th>Value</th></tr>";

    var keys = M_selected_predicate_const.parameters.keys();

    for(i = 0; i < M_selected_predicate_const.parameters.size; ++i){
        var paramName = keys.next().value;
        var paramVal  = M_selected_predicate_const.parameters.get(paramName);

        optionsHTML = optionsHTML + "<tr><td>" + paramName + "</td> <td><textarea id='M_param_" + paramName + "' style='color:#444444;'  rows='1' cols='9'>" + paramVal + "</textarea>";
        optionsHTML = optionsHTML + "</td></tr>";
    }

    optionsHTML = optionsHTML + "</table>";

    document.getElementById('predOptions').innerHTML = optionsHTML;
    M_clearErrorMessage();
};


var showConnectingOptions = function(){
    if(!P_selected_pred)
        return;

    M_selected_predicate = P_selected_pred;
    var optionsHTML = "<table class=\"gridtable\"><tr><th>Predicate Element</th><th>Model Element</th></tr>";

    var nodes = M_selected_predicate.nodes;
    var conn = M_selected_predicate.conn;
    var attachedModelNodes = M_selected_predicate.attachedModelNodes;
    var attachedModelConns = M_selected_predicate.attachedModelConns;

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

    var keys = M_selected_predicate.parameters.keys();

    for(i = 0; i < M_selected_predicate.parameters.size; ++i){
        var paramName = keys.next().value;
        var paramVal  = M_selected_predicate.parameters.get(paramName);

        optionsHTML = optionsHTML + "<tr><td>" + paramName + "</td> <td><textarea id='M_param_" + paramName + "' style='color:#444444;'  rows='1' cols='9'>" + paramVal + "</textarea>";
        optionsHTML = optionsHTML + "</td></tr>";
    }

    optionsHTML = optionsHTML + "</table>";

    document.getElementById('predOptions').innerHTML = optionsHTML;
    M_clearErrorMessage();
};


var attachAModelNodeToPredicate = function(selected_pred_const, selected_model_node, selected_pred_node){
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

var attachModelNodeToPredicate = function(){
    attachAModelNodeToPredicate(M_selected_predicate, M_selected_node, P_selected_node);
    showConnectingOptions();
};


var attachModelConnToPredicate = function(){
    if(!M_selected_predicate || !M_selected_arrow || !P_selected_arrow)
        return;

        // check if already exists
        var attachedModelConns = M_selected_predicate.attachedModelConns;
        for (var j = 0; j < attachedModelConns.length; ++j) {
            if (attachedModelConns[j].srcConn == P_selected_arrow) {
                attachedModelConns[j].trgConn = M_selected_arrow;

                attachAModelNodeToPredicate(M_selected_predicate, M_selected_arrow.fromNode, P_selected_arrow.fromNode);
                attachAModelNodeToPredicate(M_selected_predicate, M_selected_arrow.toNode, P_selected_arrow.toNode);

                showConnectingOptions();
                return;
            }
        }

        M_selected_predicate.attachedModelConns.push({srcConn: P_selected_arrow, trgConn: M_selected_arrow});
        attachAModelNodeToPredicate(M_selected_predicate, M_selected_arrow.fromNode, P_selected_arrow.fromNode);
        attachAModelNodeToPredicate(M_selected_predicate, M_selected_arrow.toNode, P_selected_arrow.toNode);
        showConnectingOptions();
};

var M_showErrorMessage = function(message){
    document.getElementById('M_error').innerHTML = '<p>Error: ' + message + '</p>';
};
var M_clearErrorMessage = function(){
    document.getElementById('M_error').innerHTML = '';
};


var createPredicateConstraint = function(){

    if(!M_selected_predicate){
        M_showErrorMessage('Predicate is unknown');
        return;
    }
    // check all the nodes and connections are attached to model elements
    var nodes = M_selected_predicate.nodes;
    var conn = M_selected_predicate.conn;
    var attachedModelNodes = M_selected_predicate.attachedModelNodes;
    var attachedModelConns = M_selected_predicate.attachedModelConns;
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
            M_showErrorMessage('Please connect all elements ');
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
            M_showErrorMessage('Please connect all elements ');
        }
    }

    if(!checkGHforPredicateConst(M_selected_predicate, 'M_error'))
        return;

    // retrieve the parameter values..
    var constParameters = new Map();
    var constParamText = "";
    if(M_selected_predicate.parameters.size > 0){
        var keys = M_selected_predicate.parameters.keys();

        for(var i = 0; i < M_selected_predicate.parameters.size; ++i){
            var paramName = keys.next().value;
            var paramNameFieldId = 'M_param_' + paramName;
            var paramValue = document.getElementById(paramNameFieldId).value;
            constParameters.set(paramName, paramValue);
            if(i != 0)
                constParamText += ";";

            constParamText += paramName + ":" + paramValue;
            console.log(paramName);
            console.log(paramValue);
        }
    }

    var dpfConstraint = new DpfPredicateConstraint(M_selected_predicate, dpfSpecifications[1]);


    dpfConstraint.addConstraint(attachedModelNodes, attachedModelConns);
    dpfConstraint.drawConstraint();

    dpfConstraint.parameters = constParameters;
    dpfConstraint.parameterText = constParamText;
    dpfConstraint.processOutputName();

    M_selected_predicate.attachedModelNodes = [];
    M_selected_predicate.attachedModelConns = [];
    showConnectingOptions();

};


var checkGHforPredicateConst = function(selected_predicate, errorTag){
    if(!selected_predicate){
        return false;
    }
    // check graph homomorphism
    var nodes = selected_predicate.nodes;
    var conn = selected_predicate.conn;
    var attachedModelNodes = selected_predicate.attachedModelNodes;
    var attachedModelConns = selected_predicate.attachedModelConns;
    for(var i = 0; i < attachedModelConns.length; ++i){
        var connP1 = attachedModelConns[i].srcConn;
        var X1 = connP1.fromNode;
        var Y1 = connP1.toNode;

        var connM1 = attachedModelConns[i].trgConn;
        var X2 = connM1.fromNode;
        var Y2 = connM1.toNode;

        if(X1.ID == Y1.ID ){
            if(X2.ID != Y2.ID){
                showErrorMessage(errorTag, 'Predicate structure is not preserved');
                return false;
            }
        }


        for(var j = 0; j < attachedModelConns.length; ++j){
            if( i == j ) continue;
            var connP2 = attachedModelConns[j].srcConn;
            var X11 = connP2.fromNode;
            var Y11 = connP2.toNode;

            var connM2 = attachedModelConns[j].trgConn;
            var X22 = connM2.fromNode;
            var Y22 = connM2.toNode;

            if(X1.ID == X11.ID){
                if(X2.ID != X22.ID){
                    showErrorMessage(errorTag, 'Predicate structure is not preserved');
                    return false;
                }
            }
            if(X1.ID == Y11.ID){
                if(X2.ID != Y22.ID){
                    showErrorMessage(errorTag, 'Predicate structure is not preserved');
                    return false;
                }
            }
            if(Y1.ID == X11.ID){
                if(Y2.ID != X22.ID){
                    showErrorMessage(errorTag, 'Predicate structure is not preserved');
                    return false;
                }
            }
            if(Y1.ID == Y11.ID){
                if(Y2.ID != Y22.ID){
                    showErrorMessage(errorTag, 'Predicate structure is not preserved');
                    return false;
                }
            }
        }
    }
    return true;
};



var M_deletePredicateConstraint = function(){
    if(M_selected_predicate_const == null)
        return;
    M_selected_predicate_const.deletePredicateConstraint();
    clearErrorMessage('M_error');
};


var populateModelOptions = function(){
  var mHtml = "<table> " +
       " <tr><td>MetaModel:</td><td> " +
       " <select id='selectMeta'  onchange='M_selectMetaModel();'>" ;

        for(var i = 0; i < theMetaModelStack.metamodel.length; ++i){
           mHtml += " <option value='" + i + "'>" + theMetaModelStack.metamodel[i].name + "</option> ";
            if(i + 2 >= theMetaModelStack.metamodel.length)
                break;
        }

       mHtml += " </select> " +
       " </td></tr> " +
       " <tr><td>Model:</td><td> " +
       " <select id='selectModel' onchange='M_selectModelInstance();' > ";
        for(i = 1; i < theMetaModelStack.metamodel.length; ++i){
            mHtml += " <option value='" + i + "'>" + theMetaModelStack.metamodel[i].name + "</option> ";
        }
       mHtml += " </select> " +
       " </td></tr> " +
       " </table>   ";

    document.getElementById('modelOptions').innerHTML = mHtml;
    document.getElementById('selectMeta').selectedIndex = 0;
    document.getElementById('selectModel').selectedIndex = -1;
};

var M_selectMetaModel = function(){
  var selectedMetaModel = parseInt( document.getElementById('selectMeta').value );
    console.log('Inside M_selectMetaModel ' + selectedMetaModel);

    if(selectedMetaModel == 0)
        F_showMetaModel(theMetaModelStack.metamodel[selectedMetaModel].name);
    else {
        var selectedModel = document.getElementById('selectModel').value;
        if(document.getElementById('selectModel').selectedIndex != -1 && selectedMetaModel >= selectedModel){
            showErrorMessage('M_error', 'Cannot display the metamodel. please change the model');
            return;
        }
        F_showMetaModel(theMetaModelStack.metamodel[selectedMetaModel + 1].name);
    }
    clearErrorMessage('M_error');
};

var M_selectModelInstance = function(){
    var selectedModel = document.getElementById('selectModel').value;
    var selectedMetaModel = parseInt( document.getElementById('selectMeta').value );
    console.log('Inside M_selectModelInstance ' + selectedModel);
    if( selectedMetaModel >= selectedModel){
        showErrorMessage('M_error', 'Cannot display the model. please change the metamodel');
        return;
    }
    F_showInstance(theMetaModelStack.metamodel[selectedModel].name);
    clearErrorMessage('M_error');
};

var M_setSelectedIndex = function(metamodelIndex){
    if(metamodelIndex == 0) {
        document.getElementById('selectMeta').selectedIndex = metamodelIndex;
        document.getElementById('selectModel').selectedIndex = -1;
    }
    else if(metamodelIndex > 0) {
        document.getElementById('selectMeta').selectedIndex = metamodelIndex - 1;
        document.getElementById('selectModel').selectedIndex = metamodelIndex - 1;
    }
};