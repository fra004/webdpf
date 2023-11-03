/**
 * Created by rabbi on 2/20/15.
 */

var ing = [];
var ed = [];


var populateTargetStates_NC = function(ed){
    var mHTML = "<ul>";
    for(i = 0; i < ed.length; ++i) {
        mHTML = mHTML + '<li><table> <tr> <td> <a onclick="F_showTarget_NC(\'' + i + '\')"> Target '  + (i+1) + '</a>' + '</td></tr></table> </li>';
    }
    mHTML = mHTML + '</ul>';
    document.getElementById('targetModels').innerHTML = mHTML;
};

var F_showTarget_NC = function(index){
    var currentSpecName = M_selected_metamodel.name;
    console.log('F_showTarget...' + currentSpecName);
    if(index >= ed.length)
        return;

    var Si = ed[index];
    var i;
    console.log(Si);

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

    // draw result in the paper.
    console.log(Si);
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
    F_showModel(currentSpecName, false);
    Si.drawingCompleted = true;
};






var transformDPO_NC = function(ruleType){

    var useRules = allRules;
    if(ruleType == 1)
        useRules = allProductionRules;

    if(theMetaModelStack.metamodel.length <= 1)
        return;

    var S0 = theMetaModelStack;
    /*
    S0.maxNodeIdSnapshot = maxDpfNodeId;
    S0.maxConnIdSnapshot = maxDpfConnectionId;*/

    resetCreationLayerNumbers_NC(S0);
    ing = [];
    ed = [];
    ing.push(S0);

    try {
        if(useRules.length == 0)
            return;

        // check for dangling edge in the rules
        for(var i = 0; i < useRules.length; ++i) {
            var theRule = useRules[i];
            for (var j = 0; j < theRule.elements_to_delete.length; ++j) {
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

        while(ing.length > 0) {
            var state = ing.pop();
            var Si = copyState(state);

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
                        var existingPredConst = metaModelspec.predicateConstraints;


                        for (var p = 0; p < existingPredConst.length; ++p) {
                            if (existingPredConst[p].predicate == thePredicate) {
                                var Ti = findInjectiveMatchAndApplyRule_NC(thePredicate, theRule, existingPredConst[p], processingLayer, Si, j );

                                if(Ti != null){
                                    // store the result state and push it into the ing array..
                                    if(isUnique(ing, ed, Ti))
                                        ing.push(Ti);

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

            if(leafNode){
                // store it into ed[]
                // copy coordinates...
                if(isUnique([], ed, Si)) {
                    copyCoordinates(Si);
                    ed.push(Si);
                }
            }
        }
        populateTargetStates_NC(ed);
    }catch(err) { showErrorMessage('F_error', err);  }

};


var findInjectiveMatchAndApplyRule_NC = function(thePredicate, theRule, thePredConst, processingLayer, Si, processingIndex){
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

    console.log('processing rule ' + theRule.ruleId);

    for(var i = 0; i < thePredConst.attachedModelConns.length; ++i){
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
    var result = findAnInjectiveMatch_phase1_NC(L_pairConns, L_pairNodes, N_pairConns, -1, [], theRule);
    console.log(result.connPair);
    console.log(result.nodePair);
    if(L_pairNodes.length != 0 && result.connPair.length ==0 && result.nodePair.length ==0)
        return null;

    flag = false;
    console.log('processing R_NodesMap..');
    var Ti = copyState(Si);
    var modelSpec = Ti.metamodel[processingIndex].modelSpec;
    for(i = 0; i < R_NodesMap.length; ++i){
        var nodeType = R_NodesMap[i].trgNode;
        var nodeName = ":" + nodeType.name;
        console.log('creating new dpf node: ' + nodeName);
        var newNode = new DpfNode(nodeName, modelSpec, Ti.allDpfNodes);
        newNode.setCreationLayerNumber(processingLayer + 1);


        flag = true;
        var typingOfNode = new DpfTypingOfNode(newNode, nodeType);
    }

    console.log('processing R_ConnsMap..');
    for(i = 0; i < R_ConnsMap.length; ++i){
        var connType = R_ConnsDelta[i].trgConn;
        console.log(connType);
        var X1 = R_ConnsMap[i].fromNode;
        var Y1 = R_ConnsMap[i].toNode;
        var imgX1 = null;
        var imgY1 = null;
        for(j = 0; j < result.nodePair.length; ++j){
            if(result.nodePair[j].rx.ID == X1.ID){
                imgX1 = result.nodePair[j].mx;
                break;
            }
        }
        for(j = 0; j < result.nodePair.length; ++j){
            if(result.nodePair[j].rx.ID == Y1.ID){
                imgY1 = result.nodePair[j].mx;
                break;
            }
        }
        if(imgX1 == null || imgY1 == null){
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


    for(i = 0; i < result.connPair.length; ++i){
        var aPair = result.connPair[i];
        if(containsDpfElement(theRule.elements_to_delete, aPair.rx)){
            // find aPair.mx from Ti
            var connToDelete = null;
            for(j = 0; j < Ti.allDpfConns.length; ++j){
                if(aPair.mx.ID == Ti.allDpfConns[j].ID){
                    connToDelete = Ti.allDpfConns[j];
                    break;
                }

            }
            console.log('deleting connection ' + connToDelete.name);
            connToDelete.deleteDpfConnectionOnly(Ti.allDpfConns);
            allConnsList = [];
            for(i = 0; i < Ti.allDpfConns.length; ++i){
                if(Ti.allDpfConns[i].ID != connToDelete.ID)
                    allConnsList.push(Ti.allDpfConns[i]);
            }
            Ti.allDpfConns = allConnsList;
            flag = true;
        }
    }

    for(i = 0; i < result.nodePair.length; ++i){
        aPair = result.nodePair[i];
        if(containsDpfElement(theRule.elements_to_delete, aPair.rx)){
            // find aPair.mx from Ti
            var nodeToDelete = null;
            for(j = 0; j < Ti.allDpfNodes.length; ++j){
                if(aPair.mx.ID == Ti.allDpfNodes[j].ID){
                    nodeToDelete = Ti.allDpfNodes[j];
                    break;
                }

            }
            console.log('deleting node ' + nodeToDelete.name);
            nodeToDelete.deleteDpfNodeOnly(Ti.allDpfNodes);
            allNodesList = [];
            for(i = 0; i < Ti.allDpfNodes.length; ++i){
                if(Ti.allDpfNodes[i].ID != nodeToDelete.ID)
                    allNodesList.push(Ti.allDpfNodes[i]);
            }
            Ti.allDpfNodes = allNodesList;
            flag = true;
        }
    }

    return Ti;

};


var findAnInjectiveMatch_phase1_NC = function(L_pairConns, L_pairNodes, N_pairConns, currentIndex, connPair_run,  theRule){
    currentIndex = currentIndex + 1;
    var result = null, rx = null, mx = null;

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
        // go to phase 2
        nodePair_run = findAnInjectiveMatch_phase2_NC(L_pairNodes, N_pairConns, -1, connPair_run, nodePair_run, theRule);
        if(nodePair_run.length == 0)
            return {'connPair': [], 'nodePair': []};
        else
            return {'connPair': connPair_run, 'nodePair': nodePair_run};
    }

    var lastX = null;
    if(connPair_run.length > 0)
        lastX = connPair_run[connPair_run.length - 1].rx;


    if(lastX != L_pairConns[currentIndex].rx ){
        // skip considering current pair... but this is only possible if there are other choices... so lets look ahead
        if(currentIndex + 1 < L_pairConns.length && L_pairConns[currentIndex].rx == L_pairConns[currentIndex+1].rx) {
            result = findAnInjectiveMatch_phase1_NC(L_pairConns, L_pairNodes, N_pairConns, currentIndex, connPair_run, theRule);
            // if result is complete, then return result...
            if(result.nodePair.length > 0)
                return result;
        }

        // must consider the current connection instance... check eligibility first
        rx = L_pairConns[currentIndex].rx;
        mx = L_pairConns[currentIndex].mx;

        // 1. if a connection in the left hand side has same source and target, them it must be the same in the connection instance
        if(rx.fromNode == rx.toNode){
            if(mx.fromNode != mx.toNode)
                return {'connPair': [], 'nodePair': []};
        }
        // 2. connection from the rule must preserve the same structure in the connection instance
        for(var i = 0; i < connPair_run.length; ++i){
            var rxPrev = connPair_run[i].rx;
            var mxPrev = connPair_run[i].mx;

            if(rx.fromNode == rxPrev.fromNode){
                if(mx.fromNode != mxPrev.fromNode)
                    return {'connPair': [], 'nodePair': []};
            }
            if(rx.fromNode == rxPrev.toNode){
                if(mx.fromNode != mxPrev.toNode)
                    return {'connPair': [], 'nodePair': []};
            }
            if(rx.toNode == rxPrev.fromNode){
                if(mx.toNode != mxPrev.fromNode)
                    return {'connPair': [], 'nodePair': []};
            }
            if(rx.toNode == rxPrev.toNode){
                if(mx.toNode != mxPrev.toNode)
                    return {'connPair': [], 'nodePair': []};
            }
        }

        var copyConnPair_run = [];
        for (i = 0; i < connPair_run.length; ++i)
            copyConnPair_run.push(connPair_run[i]);

        copyConnPair_run.push(L_pairConns[currentIndex]);
        return findAnInjectiveMatch_phase1_NC(L_pairConns, L_pairNodes, N_pairConns, currentIndex, copyConnPair_run, theRule);

    }
    else{
        return findAnInjectiveMatch_phase1_NC(L_pairConns, L_pairNodes, N_pairConns, currentIndex, connPair_run, theRule);
    }



};

var checkForDanglingEdge = function(connPair, nodePair, theRule){
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

var findAnInjectiveMatch_phase2_NC = function(L_pairNodes, N_pairConns, currentIndex, connPair_run, nodePair_run, theRule){
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
        if(checkForDanglingEdge(connPair_run, nodePair_run, theRule))
            return [];

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
            result = findAnInjectiveMatch_phase2_NC(L_pairNodes, N_pairConns, currentIndex, connPair_run, nodePair_run, theRule);
            // if result is complete, then return result...
            if(result.length > 0)
                return result;
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
        return findAnInjectiveMatch_phase2_NC(L_pairNodes, N_pairConns, currentIndex, connPair_run, copyNodePair_run, theRule);

    }
    else{
        return findAnInjectiveMatch_phase2_NC(L_pairNodes, N_pairConns, currentIndex, connPair_run, nodePair_run, theRule);
    }



};

