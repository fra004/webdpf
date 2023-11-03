/**
 * Created by rabbi on 2/20/15.
 */

var resetCreationLayerNumbers = function(){
  for(var i = 0; i < allNodes.length; ++i){
      allNodes[i].setCreationLayerNumber(0);
  }
    for(i = 0; i < allConns.length; ++i){
        allConns[i].setCreationLayerNumber(0);
    }
};


var transformDPO = function(){

    if(theMetaModelStack.metamodel.length <= 1)
        return;

    resetCreationLayerNumbers();

    try {
        if(allRules.length == 0)
            return;

        for (var j = 1; j < theMetaModelStack.metamodel.length; ++j) {
            var metaModelspec = theMetaModelStack.metamodel[j].metaModelSpec;
            var modelspec = theMetaModelStack.metamodel[j].modelSpec;

            var noChangeFlag = false;
            var counter = 0;
            var processingLayer = 0;
            console.log('processing instances of ' + theMetaModelStack.metamodel[j].name);

            var startIndex = 0, endIndex = 0;
            while(true) {
                if(endIndex >= allRules.length)
                    break;
                startIndex = endIndex;
                processingLayer = allRules[startIndex].layerNumber;

                for(; endIndex < allRules.length; ++endIndex){
                    if(allRules[endIndex].layerNumber != processingLayer)
                        break;
                }
                console.log('startIndex: ' + startIndex + ' endIndex: ' + endIndex + ' processingLayer: ' + processingLayer);
                noChangeFlag = false;
                while (!noChangeFlag) {
                    noChangeFlag = true;

                    for (var i = startIndex; i < endIndex; ++i) {
                        // try to find injective match with rule
                        var theRule = allRules[i];
                        var thePredicate = theRule.parentPredicate;
                        console.log('considering rule : ' + theRule.ruleId);
                        var existingPredConst = metaModelspec.predicateConstraints;
                        for (var p = 0; p < existingPredConst.length; ++p) {
                            if (existingPredConst[p].predicate == thePredicate) {
                                noChangeFlag = !findInjectiveMatchAndApplyRule(thePredicate, theRule, existingPredConst[p], modelspec, processingLayer);
                                console.log(noChangeFlag);
                                counter++;
                                if (counter >= 1000)
                                    noChangeFlag = true;
                                if (!noChangeFlag) {
                                    break;
                                }
                            }
                        }
                        if (!noChangeFlag)
                            break;
                    }
                }
            }

        }
    }catch(err) { showErrorMessage('F_error', err);  }

    if(counter >= 1000)
        showErrorMessage('F_error', "Problem processing rules. \nRules are possibly non terminating");

};

