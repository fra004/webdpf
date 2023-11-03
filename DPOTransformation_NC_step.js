/**
 * Created by rabbi on 2/20/15.
 */


var ed_step = [];

var populateTargetStates = function(ed, index){
    var mHTML = "<ul>";
    for(i = 0; i < ed.length; ++i) {
        if(i == index)
            mHTML = mHTML + '<li><table> <tr> <td> <a onclick="F_showTarget(\'' + i + '\')"> Target '  + (i+1) + '--> </a>' + '</td></tr></table> </li>';
        else
            mHTML = mHTML + '<li><table> <tr> <td> <a onclick="F_showTarget(\'' + i + '\')"> Target '  + (i+1) + '</a>' + '</td></tr></table> </li>';
    }
    mHTML = mHTML + '</ul>';
    document.getElementById('targetModels').innerHTML = mHTML;
};

var F_showTarget = function(index){
    var currentSpecName = M_selected_metamodel.name;
    console.log('F_showTarget...' + currentSpecName);
    if(index >= ed_step.length)
        return;

    populateTargetStates(ed_step, index);

    var Si = ed_step[index];
    var i;
    //console.log(Si);



    if(Si.drawingCompleted){
        if(theMetaModelStack.metamodel.length > 0)
            cleanupDrawingPane(theMetaModelStack.metamodel[0].metaModelSpec);

        //remove existing drawing...
        for(i = 1; i < theMetaModelStack.metamodel.length; ++i){
            cleanupDrawingPane(theMetaModelStack.metamodel[i].modelSpec);
        }

        clearAllNodesAndConns();
        copyArrayContents(Si.allDpfNodes, allNodes);
        copyArrayContents(Si.allDpfConns, allConns);
        clearArray(theMetaModelStack.allDpfNodes);
        clearArray(theMetaModelStack.allDpfConns);
        copyArrayContents(Si.allDpfNodes, theMetaModelStack.allDpfNodes);
        copyArrayContents(Si.allDpfConns, theMetaModelStack.allDpfConns);

        theMetaModelStack.selectedEdRef = ed_step[index];
        if(Si.metamodel.length > 0) {
            theMetaModelStack.metamodel[0].metaModelSpec = Si.metamodel[0].metaModelSpec;
        }
        for(i = 1; i < Si.metamodel.length; ++i){
            if(i ==1)
                theMetaModelStack.metamodel[i].metaModelSpec = Si.metamodel[i-1].metaModelSpec;
            else
                theMetaModelStack.metamodel[i].metaModelSpec = Si.metamodel[i-1].modelSpec;

            theMetaModelStack.metamodel[i].modelSpec = Si.metamodel[i].modelSpec;
        }
        F_showModel(currentSpecName, false);
        return;
    }

    if(theMetaModelStack.metamodel.length > 0)
        //theMetaModelStack.metamodel[0].metaModelSpec.removeSpecFromPaper(); //todo why not hide & show ????
        cleanupDrawingPane(theMetaModelStack.metamodel[0].metaModelSpec);

    //remove existing drawing...
    for(i = 1; i < theMetaModelStack.metamodel.length; ++i){
        //theMetaModelStack.metamodel[i].modelSpec.removeSpecFromPaper();
        cleanupDrawingPane(theMetaModelStack.metamodel[i].modelSpec);
    }

    var oldFlag = true;
    for(i = 0; i < ed_step.length; ++i){
        if(ed_step[i] == theMetaModelStack.selectedEdRef){
            oldFlag = false;
            break;
        }
    }
    if(oldFlag)
        recycleOldDrawingElementFromAStack(theMetaModelStack);

    theMetaModelStack.selectedEdRef = ed_step[index];
    // draw result in the paper.
    //console.log(Si);
    allNodes = Si.allDpfNodes;
    allConns = Si.allDpfConns;
    if(Si.metamodel.length > 0) {
        theMetaModelStack.metamodel[0].metaModelSpec = Si.metamodel[0].metaModelSpec;
        theMetaModelStack.metamodel[0].metaModelSpec.redrawSpec();
        cleanupDrawingPane(theMetaModelStack.metamodel[0].metaModelSpec);
    }

    //redraw
    for(i = 1; i < Si.metamodel.length; ++i){
        if(i ==1)
            theMetaModelStack.metamodel[i].metaModelSpec = Si.metamodel[i-1].metaModelSpec;
        else
            theMetaModelStack.metamodel[i].metaModelSpec = Si.metamodel[i-1].modelSpec;

        theMetaModelStack.metamodel[i].modelSpec = Si.metamodel[i].modelSpec;
        theMetaModelStack.metamodel[i].modelSpec.redrawSpec();
        cleanupDrawingPane(theMetaModelStack.metamodel[i].modelSpec);
        console.log(theMetaModelStack.metamodel[i].modelSpec.connections);
    }

    /*
    if(theMetaModelStack.metamodel[0])
        F_showModel( theMetaModelStack.metamodel[0].name , true); ///true);
        */
    F_showModel(currentSpecName, true, true);
    Si.drawingCompleted = true;
};

