/**
 * Created by rabbi on 2/20/15.
 */


var checkTermination = function(ruleType){

    var useRules = allRules;
    if(ruleType == 1)
        useRules = allProductionRules;

    if(theMetaModelStack.metamodel.length <= 1)
        return;

    clearErrorMessage('F_error');
    // initially make sure that every rule has either one of the following:
    //i) r deletes some elements
    // ii) r has a nac
    var loopZone = [];
    var loopZone2 = [];
    var processingFlag = false;

    for(var i = 0; i < useRules.length; ++i){
        var theRule = useRules[i];
        if(theRule.elements_to_delete.length > 0 || theRule.elements_to_add.length > 0) {
            processingFlag = true; break;
        }
    }
    if(processingFlag == false){
        showErrorMessage('F_error', "The rules do not add/delete anything");
        return;
    }

    processingFlag = false;
    for(i = 0; i < useRules.length; ++i){
        theRule = useRules[i];
        if(theRule.elements_in_nac.length == 0 && theRule.elements_to_delete.length == 0 && theRule.elements_to_add.length > 0)
            loopZone.push(theRule);
    }

    if(loopZone.length > 0){
        var msg = "There are loops in rule(s): ";
        for(i = 0; i < loopZone.length; ++i)
            msg += "[Rule:" + loopZone[i].ruleId + "]";

        showErrorMessage('F_error', msg, true);
        return;
    }

    try{

        for (var j = 1; j < theMetaModelStack.metamodel.length; ++j) {
                var metaModelspec = theMetaModelStack.metamodel[j].metaModelSpec;

                var startIndex = 0, endIndex = 0;
                while(true) {
                    if (endIndex >= useRules.length)
                        break;
                    startIndex = endIndex;
                    processingLayer = useRules[startIndex].layerNumber;

                    for (; endIndex < useRules.length; ++endIndex) {
                        if (useRules[endIndex].layerNumber != processingLayer)
                            break;
                    }
                    console.log('startIndex: ' + startIndex + ' endIndex: ' + endIndex + ' processingLayer: ' + processingLayer);

                    loopZone2 = [];
                    var thePredConst = metaModelspec.predicateConstraints;
                    for (var p = 0; p < thePredConst.length; ++p) {
                        var pred = thePredConst[p].predicate;
                        var rules = pred.completionRules;
                        for (var r = 0; r < rules.length; ++r) {
                            if(rules[r].layerNumber == processingLayer)
                                loopZone2.push(rules[r]);
                        }
                    }


                    for (p = 0; p < thePredConst.length; ++p) {
                        processingFlag = true;
                        loopZone2 = checkForLoop(thePredConst[p], metaModelspec, loopZone2, processingLayer);
                        if (loopZone2.length == 0)
                            break;
                    }

                    if (loopZone2.length == 0) {

                    }
                    else {
                        clearMessage('F_message');
                        msg = "There might be a loop in rule(s): ";
                        for (i = 0; i < loopZone2.length; ++i)
                            msg += "[Rule:" + loopZone2[i].ruleId + "] ";

                        showErrorMessage('F_error', msg, true);
                        return;
                    }
                }

        }

        if(processingFlag) {
            clearErrorMessage('F_error');
            showMessage('F_message', 'The system should terminate');
        }
        else
            showErrorMessage('F_error', "The predicate(s) are not linked to any model", true);

    }catch(err){
        showErrorMessage('F_error', err, true);
    }

};

var checkForLoop = function(thePredConst, metaModelspec, loopZone, processingLayer){

    for (var i = 0; i < thePredConst.attachedModelConns.length; ++i) {
        var thePredicate = thePredConst.predicate;
        var predRules = thePredicate.completionRules;
        var srcTypeInstances = thePredConst.attachedModelConns[i].srcConn.instances;
        var trgTypeConn = thePredConst.attachedModelConns[i].trgConn;

        for (var s = 0; s < srcTypeInstances.length; ++s) {
            var x = srcTypeInstances[s].from;
            for (var r = 0; r < predRules.length; ++r) {
                var theRule = predRules[r];
                if( theRule.layerNumber != processingLayer || !existsInRuleArray(loopZone, theRule))
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
                if (containsDpfElement(theRule.elements_in_nac, x)) {
                    flag = 1;
                    if (!containsDpfElement(theRule.elements_to_add, x)){
                        throw "Rule:" + theRule.ruleId + " may have a loop";
                    }
                }
                else if (containsDpfElement(theRule.elements_to_delete, x))
                    flag = 2;

                if(flag == 0) continue;

                var LC1Flag = false;
                var LC2Flag = false;

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
                                if (theRule2.layerNumber != processingLayer || !existsInRuleArray(loopZone, theRule))
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
                                    if(containsDpfElement(theRule2.elements_to_delete, x2)){
                                        LC2Flag = true; break;
                                    }
                                }
                                if(flag == 2){
                                    if(containsDpfElement(theRule2.elements_to_add, x2)){
                                        LC1Flag = true; break;
                                    }
                                }
                            }
                            if(LC1Flag || LC2Flag) break;
                        }
                        if(LC1Flag || LC2Flag) break;
                    }
                    if(LC1Flag || LC2Flag) break;
                }
                if(LC1Flag || LC2Flag){
                    console.log(LC1Flag);
                    console.log(LC2Flag);
                }
                else{
                    // take the rule away from loopZone
                    loopZone = removeRuleFromRuleArray(loopZone, theRule);
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
                if(theRule.layerNumber != processingLayer || !existsInRuleArray(loopZone, theRule))
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
                if (containsDpfElement(theRule.elements_in_nac, x)) {
                    flag = 1;
                    if (!containsDpfElement(theRule.elements_to_add, x)){
                        throw "Rule:" + theRule.ruleId + " may have a loop";
                    }
                }
                else if (containsDpfElement(theRule.elements_to_delete, x))
                    flag = 2;

                if(flag == 0) continue;

                LC1Flag = false;
                LC2Flag = false;

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
                                if (theRule2.layerNumber != processingLayer || !existsInRuleArray(loopZone, theRule))
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
                                    if(containsDpfElement(theRule2.elements_to_delete, x2)){
                                        LC2Flag = true; break;
                                    }
                                }
                                if(flag == 2){
                                    if(containsDpfElement(theRule2.elements_to_add, x2)){
                                        LC1Flag = true; break;
                                    }
                                }
                            }
                            if(LC1Flag || LC2Flag) break;
                        }
                        if(LC1Flag || LC2Flag) break;
                    }
                    if(LC1Flag || LC2Flag) break;
                }
                if(LC1Flag || LC2Flag){

                }
                else{
                    // take the rule away from loopZone
                    loopZone = removeRuleFromRuleArray(loopZone, theRule);
                }
            }
        }

    }

    return loopZone;
};


//End of code