/**
 * Created by rabbi on 2/20/15.
 */


var makeCriticalPairTable= function(critCol1, critCol2){
    var ruleHTML = "<ul>";
    for(var i = 0; i < critCol1.length; ++i) {
        var aRule = critCol1[i];
        var aRule2 = critCol2[i];
        ruleHTML = ruleHTML + '<li>' +
        '<table> <tr> ' +
        '<td> <a onclick="C_showRuleWithPredicate(' + aRule.ruleId + ')"> Rule: '  + aRule.ruleId + '</a>' + '</td>' +
        '<td> <a onclick="C_showRuleWithPredicate(' + aRule2.ruleId + ')"> Rule: '  + aRule2.ruleId + '</a>' + '</td>' +
        '</tr></table> </li>';
    }
    ruleHTML = ruleHTML + '</ul>';
    document.getElementById('criticalpairs').innerHTML = ruleHTML;
};

var checkCriticalPair = function(){

    if(theMetaModelStack.metamodel.length <= 1)
        return;

    // rule r1 and r2 are in the critical pair if
    //i) r1 deletes x and r2 has x in LHS
    // ii) r1 creates x and r2 has x in NAC

    var criticalZone2 = [];
    var processingFlag = false;
    var critCol1 = [];
    var critCol2 = [];

    for(var i = 0; i < allRules.length; ++i){
        var theRule = allRules[i];
        if(theRule.elements_to_delete.length > 0 || theRule.elements_to_add.length > 0) {
            processingFlag = true; break;
        }
    }
    if(processingFlag == false){
        return;
    }

    processingFlag = false;

    try{

        for (var j = 1; j < theMetaModelStack.metamodel.length; ++j) {
                var metaModelspec = theMetaModelStack.metamodel[j].metaModelSpec;

                var startIndex = 0, endIndex = 0;
                while(true) {
                    if (endIndex >= allRules.length)
                        break;
                    startIndex = endIndex;
                    processingLayer = allRules[startIndex].layerNumber;

                    for (; endIndex < allRules.length; ++endIndex) {
                        if (allRules[endIndex].layerNumber != processingLayer)
                            break;
                    }
                    console.log('startIndex: ' + startIndex + ' endIndex: ' + endIndex + ' processingLayer: ' + processingLayer);

                    criticalZone2 = [];
                    var thePredConst = metaModelspec.predicateConstraints;
                    for (var p = 0; p < thePredConst.length; ++p) {
                        var pred = thePredConst[p].predicate;
                        var rules = pred.completionRules;
                        for (var r = 0; r < rules.length; ++r) {
                            if(rules[r].layerNumber == processingLayer)
                                criticalZone2.push(rules[r]);
                        }
                    }


                    for (p = 0; p < thePredConst.length; ++p) {
                        processingFlag = true;
                        checkForCriticalPair(thePredConst[p], metaModelspec, criticalZone2, processingLayer, critCol1, critCol2);
                    }

                }

        }

        makeCriticalPairTable(critCol1, critCol2);

    }catch(err){
        showErrorMessage('F_error', err, true);
    }

};