var compareSpecs = function(state1, spec1, state2, spec2){
    var i, j, c, nodeFound, node1, node2, conn1, conn2, c2, connFound, x1Conn, x2Conn;

    if(spec1.nodes.length != spec2.nodes.length)
        return false;
    if(spec1.connections.length != spec2.connections.length)
        return false;

    // reset comparison flag
    for( i = 0; i < spec2.nodes.length; ++i){
        node2 = spec2.nodes[i];
        if(node2.ID < state2.maxNodeIdSnapshot)
            continue;
        node2.comparisonFlag = false;
    }
    for(i = 0; i < spec2.connections.length; ++i){
        conn2 = spec2.connections[i];
        if(conn2.ID < state2.maxConnIdSnapshot)
            continue;
        conn2.comparisonFlag = false;
    }

    for( i = 0; i < spec1.connections.length; ++i){
        conn1 = spec1.connections[i];
        if(conn1.ID < state1.maxConnIdSnapshot)
            continue;

        console.log('looking for connection: ' + conn1.fromNode.name + ' -> ' + conn1.name + ' -> ' + conn1.toNode.name);
        var conn1Found = false;
        // find a corresponding connection of this connection in state 2
        for(j = 0; j < spec2.connections.length; ++j){
            conn2 = spec2.connections[j];
            if(conn2.ID < state2.maxConnIdSnapshot || conn2.comparisonFlag)
                continue;

            console.log('matching with connection: ' + conn2.fromNode.name + ' -> ' + conn2.name + ' -> ' + conn2.toNode.name);
            connFound = false;

            if(conn1.typing.type.ID == conn2.typing.type.ID ){
                if(conn1.fromNode.typing.type.ID == conn2.fromNode.typing.type.ID &&
                    conn1.toNode.typing.type.ID == conn2.toNode.typing.type.ID &&
                    conn1.fromNode.conn.length == conn2.fromNode.conn.length &&
                    conn1.toNode.conn.length == conn2.toNode.conn.length ){

                    connFound = true;
                    if(conn1.fromNode.ID < state1.maxNodeIdSnapshot ) {
                        if(conn1.fromNode.ID != conn2.fromNode.ID){
                            connFound = false; continue;
                        }
                        //console.log('>>>>>matched  conn1.fromNode.ID = ' + conn1.fromNode.ID + '  maxNodeIdSnapshot ' + state1.maxNodeIdSnapshot + ' conn2.fromNode.ID ' + conn2.fromNode.ID + ' conn1.toNode.ID ' + conn1.toNode.ID + ' conn2.toNode.ID ' + conn2.toNode.ID );
                    }
                    else{
                        x1Conn = conn1.fromNode.conn;
                        x2Conn = conn2.fromNode.conn;

                        for(c = 0; c < x1Conn.length; ++c){
                            connFound = false;
                            for(c2 = 0; c2 < x2Conn.length; ++c2){
                                if(x1Conn[c].typing.type.ID == x2Conn[c2].typing.type.ID){
                                    connFound = true; break;
                                }
                            }
                            if(connFound == false) {
                                //console.log('fromNodes connection not matched with the target connecction ');
                                break;
                            }
                        }
                        if(connFound = false)
                            continue;
                    }

                    if(conn1.toNode.ID < state1.maxNodeIdSnapshot ) {
                        if(conn1.toNode.ID != conn2.toNode.ID){
                            connFound = false; continue;
                        }
                        console.log('>>>>>>>>>  Matched');
                        conn1Found = true;
                        conn2.comparisonFlag = true; break;
                        //console.log('>>>>>matched  conn1.fromNode.ID = ' + conn1.fromNode.ID + '  maxNodeIdSnapshot ' + state1.maxNodeIdSnapshot + ' conn2.fromNode.ID ' + conn2.fromNode.ID + ' conn1.toNode.ID ' + conn1.toNode.ID + ' conn2.toNode.ID ' + conn2.toNode.ID );
                    }
                    else {

                        x1Conn = conn1.toNode.conn;
                        x2Conn = conn2.toNode.conn;

                        for (c = 0; c < x1Conn.length; ++c) {
                            connFound = false;
                            for (c2 = 0; c2 < x2Conn.length; ++c2) {
                                if (x1Conn[c].typing.type.ID == x2Conn[c2].typing.type.ID) {
                                    connFound = true;
                                    break;
                                }
                            }
                            if (connFound == false) {
                                console.log('toNodes connection not matched with the target connecction ');
                                break;
                            }
                        }
                    }

                    if(connFound) {
                        console.log('>>>>>>>> connection matched');
                        conn1Found = true;
                        conn2.comparisonFlag = true; break;
                    }
                }
            }
        }
        if(conn1Found == false) {
            console.log('!!!!!!!! connection not matched');
            return false;
        }
    }

    for( i = 0; i < spec1.nodes.length; ++i){
        node1 = spec1.nodes[i];
        if(node1.ID < state1.maxNodeIdSnapshot)
            continue;
        if(node1.conn.length > 0)
            continue;
        nodeFound = false;
        for(j = 0; j < spec2.nodes.length; ++j){
            node2 = spec2.nodes[j];
            if(node2.ID < state2.maxNodeIdSnapshot || node2.comparisonFlag == true)
                continue;
            if(node1.typing.type.ID == node2.typing.type.ID){
                node2.comparisonFlag = true; nodeFound = true; break;
            }
        }
        if(nodeFound == false)
            return false;
    }


    // assuming this part is only used for workflow simulation...
    var predConst1 = spec1.predicateConstraints;
    var predConst2 = spec2.predicateConstraints;
    for(i = 0; i < predConst1.length; ++i){
        if(predConst1[i].nodes != null && predConst1[i].nodes.length == 1){
            var predFound = false;
            for(j = 0; j < predConst2.length; ++j){
                if(predConst2[j].predicate.predicateId == predConst1[i].predicate.predicateId &&
                   predConst2[j].nodes != null && predConst2[j].nodes.length == 1){
                    if(predConst1[i].nodes[0].ID == predConst2[j].nodes[0].ID){
                        predFound = true;
                        break;
                    }
                }
            }
            if(predFound == false)
                return false;
        }
    }


    return true;
};