var findInjectiveMatchAndApplyRule = function(thePredicate, theRule, thePredConst, modelSpec, processingLayer){
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
                return false; // constrained connection in the left hand side has no instance in the model
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
                return false; // constrained connection in the left hand side has no instance in the model
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
                return false; // constrained node in the left hand side has no instance in the model
            }


            for (j = 0; j < trgTypeInstances.length; ++j) {
                y = trgTypeInstances[j].from;

                if(flag == 0 && y.creationLayer <= processingLayer)
                    L_pairNodes.push({'rx': x , 'mx': y});
                else if(flag == 1) {
                    //N_pairNodes.push({'rx': x, 'mx': y});
                    console.log('nac is not satisfied with ' + y.ID);
                    return false;
                }
                else if(flag == 2 && y.creationLayer <= processingLayer) {
                    L_pairNodes.push({'rx': x , 'mx': y});
                    D_pairNodes.push({'rx': x, 'mx': y});
                }
            }

            if( (flag == 0 || flag == 2) && L_pairNodes.length == 0) {
                console.log('constrained node in the left hand side has no instance in the model');
                return false; // constrained node in the left hand side has no instance in the model
            }


        }
    }

    console.log('calling findAnInjectiveMatch_phase1');
    var result = findAnInjectiveMatch_phase1(L_pairConns, L_pairNodes, N_pairConns, -1, [], []);
    console.log(result.connPair);
    console.log(result.nodePair);
    if(L_pairNodes.length != 0 && result.connPair.length ==0 && result.nodePair.length ==0)
        return false;

    var nodeTypingFlag = nodeTypingSetting;
    var edgeTypingFlag = edgeTypingSetting;
    if(modelSpec == dpfSpecifications[0]) {
        nodeTypingFlag = false;
        edgeTypingFlag = false;
    }

    flag = false;
    console.log('processing R_NodesMap..');
    for(i = 0; i < R_NodesMap.length; ++i){
        var nodeType = R_NodesMap[i].trgNode;
        var nodeName = ":" + nodeType.name;
        console.log('creatign new dpf node: ' + nodeName);
        var newNode = new DpfNode(nodeName, modelSpec, allNodes);
        newNode.setCreationLayerNumber(processingLayer + 1);

        flag = true;
        if(modelSpec == dpfSpecifications[0]){
            xPos = drawingPane[0].attr('x') + 20;
            yPos = drawingPane[0].attr('y') + 20;
        }
        else {
            xPos = drawingPane[1].attr('x') + 20;
            yPos = drawingPane[1].attr('y') + 20;
        }
        newNode.setNodePosition(xPos, yPos);
        newNode.drawNode();
        var typingOfNode = new DpfTypingOfNode(newNode, nodeType);
        typingOfNode.drawTypingForNode();
        if(modelSpec == dpfSpecifications[0]){
            typingOfNode.d_line.hide();
        }
        else if(modelSpec == dpfSpecifications[1]){
            if(!nodeTypingFlag)
                typingOfNode.d_line.hide();
        }
        else{
            newNode.hideDpfNode();
            newNode.typing.d_line.hide();
        }
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
        var newConn = new DpfConnection(connName, imgX1, imgY1, modelSpec, allConns);
        imgX1.displayFlag = 0;
        imgY1.displayFlag = 0;



        imgX1.show(nodeTypingFlag);
        imgY1.show(nodeTypingFlag);
        flag = true;
        newConn.drawConnection();

        var typingOfConn = new DpfTypingOfConnection(newConn, connType);
        typingOfConn.drawTypingForConnection();

        if(modelSpec == dpfSpecifications[0]){
            // hide typing
            typingOfConn.d_line.hide();
        }
        else if(modelSpec == dpfSpecifications[1]){
            if(!edgeTypingFlag)
                typingOfConn.d_line.hide();
        }
        else{
            imgX1.hideDpfNode();
            imgY1.hideDpfNode();
            newConn.hideDpfConnection();
            typingOfConn.d_line.hide();
        }
    }


    for(i = 0; i < result.connPair.length; ++i){
        var aPair = result.connPair[i];
        if(containsDpfElement(theRule.elements_to_delete, aPair.rx)){
            console.log('deleting connection ' + aPair.mx.name);
            aPair.mx.deleteDpfConnection();
            flag = true;
        }
    }

    for(i = 0; i < result.nodePair.length; ++i){
        aPair = result.nodePair[i];
        if(containsDpfElement(theRule.elements_to_delete, aPair.rx)){
            console.log('deleting node ' + aPair.mx.name);
            aPair.mx.deleteDpfNode();
            flag = true;
        }
    }

    return flag;

};


var findAnInjectiveMatch_phase1 = function(L_pairConns, L_pairNodes, N_pairConns, currentIndex, connPair_run){
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
        nodePair_run = findAnInjectiveMatch_phase2(L_pairNodes, N_pairConns, -1, connPair_run, nodePair_run);
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
            result = findAnInjectiveMatch_phase1(L_pairConns, L_pairNodes, N_pairConns, currentIndex, connPair_run);
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
        return findAnInjectiveMatch_phase1(L_pairConns, L_pairNodes, N_pairConns, currentIndex, copyConnPair_run);

    }
    else{
        return findAnInjectiveMatch_phase1(L_pairConns, L_pairNodes, N_pairConns, currentIndex, connPair_run);
    }



};



var findAnInjectiveMatch_phase2 = function(L_pairNodes, N_pairConns, currentIndex, connPair_run, nodePair_run){
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
            result = findAnInjectiveMatch_phase2(L_pairNodes, N_pairConns, currentIndex, connPair_run, nodePair_run);
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
        return findAnInjectiveMatch_phase2(L_pairNodes, N_pairConns, currentIndex, connPair_run, copyNodePair_run);

    }
    else{
        return findAnInjectiveMatch_phase2(L_pairNodes, N_pairConns, currentIndex, connPair_run, nodePair_run);
    }



};