var checkForCriticalPair = function(thePredConst, metaModelspec, criticalZone2, processingLayer, critCol1, critCol2){

    for (var i = 0; i < thePredConst.attachedModelConns.length; ++i) {
        var thePredicate = thePredConst.predicate;
        var predRules = thePredicate.completionRules;
        var srcTypeInstances = thePredConst.attachedModelConns[i].srcConn.instances;
        var trgTypeConn = thePredConst.attachedModelConns[i].trgConn;

        for (var s = 0; s < srcTypeInstances.length; ++s) {
            var x = srcTypeInstances[s].from;
            for (var r = 0; r < predRules.length; ++r) {
                var theRule = predRules[r];
                if( theRule.layerNumber != processingLayer || !existsInRuleArray(criticalZone2, theRule))
                    continue;

                var foundInC = false;
                for (var c = 0; c < theRule.conn.length; ++c) {
                    if (theRule.conn[c].ID == x.ID) {
                        foundInC = true;
                        break;
                    }
                }
                if (!foundInC)
                    continue;

                flag = 0;
                if (containsDpfElement(theRule.elements_in_nac, x))
                    flag = 1;

                else if (containsDpfElement(theRule.elements_to_delete, x))
                    flag = 2;

                if(flag == 0) continue;

                var predConsts = metaModelspec.predicateConstraints;
                for (var p = 0; p < predConsts.length; ++p) {
                    for(var j = 0; j < predConsts[p].attachedModelConns.length; ++j){
                        var srcTypeInstances2 = predConsts[p].attachedModelConns[j].srcConn.instances;
                        var trgTypeConn2 = predConsts[p].attachedModelConns[j].trgConn;
                        if(trgTypeConn.ID != trgTypeConn2.ID) continue;
                        var thePredicate2 = predConsts[p].predicate;
                        var predRules2 = thePredicate2.completionRules;

                        for (var s2 = 0; s2 < srcTypeInstances2.length; ++s2) {
                            var x2 = srcTypeInstances2[s2].from;
                            for (var r2 = 0; r2 < predRules2.length; ++r2) {
                                var theRule2 = predRules2[r2];
                                if (theRule == theRule2 || theRule2.layerNumber != processingLayer || !existsInRuleArray(criticalZone2, theRule))
                                    continue;

                                var foundInC2 = false;
                                for (var c2 = 0; c2 < theRule2.conn.length; ++c2) {
                                    if (theRule2.conn[c2].ID == x2.ID) {
                                        foundInC2 = true;
                                        break;
                                    }
                                }
                                if (!foundInC2)
                                    continue;

                                if(flag == 1){
                                    if(containsDpfElement(theRule2.elements_to_add, x2)){
                                        addIntoCriticalPair(theRule, theRule2, critCol1, critCol2);
                                    }
                                }
                                if(flag == 2){
                                    if(!containsDpfElement(theRule2.elements_to_add, x2) && !containsDpfElement(theRule2.elements_in_nac, x2)){
                                        addIntoCriticalPair(theRule, theRule2, critCol1, critCol2);
                                    }
                                }
                            }

                        }

                    }

                }

            }
        }
    }


    for( i = 0; i < thePredConst.attachedModelNodes.length; ++i) {
        thePredicate = thePredConst.predicate;
        predRules = thePredicate.completionRules;
        srcTypeInstances = thePredConst.attachedModelNodes[i].srcNode.instances;
        trgTypeNode = thePredConst.attachedModelNodes[i].trgNode;

        for (s = 0; s < srcTypeInstances.length; ++s) {
            x = srcTypeInstances[s].from;
            for (r = 0; r < predRules.length; ++r) {
                theRule = predRules[r];
                if(theRule.layerNumber != processingLayer || !existsInRuleArray(criticalZone2, theRule))
                    continue;

                foundInC = false;
                for (c = 0; c < theRule.nodes.length; ++c) {
                    if (theRule.nodes[c].ID == x.ID) {
                        foundInC = true;
                        break;
                    }
                }
                if (!foundInC)
                    continue;

                flag = 0;
                if (containsDpfElement(theRule.elements_in_nac, x))
                    flag = 1;

                else if (containsDpfElement(theRule.elements_to_delete, x))
                    flag = 2;

                if(flag == 0) continue;


                predConsts = metaModelspec.predicateConstraints;
                for (p = 0; p < predConsts.length; ++p) {
                    for(j = 0; j < predConsts[p].attachedModelNodes.length; ++j){
                        srcTypeInstances2 = predConsts[p].attachedModelNodes[j].srcNode.instances;
                        trgTypeNode2 = predConsts[p].attachedModelNodes[j].trgNode;
                        if(trgTypeNode.ID != trgTypeNode2.ID) continue;
                        thePredicate2 = thePredConst.predicate;
                        predRules2 = thePredicate2.completionRules;

                        for (s2 = 0; s2 < srcTypeInstances2.length; ++s2) {
                            x2 = srcTypeInstances2[s2].from;
                            for (r2 = 0; r2 < predRules2.length; ++r2) {
                                theRule2 = predRules2[r2];
                                if (theRule == theRule2 || theRule2.layerNumber != processingLayer || !existsInRuleArray(criticalZone2, theRule))
                                    continue;

                                foundInC2 = false;
                                for (c2 = 0; c2 < theRule2.nodes.length; ++c2) {
                                    if (theRule2.nodes[c2].ID == x2.ID) {
                                        foundInC2 = true;
                                        break;
                                    }
                                }
                                if (!foundInC2)
                                    continue;

                                if(flag == 1){
                                    if(containsDpfElement(theRule2.elements_to_add, x2)){
                                        addIntoCriticalPair(theRule, theRule2, critCol1, critCol2);
                                    }
                                }
                                if(flag == 2){
                                    if(!containsDpfElement(theRule2.elements_to_add, x2) && !containsDpfElement(theRule2.elements_in_nac, x2)){
                                        addIntoCriticalPair(theRule, theRule2, critCol1, critCol2);
                                    }
                                }
                            }

                        }

                    }

                }

            }
        }

    }

};


var addIntoCriticalPair = function(theRule, theRule2, critCol1, critCol2){
    for(var i = 0; i < critCol1.length; ++i){
        if(critCol1[i] == theRule && critCol2[i] == theRule2)
            return;
        if(critCol1[i] == theRule2 && critCol2[i] == theRule)
            return;
    }
    critCol1.push(theRule);
    critCol2.push(theRule2);
};

//End of code