var compareStates = function(state1, state2){
    for(var i = 1; i < state1.metamodel.length; ++i){
        if(i == 3)
            console.log('spec1.connections.length ' + state1.metamodel[i].modelSpec.connections.length + '   spec2.connections.length ' + state2.metamodel[i].modelSpec.connections.length);
        if(!compareSpecs(state1, state1.metamodel[i].modelSpec, state2, state2.metamodel[i].modelSpec) )
            return false;
    }
    return true;
};

var copyCoordinates = function(Si){
    if(Si.metamodel.length > 0)
        Si.metamodel[0].metaModelSpec.copySpecCoords(theMetaModelStack.metamodel[0].metaModelSpec);

    for(var i = 1; i < Si.metamodel.length; ++i){
        // copy coordinates from modelspec
        Si.metamodel[i].modelSpec.copySpecCoords(theMetaModelStack.metamodel[i].modelSpec);
    }
};

var isUnique = function(ing, ed, Ti){
    if(ing.length == 0 && ed.length == 0)
        return true;

    for(var i = 0; i < ing.length; ++i){
        if(compareStates(ing[i], Ti)) {
            return false;
        }
    }

    for(i = 0; i < ed.length; ++i){
        if(compareStates(ed[i], Ti))
            return false;
    }
    return true;
};

var resetCreationLayerNumbers_NC = function(theState){
    for(var i = 0; i < theState.allDpfNodes.length; ++i){
        theState.allDpfNodes[i].setCreationLayerNumber(0);
    }
    for(i = 0; i < theState.allDpfConns.length; ++i){
        theState.allDpfConns[i].setCreationLayerNumber(0);
    }
};



var copyState = function(theStack, copyRef){
    clearCopyArray();

    var newState = new MetaModelStack();

    for (var j = 0; j < theStack.metamodel.length; ++j) {
        var theModel = theStack.metamodel[j];
        var metaModelspec = theModel.metaModelSpec;
        var modelspec = theModel.modelSpec;

        var metaModelspec_copy = null;

        if(j > 0){
            metaModelspec_copy = newState.metamodel[j-1].modelSpec;
        }
        else{
            metaModelspec_copy = metaModelspec.copySpec(copyRef);
        }

        var newMM = new MetaModel(theModel.name, metaModelspec_copy, modelspec.copySpec(copyRef), newState, theModel.metaLevel);
        newMM.leftOffSet = modelspec.leftOffSet;
        newMM.rightOffSet = modelspec.rightOffSet;
        newMM.topOffSet = modelspec.topOffSet;
        newMM.bottomOffSet = modelspec.bottomOffSet;
    }

    newState.allDpfNodes = [];
    newState.allDpfConns = [];

    for(j = 0; j < theMetaModelStack.predSpec.predicates.length; ++j){
        var pred = theMetaModelStack.predSpec.predicates[j];
        for(var k = 0; k < pred.nodes.length; ++k)
            newState.allDpfNodes.push(pred.nodes[k]);
        for(k = 0; k < pred.conn.length; ++k)
            newState.allDpfConns.push(pred.conn[k]);
    }

    for(j = 0; j < copyNodes.length; ++j)
        newState.allDpfNodes.push(copyNodes[j]);

    for(j = 0; j < copyConns.length; ++j)
        newState.allDpfConns.push(copyConns[j]);

    newState.processingLayer = theStack.processingLayer;
    newState.processingIndex = theStack.processingIndex;
    newState.maxNodeIdSnapshot = theStack.maxNodeIdSnapshot;
    newState.maxConnIdSnapshot = theStack.maxConnIdSnapshot;
    return newState;
};

var existingPredConst = null;
var predConstOfNextLevel = null;

var recycleOldDrawingElements = function(){
    // ed_step - currently selected drawings
    if(ed_step == null || theMetaModelStack.selectedEdRef == null)
        return;
    for(var i = 0; i < ed_step.length; ++i) {
        if (ed_step[i] == theMetaModelStack.selectedEdRef)
            continue;
        var theStack = ed_step[i];
        if(!theStack.drawingCompleted)
            continue;
        recycleOldDrawingElementFromAStack(ed_step[i]);

    }
};

var recycleOldDrawingElementFromAStack = function(theStack){
    console.log("recycling....");
    for (var j = 0; j < theStack.metamodel.length; ++j) {
        var theModel = theStack.metamodel[j];
        var metaModelspec = theModel.metaModelSpec;
        var modelspec = theModel.modelSpec;

        if (j == 0) {
            //delete from modelspec
            for(var n = 0; n < metaModelspec.nodes.length; ++n)
                metaModelspec.nodes[n].removeNodeFromPaper();

            for(n = 0; n < metaModelspec.connections.length; ++n)
                metaModelspec.connections[n].removeConnectionFromPaper();
        }
        else {
            // delete from metamodelspec
            for(n = 0; n < modelspec.nodes.length; ++n)
                modelspec.nodes[n].removeNodeFromPaper();

            for(n = 0; n < modelspec.connections.length; ++n)
                modelspec.connections[n].removeConnectionFromPaper();

            for(n = 0; n < modelspec.predicateConstraints.length; ++n)
                modelspec.predicateConstraints[n].removeConstraintFromPaper();

        }
    }
};


