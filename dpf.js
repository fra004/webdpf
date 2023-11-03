/**
 * Created by rabbi on 1/31/15.
 */

var paper;
var drawingPane = [];

var seperator_vertical = null;
var seperator_horizontal = null;

var shapes = [];
var text = [];
var relText = [];
var connections = [];
var predText = [];
var predConnections = [];

var typingConnectionsForNodes = [];
var typingConnectionsForEdges = [];

var windowWidth = 1000;
var windowHeight = 700;

var drawingPaneWidth = 0;
var drawingPaneHeight = 0;

var menuPaneWidth = 0;
var menuPaneHeight = 0;

var M_selected_type_node;
var M_selected_node;

var M_selected_type_arrow;
var M_selected_node_src;
var M_selected_node_trg;
var M_selected_arrow;

var M_node_click = 0;

var P_selected_node;

var P_selected_node_src;
var P_selected_node_trg;

var P_node_click = 0;

var P_selected_pred = null;
var P_selected_arrow = null;
var P_last_selected_item = null;


var P_selected_pred4RuleAnnot = null;
var P_selected_arrow4RuleAnnot = null;
var P_last_selected_item4RuleAnnot = null;
var PR_selected_annotation = null;

var dpfSpecifications = [];

var M_selected_predicate = null;
var M_selected_predicate_const = null;


var C_selected_node = null;
var C_selected_type_arrow = null;
var C_selected_type_node = null;
var C_selected_node_src = null;
var C_selected_node_trg = null;

var C_node_click = 0;

var C_selected_rule = null;
var C_selected_arrow = null;
var C_last_selected_element = null;


var PR_selected_node = null;
var PR_selected_type_arrow = null;
var PR_selected_type_node = null;
var PR_selected_node_src = null;
var PR_selected_node_trg = null;

var PR_node_click = 0;

var PR_selected_rule = null;
var PR_selected_arrow = null;
var PR_last_selected_element = null;


var highlightedConn = null;
var highlightedNode = null;

var maxMetaLevel = 0;
var maxRuleId = 1;
var maxPredicateId = 1;
var maxDpfNodeId = 1;
var maxDpfConnectionId = 1;
var maxDpfConstId = 1;
var maxDpfAnnotId = 1;

var theMetaModelStack = new MetaModelStack();
var M_selected_metamodel = null;
var M_selected_model = null;

var allNodes = [];
var allConns = [];
var allRules = [];
var predErrMsg = [];

var allProductionRules = [];

var copyNodes = [];
var copyConns = [];

var recycleNode1 = [];
var recycleNode2 = [];
var recycleNode3 = [];
var recycleConn1 = [];
var recycleConn2 = [];
var recycleConn3 = [];

var simulateFlag = true;

var clearAllNodesAndConns = function(){
    while(allNodes.length > 0) {
        allNodes.pop();
    }
    while(allConns.length > 0) {
        allConns.pop();
    }
};

var clearCopyArray = function(){
    while(copyNodes.length > 0) {
        copyNodes.pop();
    }
    while(copyConns.length > 0) {
        copyConns.pop();
    }
};

var clearArray = function(array){
    while(array.length > 0) {
        array.pop();
    }
};
var copyArrayContents = function(array1, array2){
    for(var i = 0; i < array1.length; ++i)
        array2.push(array1[i]);
};

var lastOpenedPredicate = null;

var findDpfNodeByIdFromCopyNodes = function(nodeId){
    for(var i = 0; i < copyNodes.length; ++i){
        if(copyNodes[i].ID == nodeId)
            return copyNodes[i];
    }
    return null;
};

var findDpfConnectionByIdFromCopyConns = function(connId){
    for(var i = 0; i < copyConns.length; ++i){
        if(copyConns[i].ID == connId)
            return copyConns[i];
    }
    return null;
};


var findDpfNodeById = function(nodeId){
    for(var i = 0; i < allNodes.length; ++i){
        if(allNodes[i].ID == nodeId)
            return allNodes[i];
    }
    return null;
};
var findDpfConnectionById = function(connId){
    for(var i = 0; i < allConns.length; ++i){
        if(allConns[i].ID == connId)
            return allConns[i];
    }
    return null;
};

var findDpfPredicateById = function(predId){
    var predicates = theMetaModelStack.predSpec.predicates;
    for(var i = 0; i < predicates.length; ++i){
        if(predicates[i].predicateId == predId)
            return predicates[i];
    }
    return null;
};

var hasDpfConnection = function(array){
    for(var i = 0; i < array.length; ++i){
        if(array[i].dpfType == 'DpfConnection')
            return true;
    }
    return false;
};

var containsElement = function(array, x) {
    for(var i = 0; i < array.length; ++i){
        if(array[i].ID == x.ID)
            return true;
    }
    return false;
};

var containsDpfElement = function(array, x) {
    for(var i = 0; i < array.length; ++i){
        if(array[i].dpfType == x.dpfType && array[i].ID == x.ID)
            return true;
    }
    return false;
};

var existsInRuleArray = function(rules, r){
    for(var i = 0; i < rules.length; ++i){
        if(r.ruleId == rules[i].ruleId)
            return true;
    }
    return false;
};

var removeRuleFromRuleArray = function(rules, r){
    var newArray = [];
    for(var i = 0; i < rules.length; ++i){
        if(r.ruleId == rules[i].ruleId)
            continue;
        newArray.push(rules[i]);
    }
    return newArray;
};