var transformDPO_NC_step = function(ruleType){


    var useRules = allRules;
    if(ruleType == 1)
        useRules = allProductionRules;

    if(theMetaModelStack.metamodel.length <= 1)
        return;

    var S0 = copyState(theMetaModelStack, true);

    S0.maxNodeIdSnapshot = maxDpfNodeId;
    S0.maxConnIdSnapshot = maxDpfConnectionId;
    resetCreationLayerNumbers_NC(S0);
    recycleOldDrawingElements();
    ed_step = [];

    //try {
        if(useRules.length == 0)
            return;

        // check for dangling edge in the rules
        for(var i = 0; i < useRules.length; ++i) {
            var theRule = useRules[i];
            for (var j = 0; theRule.elements_to_delete != null && j < theRule.elements_to_delete.length; ++j) {
                if (theRule.elements_to_delete[j].dpfType == 'DpfConnection')
                    continue;
                var nodeToDelete = theRule.elements_to_delete[j];
                if (nodeToDelete.conn.length > 0 && hasDpfConnection(theRule.elements_to_delete) == false)
                    throw "Rule " + theRule.ruleId + " will produce dangling edge";

                for (var k = 0; k < nodeToDelete.conn.length; ++k) {
                    var aConn = nodeToDelete.conn[k]; // If this connection is also going to be deleted then it is not producing any dangling edge
                    if(!containsDpfElement(theRule.elements_to_delete, aConn))
                    // this means the node has an edge that is not going to be deleted by the execution of the rule.. therefore a dangling edge
                        throw "Rule " + theRule.ruleId + " will produce dangling edge";
                }
            }
        }


        var Si = S0; //copyState(S0);

        var leafNode = true;

        for(j = Si.processingIndex; j < Si.metamodel.length; ++j){
            var metaModelspec = Si.metamodel[j].metaModelSpec;

            for ( i = 0; i < useRules.length; ++i) {
                // try to find injective match with rule
                theRule = useRules[i];
                var processingLayer = theRule.layerNumber;
                if(Si.processingLayer > processingLayer )
                    continue;

                if(!leafNode){
                    // processingNumber cant be greater than Si.processingLayer
                    if(Si.processingLayer < processingLayer)
                        break;
                }

                var thePredicate = theRule.parentPredicate;
                existingPredConst = metaModelspec.predicateConstraints;


                predConstOfNextLevel =  Si.metamodel[j].modelSpec.predicateConstraints;


                for (var p = 0; p < existingPredConst.length; ++p) {
                    if (existingPredConst[p].predicate == thePredicate) {
                        var targetpool = [];
                        findInjectiveMatchAndApplyRule_NC_step(thePredicate, theRule, existingPredConst[p], processingLayer, Si, j , targetpool);

                        for(var tp = 0; tp < targetpool.length; ++tp){
                            var Ti = targetpool[tp];
                            // store the result state and push it into the ing array..
                            if(isUnique([], ed_step, Ti)) {
                                copyCoordinates(Ti);
                                ed_step.push(Ti);
                            }

                            leafNode = false;
                            Si.processingLayer = processingLayer;
                        }
                    }
                }
            }

            if(!leafNode)
                break;
            else{
                // reset layer number
                Si.processingIndex++;
                Si.processingLayer = 0;
            }
        }

        populateTargetStates(ed_step);
    //}catch(err) { showErrorMessage('F_error', err);  }

};

var findInjectiveMatchAndApplyRule_NC_step = function(thePredicate, theRule, thePredConst, processingLayer, Si, processingIndex, targetPool){
    // get all matches
    var L_pairNodes = [];
    var L_pairConns = [];
    var N_pairNodes = [];
    var N_pairConns = [];
    var D_pairNodes = [];
    var D_pairConns = [];
    var R_NodesMap = [];
    var R_ConnsMap = [];
    var R_ConnsDelta = [];
    var flag = 0;
    var i, w;
    console.log('processing rule ' + theRule.ruleId);

    for(i = 0; i < thePredConst.attachedModelConns.length; ++i){
        var srcTypeInstances = thePredConst.attachedModelConns[i].srcConn.instances;
        var trgTypeInstances = thePredConst.attachedModelConns[i].trgConn.instances;


        for(var s = 0; s < srcTypeInstances.length; ++s){
            var x = srcTypeInstances[s].from;
            // make sure that x is NOT from any other sibling rule
            var foundInC = false;
            for(var c = 0; c < theRule.conn.length; ++c){
                if(theRule.conn[c].ID == x.ID){
                    foundInC = true; break;
                }
            }
            if(!foundInC){
                continue;
            }

            flag = 0;
            //console.log(x);
            //console.log(theRule.elements_to_add);
            if(containsDpfElement(theRule.elements_in_nac, x))
                flag = 1;
            else if(containsDpfElement(theRule.elements_to_delete, x))
                flag = 2;

            if(containsDpfElement(theRule.elements_to_add, x)) {
                //console.log('adding item into R_connsMap..');
                R_ConnsMap.push(x);
                R_ConnsDelta.push(thePredConst.attachedModelConns[i]);
                if(flag == 1){/*ignore*/}
                else flag = 3;
            }

            if( (flag == 0 || flag == 2) && trgTypeInstances.length == 0) {
                console.log('constrained connection in the left hand side has no instance in the model');
                return null; // constrained connection in the left hand side has no instance in the model
            }

            for(var j = 0; j < trgTypeInstances.length; ++j) {
                var y = trgTypeInstances[j].from;
                console.log(y);
                if(flag == 0 && y.fromNode.creationLayer <= processingLayer && y.toNode.creationLayer <= processingLayer)
                    L_pairConns.push({'rx': x , 'mx': y});
                else if(flag == 1)
                    N_pairConns.push({'rx': x , 'mx': y});
                else if(flag == 2 && y.fromNode.creationLayer <= processingLayer && y.toNode.creationLayer <= processingLayer) {
                    L_pairConns.push({'rx': x , 'mx': y});
                    D_pairConns.push({'rx': x , 'mx': y});
                }
            }

            if( (flag == 0 || flag == 2) && L_pairConns.length == 0) {
                console.log('constrained connection in the left hand side has no instance in the model');
                return null; // constrained connection in the left hand side has no instance in the model
            }
        }
    }

    for(i = 0; i < thePredConst.attachedModelNodes.length; ++i){
        srcTypeInstances = thePredConst.attachedModelNodes[i].srcNode.instances;
        trgTypeInstances = thePredConst.attachedModelNodes[i].trgNode.instances;


        for(s = 0; s < srcTypeInstances.length; ++s){
            x = srcTypeInstances[s].from;
            // make sure that x is NOT from any other sibling rule
            var foundInN = false;
            for(var n = 0; n < theRule.nodes.length; ++n){
                if(theRule.nodes[n].ID == x.ID){
                    foundInN = true; break;
                }
            }
            if(!foundInN){
                continue;
            }

            flag = 0;
            if(containsDpfElement(theRule.elements_in_nac, x))
                flag = 1;
            else if(containsDpfElement(theRule.elements_to_delete, x))
                flag = 2;

            if(containsDpfElement(theRule.elements_to_add, x)) {
                R_NodesMap.push(thePredConst.attachedModelNodes[i]);
                if(flag == 1){/*ignore*/}
                else flag = 3;
            }

            if( (flag == 0 || flag == 2) && trgTypeInstances.length == 0) {
                console.log('constrained node in the left hand side has no instance in the model');
                return null; // constrained node in the left hand side has no instance in the model
            }


            for (j = 0; j < trgTypeInstances.length; ++j) {
                y = trgTypeInstances[j].from;

                if(flag == 0 && y.creationLayer <= processingLayer)
                    L_pairNodes.push({'rx': x , 'mx': y});
                else if(flag == 1) {
                    //N_pairNodes.push({'rx': x, 'mx': y});
                    console.log('nac is not satisfied with ' + y.ID);
                    return null;
                }
                else if(flag == 2 && y.creationLayer <= processingLayer) {
                    L_pairNodes.push({'rx': x , 'mx': y});
                    D_pairNodes.push({'rx': x, 'mx': y});
                }
            }

            if( (flag == 0 || flag == 2) && L_pairNodes.length == 0) {
                console.log('constrained node in the left hand side has no instance in the model');
                return null; // constrained node in the left hand side has no instance in the model
            }


        }
    }

    console.log('calling findAnInjectiveMatch_phase1');
    var resultPool = [];
    findAnInjectiveMatch_phase1_NC_step(L_pairConns, L_pairNodes, N_pairConns, -1, [], theRule, resultPool);
    //console.log(result.connPair);
    //console.log(result.nodePair);
    if(L_pairNodes.length != 0 && resultPool.length ==0 )
        return null;

    for(var p = 0; p < resultPool.length; ++p) {
        flag = false;
        var result = resultPool[p];
        console.log('processing R_NodesMap..');
        var Ti = copyState(Si, false);
        var modelSpec = Ti.metamodel[processingIndex].modelSpec;
        for (i = 0; i < R_NodesMap.length; ++i) {
            var nodeTypeee = R_NodesMap[i].trgNode;
            var nodeType = findDpfNodeByIdFromCopyNodes(nodeTypeee.ID);
            var nodeName = ":" + nodeType.name;
            console.log('creating new dpf node: ' + nodeName);
            var newNode = new DpfNode(nodeName, modelSpec, Ti.allDpfNodes);
            newNode.setCreationLayerNumber(processingLayer + 1);


            flag = true;
            var typingOfNode = new DpfTypingOfNode(newNode, nodeType);
        }

        console.log('processing R_ConnsMap..');
        for (i = 0; i < R_ConnsMap.length; ++i) {
            var connTypeee = R_ConnsDelta[i].trgConn;
            var connType = findDpfConnectionByIdFromCopyConns(connTypeee.ID);
            console.log(connType);
            var X1 = R_ConnsMap[i].fromNode;
            var Y1 = R_ConnsMap[i].toNode;
            var imgX1 = null;
            var imgY1 = null;
            for (j = 0; j < result.nodePair.length; ++j) {
                if (result.nodePair[j].rx.ID == X1.ID) {
                    for(w = 0; w < Ti.allDpfNodes.length; ++w) {
                        if(result.nodePair[j].mx.ID == Ti.allDpfNodes[w].ID) {
                            imgX1 = Ti.allDpfNodes[w];
                            break;
                        }
                    }
                    break;
                }
            }
            for (j = 0; j < result.nodePair.length; ++j) {
                if (result.nodePair[j].rx.ID == Y1.ID) {
                    for(w = 0; w < Ti.allDpfNodes.length; ++w) {
                        if(result.nodePair[j].mx.ID == Ti.allDpfNodes[w].ID) {
                            imgY1 = Ti.allDpfNodes[w];
                            break;
                        }
                    }
                    break;
                }
            }
            if (imgX1 == null || imgY1 == null) {
                continue;
                //throw "Problem applying rule " + theRule.ruleId + "\nDpfConnection of type " + connType.name + " cannot be instantiated.";
            }

            var connName = ":" + connType.name;
            console.log('creating new dpf connection: ' + connName);
            console.log('fromNode: ' + imgX1.name + ' toNode: ' + imgY1.name);
            var newConn = new DpfConnection(connName, imgX1, imgY1, modelSpec, Ti.allDpfConns);
            console.log('modelSpec.connections.length : ' + modelSpec.connections.length);
            imgX1.displayFlag = 0;
            imgY1.displayFlag = 0;

            flag = true;

            var typingOfConn = new DpfTypingOfConnection(newConn, connType);
        }


        for (i = 0; i < result.connPair.length; ++i) {
            var aPair = result.connPair[i];
            if (containsDpfElement(theRule.elements_to_delete, aPair.rx)) {
                // find aPair.mx from Ti
                var connToDelete = null;
                for (j = 0; j < Ti.allDpfConns.length; ++j) {
                    if (aPair.mx.ID == Ti.allDpfConns[j].ID) {
                        connToDelete = Ti.allDpfConns[j];
                        break;
                    }

                }
                console.log('deleting connection ' + connToDelete.name);
                connToDelete.deleteDpfConnectionOnly(Ti.allDpfConns);
                allConnsList = [];
                for (i = 0; i < Ti.allDpfConns.length; ++i) {
                    if (Ti.allDpfConns[i].ID != connToDelete.ID)
                        allConnsList.push(Ti.allDpfConns[i]);
                }
                Ti.allDpfConns = allConnsList;
                flag = true;
            }
        }

        for (i = 0; i < result.nodePair.length; ++i) {
            aPair = result.nodePair[i];
            if (containsDpfElement(theRule.elements_to_delete, aPair.rx)) {
                // find aPair.mx from Ti
                var nodeToDelete = null;
                for (j = 0; j < Ti.allDpfNodes.length; ++j) {
                    if (aPair.mx.ID == Ti.allDpfNodes[j].ID) {
                        nodeToDelete = Ti.allDpfNodes[j];
                        break;
                    }

                }
                console.log('deleting node ' + nodeToDelete.name);
                nodeToDelete.deleteDpfNodeOnly(Ti.allDpfNodes);
                allNodesList = [];
                for (i = 0; i < Ti.allDpfNodes.length; ++i) {
                    if (Ti.allDpfNodes[i].ID != nodeToDelete.ID)
                        allNodesList.push(Ti.allDpfNodes[i]);
                }
                Ti.allDpfNodes = allNodesList;
                flag = true;
            }
        }

        //todo create/delete annotations... in model instance
        for(var a = 0; a < theRule.annotations.length; ++a){
            var annotNodeFound = false;
            for(var q = 0; q < theRule.annotations[a].attachedModelNodeIds.length; ++q) {

                var srcNodeId = theRule.annotations[a].attachedModelNodeIds[q].srcNode;
                var trgNodeId = theRule.annotations[a].attachedModelNodeIds[q].trgNode;


                annotNodeFound = false;
                // find the node from L that matched with the trgNode
                for (var np = 0; np < result.nodePair.length; ++np) {
                    if (result.nodePair[np].rx.ID == trgNodeId) {

                        if(theRule.annotations[a].addTag) {
                            var newConst = new DpfPredicateConstraint(theRule.annotations[a].predicate, modelSpec);
                            newConst.outputName = theRule.annotations[a].outputName;

                            var srcNode = findDpfNodeById(srcNodeId);
                            newConst.attachedModelNodes.push({srcNode: srcNode, trgNode: findDpfNodeByIdFromCopyNodes(result.nodePair[np].mx.ID)});
                            if(srcNode.assocPredLine.length > 0 )
                                newConst.nodes.push(newConst.attachedModelNodes[0].trgNode);

                            oldTrgNode = findDpfNodeById(result.nodePair[np].mx.ID);
                            theTrgNode = newConst.attachedModelNodes[0].trgNode;
                            var bb = oldTrgNode.d_node.getBBox();
                            var nodeCoords = [bb.x + (bb.width / 2), bb.y];
                            var predX1 = nodeCoords[0] + 15;
                            var predY1 = nodeCoords[1]-15;

                            var fx = predX1;
                            var fy = nodeCoords[1];

                            newConst.lineCoords.push([predX1, predY1, fx, fy]);

                            newConst.d_textCoords.push(predX1);
                            newConst.d_textCoords.push(predY1);
                            annotNodeFound = true;
                            break;
                        }
                        else if(theRule.annotations[a].delTag) {
                            // make sure that mx is constrained by the same predicate as the annotation is
                            for (var ep = 0; ep < modelSpec.predicateConstraints.length; ++ep) {
                                var aPredConst = modelSpec.predicateConstraints[ep];
                                if (aPredConst.predicate == theRule.annotations[a].predicate) {
                                    for (var ins = 0; ins < aPredConst.attachedModelNodes.length; ++ins) {
                                        var trgInstance = aPredConst.attachedModelNodes[ins].trgNode;

                                        if (trgInstance.ID == result.nodePair[np].mx.ID) {
                                            var newSet = [];
                                            for (var oi = 0; oi < modelSpec.predicateConstraints.length; ++oi) {
                                                if (oi == ep)
                                                    continue;
                                                newSet.push(modelSpec.predicateConstraints[oi]);
                                            }
                                            modelSpec.predicateConstraints = newSet;
                                            annotNodeFound = true;
                                            break;
                                        }

                                    }
                                }
                                if (annotNodeFound)
                                    break;
                            }
                        }
                        else{
                            for ( ep = 0; ep < modelSpec.predicateConstraints.length; ++ep) {
                                aPredConst = modelSpec.predicateConstraints[ep];
                                if (aPredConst.predicate == theRule.annotations[a].predicate) {
                                    for (ins = 0; ins < aPredConst.attachedModelNodes.length; ++ins) {
                                        trgInstance = aPredConst.attachedModelNodes[ins].trgNode;

                                        if (trgInstance.ID == result.nodePair[np].mx.ID) {
                                            annotNodeFound = true;
                                            break;
                                        }

                                    }
                                }
                                if (annotNodeFound)
                                    break;
                            }
                        }
                    }
                    if(annotNodeFound)
                        break;
                }

            }

        }




        targetPool.push(Ti);
    }

};

var findAnInjectiveMatch_phase1_NC_step = function(L_pairConns, L_pairNodes, N_pairConns, currentIndex, connPair_run,  theRule, resultPool){
    currentIndex = currentIndex + 1;
    var rx = null, mx = null;

    if(currentIndex >= L_pairConns.length){
        // construct nodePair_run from the node instances already covered by connection instances.
        var nodePair_run = [];
        for(var c = 0; c < connPair_run.length; ++c){
            rx = connPair_run[c].rx;
            mx = connPair_run[c].mx;
            var flag = false;
            for(var d = 0; d < nodePair_run.length; ++d){
                if(nodePair_run[d].rx == rx.fromNode){
                    flag = true;
                    break;
                }
            }
            if(!flag)
                nodePair_run.push({'rx': rx.fromNode, 'mx': mx.fromNode});

            flag = false;
            for(d = 0; d < nodePair_run.length; ++d){
                if(nodePair_run[d].rx == rx.toNode){
                    flag = true;
                    break;
                }
            }
            if(!flag)
                nodePair_run.push({'rx': rx.toNode, 'mx': mx.toNode});
        }
        // go to phase 2.... for node match...
        var tempResult = [];
        findAnInjectiveMatch_phase2_NC_step(L_pairNodes, N_pairConns, -1, connPair_run, nodePair_run, theRule, tempResult);
        if(tempResult.length == 0)
            return; //{'connPair': [], 'nodePair': []};
        else {
            for(var p = 0; p < tempResult.length; ++p)
            resultPool.push( {'connPair': connPair_run, 'nodePair': tempResult[p]} );
            return;
        }
    }

    var lastX = null;
    if(connPair_run.length > 0)
        lastX = connPair_run[connPair_run.length - 1].rx;


    if(lastX != L_pairConns[currentIndex].rx ){
        // skip considering current pair... but this is only possible if there are other choices... so lets look ahead
        if(currentIndex + 1 < L_pairConns.length && L_pairConns[currentIndex].rx == L_pairConns[currentIndex+1].rx) {
            findAnInjectiveMatch_phase1_NC_step(L_pairConns, L_pairNodes, N_pairConns, currentIndex, connPair_run, theRule, resultPool);
            // if result is complete, then return result...
            // if(result.nodePair.length > 0)
            //    return result;
        }

        // must consider the current connection instance... check eligibility first
        rx = L_pairConns[currentIndex].rx;
        mx = L_pairConns[currentIndex].mx;

        // 1. if a connection in the left hand side has same source and target, them it must be the same in the connection instance
        if(rx.fromNode == rx.toNode){
            if(mx.fromNode != mx.toNode)
                return;
        }
        // 2. connection from the rule must preserve the same structure in the connection instance
        for(var i = 0; i < connPair_run.length; ++i){
            var rxPrev = connPair_run[i].rx;
            var mxPrev = connPair_run[i].mx;

            if(rx.fromNode == rxPrev.fromNode){
                if(mx.fromNode != mxPrev.fromNode)
                    return;
            }
            if(rx.fromNode == rxPrev.toNode){
                if(mx.fromNode != mxPrev.toNode)
                    return;
            }
            if(rx.toNode == rxPrev.fromNode){
                if(mx.toNode != mxPrev.fromNode)
                    return;
            }
            if(rx.toNode == rxPrev.toNode){
                if(mx.toNode != mxPrev.toNode)
                    return;
            }
        }

        var copyConnPair_run = [];
        for (i = 0; i < connPair_run.length; ++i)
            copyConnPair_run.push(connPair_run[i]);

        copyConnPair_run.push(L_pairConns[currentIndex]);
        return findAnInjectiveMatch_phase1_NC_step(L_pairConns, L_pairNodes, N_pairConns, currentIndex, copyConnPair_run, theRule, resultPool);

    }
    else{
        return findAnInjectiveMatch_phase1_NC_step(L_pairConns, L_pairNodes, N_pairConns, currentIndex, connPair_run, theRule, resultPool);
    }



};

var checkForDanglingEdge_step = function(connPair, nodePair, theRule){
    for(var i = 0; i < nodePair.length; ++i){
        var aPair = nodePair[i];
        if(containsDpfElement(theRule.elements_to_delete, aPair.rx)){
            var nodeToDelete = aPair.mx;
            if(aPair.mx.conn.length > 0 && hasDpfConnection(theRule.elements_to_delete) == false)
                return true;

            for(var j = 0; j < nodeToDelete.conn.length; ++j){
                var aConn = nodeToDelete.conn[j]; // If this connection is also going to be deleted then it is not producing any dangling edge
                var delFlag = false;
                for(var c = 0; c < connPair.length; ++c){
                    if(aConn.ID == connPair[c].mx.ID){
                        if(containsDpfElement(theRule.elements_to_delete, connPair[c].rx)){
                            delFlag = true; break;
                        }
                    }
                }
                if(delFlag == false) // this means the node has an edge that is not going to be deleted by the execution of the rule.. therefore a dangling edge
                    return true;
            }
        }
    }


    return false;
};

var findAnInjectiveMatch_phase2_NC_step = function(L_pairNodes, N_pairConns, currentIndex, connPair_run, nodePair_run, theRule, tempResult){
    currentIndex = currentIndex + 1;
    var result = null;
    console.log( L_pairNodes);
    console.log('currentIndex: ' + currentIndex);

    if(currentIndex >= L_pairNodes.length){
        // make sure that considered elements are not present in the NAC

         for(var n = 0; n < N_pairConns.length; ++n){
             var mx_nac = N_pairConns[n].mx;
             var rx_nac = N_pairConns[n].rx;
             var srcFoundFlag = false;
             var trgFoundFlag = false;
             for(var d = 0; d < nodePair_run.length; ++d) {
                 if ( rx_nac.fromNode == nodePair_run[d].rx &&  mx_nac.fromNode == nodePair_run[d].mx) {
                     srcFoundFlag = true;
                     break;
                 }
             }
             for( d = 0; d < nodePair_run.length; ++d) {
                 if( rx_nac.toNode == nodePair_run[d].rx && mx_nac.toNode == nodePair_run[d].mx){
                     trgFoundFlag = true;
                     break;
                 }
             }
             if(srcFoundFlag == true && trgFoundFlag == true)
                return [];
         }

        // ensure that considered injective match will not produce any dangling edge
        if(checkForDanglingEdge_step(connPair_run, nodePair_run, theRule))
            return [];

        //match with annotations....
        for(var a = 0; a < theRule.annotations.length; ++a){

            var annotMatchFound = false;
            var annotNodeFound = false;
            for(var q = 0; q < theRule.annotations[a].attachedModelNodeIds.length; ++q) {
                if(theRule.annotations[a].addTag)
                    continue;
                var srcNodeId = theRule.annotations[a].attachedModelNodeIds[q].srcNode;
                var trgNodeId = theRule.annotations[a].attachedModelNodeIds[q].trgNode;
                annotNodeFound = false;
                // find the node from L that matched with the trgNode
                for (var np = 0; np < nodePair_run.length; ++np) {
                    if (nodePair_run[np].rx.ID == trgNodeId) {
                        // make sure that mx is constrained by the same predicate as the annotation is
                        for (var ep = 0; ep < predConstOfNextLevel.length; ++ep) {
                            var thePredConst = predConstOfNextLevel[ep];
                            if (thePredConst.predicate == theRule.annotations[a].predicate) {
                                for (var ins = 0; ins < thePredConst.attachedModelNodes.length; ++ins) {
                                    var trgInstance = thePredConst.attachedModelNodes[ins].trgNode;

                                    if (trgInstance.ID == nodePair_run[np].mx.ID) {
                                            // match found....
                                            annotNodeFound = true;
                                            break;
                                    }

                                }
                            }
                            if(annotNodeFound)
                                break;
                        }
                    }
                    if(annotNodeFound)
                        break;
                }
                if(!annotNodeFound)
                    return [];
            }

        }


        /*todo go to phase 3
        var annotResult = [];
        findAnInjectiveMatch_phase3_NC_step(connPair_run, nodePair_run, theRule, annotResult);
        if(annotResult.length == 0)
            return; //{'connPair': [], 'nodePair': []};
        else {
            for(var p = 0; p < annotResult.length; ++p)
                resultPool.push( {'connPair': connPair_run, 'nodePair': tempResult[p]} );
            return;
        }/ annot end */

        tempResult.push(nodePair_run);
        return nodePair_run;
    }

    var nodeFoundFlag = false;
    for( d = 0; d < nodePair_run.length; ++d) {
        if (L_pairNodes[currentIndex].rx == nodePair_run[d].rx) {
            nodeFoundFlag = true;
            break;
        }
    }

    if(!nodeFoundFlag ){
        // skip considering current pair... but this is only possible if there are other choices... so lets look ahead
        if(currentIndex + 1 < L_pairNodes.length && L_pairNodes[currentIndex].rx == L_pairNodes[currentIndex+1].rx) {
            result = findAnInjectiveMatch_phase2_NC_step(L_pairNodes, N_pairConns, currentIndex, connPair_run, nodePair_run, theRule);
            // if result is complete, then return result...
            //if(result.length > 0)

        }

        var rx = L_pairNodes[currentIndex].rx;
        var mx = L_pairNodes[currentIndex].mx;
        var mxFoundFlag = false;

        var copyNodePair_run = [];
        for (var i = 0; i < nodePair_run.length; ++i) {
            if(nodePair_run[i].mx.ID == mx.ID){
                mxFoundFlag = true;
                break;
            }
            copyNodePair_run.push(nodePair_run[i]);
        }

        if(mxFoundFlag){ // injective match is not possible with this mx because already another exist in nodePair_run
            return [];
        }
        copyNodePair_run.push(L_pairNodes[currentIndex]);
        return findAnInjectiveMatch_phase2_NC_step(L_pairNodes, N_pairConns, currentIndex, connPair_run, copyNodePair_run, theRule, tempResult);

    }
    else{
        return findAnInjectiveMatch_phase2_NC_step(L_pairNodes, N_pairConns, currentIndex, connPair_run, nodePair_run, theRule, tempResult);
    }



};

