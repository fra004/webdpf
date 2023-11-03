/**
 * Created by rabbi on 3/10/15.
 */

var exploreSrc = false;
var exploreTrg = false;
var selectedDrawingArea = 0;
var queryResults = [];
var r_fromNode = null;
var r_toNode = null;

var setDrawingArea = function(screenNo){

    document.getElementById('Q_Screen0').src = "images/tablet.png";
    document.getElementById('Q_Screen1').src = "images/tablet.png";
    document.getElementById('Q_Screen2').src = "images/tablet.png";
    document.getElementById('Q_Screen3').src = "images/tablet.png";

    document.getElementById('Q_Screen' + screenNo).src = "images/draw.png";
    selectedDrawingArea = screenNo;

};

var toggleExploreSrc = function(){
    exploreSrc = !exploreSrc;
    if(exploreSrc)
        document.getElementById('Q_ExploreSrc').style.border = "2px solid #000000";
    else
        document.getElementById('Q_ExploreSrc').style.border = "0px solid #000000";
};

var toggleExploreTrg = function(){
    exploreTrg = !exploreTrg;
    if(exploreTrg)
        document.getElementById('Q_ExploreTrg').style.border = "2px solid #000000";
    else
        document.getElementById('Q_ExploreTrg').style.border = "0px solid #000000";
};

var pasteNodeValue = function(meta_fieldId, model_fieldId){
    if(highlightedNode == null)
        return;
    if(highlightedNode.spec.level == 0 || highlightedNode.spec.level == 2){
        if(selectedDrawingArea == 1)
            document.getElementById(meta_fieldId).value = highlightedNode.name;
        else
            document.getElementById(model_fieldId).value = highlightedNode.name;
    }
    else {
        if(selectedDrawingArea == 1)
            document.getElementById(model_fieldId).value = highlightedNode.name;
    }
};

var pasteNodeValueInReachableField1 = function(){
    if(highlightedNode == null)
        return;

    document.getElementById('Q_R_Node_src').value = highlightedNode.name;
    r_fromNode = highlightedNode;
};

var pasteNodeValueInReachableField2 = function(){
    if(highlightedNode == null)
        return;

    document.getElementById('Q_R_Node_trg').value = highlightedNode.name;
    r_toNode = highlightedNode;
};

var pasteEdgeValue = function(meta_fieldId, model_fieldId){
    if(highlightedConn == null)
        return;
    if(highlightedConn.spec.level == 0 || highlightedConn.spec.level == 2){
        if(selectedDrawingArea == 1)
            document.getElementById(meta_fieldId).value = highlightedConn.name;
        else
            document.getElementById(model_fieldId).value = highlightedConn.name;
    }
    else {
        if(selectedDrawingArea == 1)
            document.getElementById(model_fieldId).value = highlightedConn.name;
    }
};

var recycleDrawingPane = function(){
    var spec = dpfSpecifications[selectedDrawingArea];
    cleanupDrawingPane(spec);
    setDisplayFlag(spec, 2);
    if(selectedDrawingArea == 0)
    cleanupTypingOfDrawingPane(dpfSpecifications[1]);
};

var setDisplayFlag = function(spec, displayFlag){
    var nodes = spec.nodes;
    var connections = spec.connections;
    var i = 0, j = 0, l = 0;

    for (j = 0; j < nodes.length; ++j) {
        var node = nodes[j];
        node.displayFlag = displayFlag;

        var typing = node.typing;
        if(typing)
            typing.displayFlag = displayFlag;
    }
    for (j = 0; j < connections.length; ++j) {
        var conn = connections[j];
        conn.displayFlag = displayFlag;
        if(conn.typing)
            conn.typing.displayFlag = displayFlag;
    }

    var predicateConstraints = spec.predicateConstraints;
    for(j = 0; j < predicateConstraints.length; ++j){
        predicateConstraints[j].displayFlag = displayFlag;
    }

};

var cleanupTypingOfDrawingPane = function(spec){
    var nodes = spec.nodes;
    var connections = spec.connections;
    var i = 0, j = 0, l = 0;

    for (j = 0; j < nodes.length; ++j) {
        var node = nodes[j];

        var typing = node.typing;
        if(typing && typing.type.displayFlag > 0)
            typing.d_line.hide();
    }
    for (j = 0; j < connections.length; ++j) {
        var conn = connections[j];
        if(conn.typing && conn.typing.type.displayFlag > 0)
            conn.typing.d_line.hide();
    }
};

var getInputValueFromField = function(fieldId){
    var val = document.getElementById(fieldId).value;
    if(val == null || val.length == 0)
        return "";
    else return val.toLowerCase();

};

var performQuery = function(){
    var modelSpec = dpfSpecifications[selectedDrawingArea];
    var metaSpec  = null;
    for(var i = 0; i < theMetaModelStack.metamodel.length; ++i){
        if(theMetaModelStack.metamodel[i].modelSpec == modelSpec) {
            metaSpec = theMetaModelStack.metamodel[i].metaModelSpec;
            break;
        }
    }

    var nodeType_src = getInputValueFromField('Q_NodeType_src');
    var edgeType = getInputValueFromField('Q_EdgeType');
    var nodeType_trg = getInputValueFromField('Q_NodeType_trg');

    var node_src = getInputValueFromField('Q_Node_src');
    var edge = getInputValueFromField('Q_Edge');
    var node_trg = getInputValueFromField('Q_Node_trg');

    var resultNodes = modelSpec.nodes;
    var filteredNodes = [];
    var aNode, typeNode, typeNodeName, conns, aConn, typeConnName, typeConn;

    if(nodeType_src.length == 0 && edgeType.length == 0 && nodeType_trg.length == 0 &&
       node_src.length == 0 && edge.length == 0 && node_trg.length == 0){
        populateQueryResults(resultNodes);
        return;
    }

    //try {
        if (nodeType_src.length > 0) {
            if (metaSpec == null)
                throw 'meta model not found';

            for(i = 0; i < resultNodes.length; ++i){
                aNode = resultNodes[i];
                typeNode = aNode.typing.type;
                typeNodeName = typeNode.name.toLowerCase();

                if(typeNodeName.indexOf(nodeType_src) > -1)
                    filteredNodes.push(aNode);
            }
        }



        if (edgeType.length > 0) {
            if (metaSpec == null)
                throw 'meta model not found';

            if (nodeType_src != null && nodeType_src.length > 0) {
                resultNodes = filteredNodes;
                filteredNodes = [];
            }
            else {
                resultNodes = modelSpec.nodes;
                filteredNodes = [];
            }

            for(i = 0; i < resultNodes.length; ++i){
                aNode = resultNodes[i];
                conns = aNode.conn;
                //console.log(aNode);
                for(var j = 0; j < conns.length; ++j){
                    aConn = conns[j];
                    if(aConn.fromNode.ID != aNode.ID)
                        continue;

                    typeConn = aConn.typing.type;
                    typeConnName = typeConn.name.toLowerCase();
                    if(typeConnName.indexOf(edgeType) > -1) {
                        if (nodeType_trg != null && nodeType_trg.length > 0) {
                            typeNodeName = typeConn.toNode.name.toLowerCase();
                            console.log(typeNodeName);
                            if(typeNodeName.indexOf(nodeType_trg) > -1){
                                filteredNodes.push(aNode);
                                break;
                            }
                        }
                        else {
                            filteredNodes.push(aNode);
                            break;
                        }
                    }
                }
            }
        }

    if (node_src.length > 0) {
        if(filteredNodes.length > 0){
            resultNodes = filteredNodes;
            filteredNodes = [];
        }
        for(i = 0; i < resultNodes.length; ++i){
            aNode = resultNodes[i];

            if(aNode.name.toLowerCase().indexOf(node_src) > -1)
                filteredNodes.push(aNode);
        }
    }

    if (edge.length > 0) {
        if(filteredNodes.length > 0){
            resultNodes = filteredNodes;
            filteredNodes = [];
        }

        for(i = 0; i < resultNodes.length; ++i){
            aNode = resultNodes[i];
            conns = aNode.conn;
            //console.log(aNode);
            for(j = 0; j < conns.length; ++j){
                aConn = conns[j];
                if(aConn.fromNode.ID != aNode.ID)
                    continue;

                if(aConn.name.toLowerCase().indexOf(edge) > -1) {

                    if (nodeType_trg != null && nodeType_trg.length > 0) {
                                typeNodeName = aConn.typing.type.toNode.name.toLowerCase();
                                console.log(typeNodeName);
                                if (typeNodeName.indexOf(nodeType_trg) > -1) {

                                    if (node_trg != null && node_trg.length > 0) {
                                        if (aConn.toNode.name.toLowerCase().indexOf(node_trg) > -1) {
                                            filteredNodes.push(aNode);
                                            break;
                                        }
                                    }
                                    else {
                                        filteredNodes.push(aNode);
                                        break;
                                    }
                                }
                    }

                    else {
                        if (node_trg != null && node_trg.length > 0) {
                            if (aConn.toNode.name.toLowerCase().indexOf(node_trg) > -1) {
                                filteredNodes.push(aNode);
                                break;
                            }
                        }
                        else {
                            filteredNodes.push(aNode);
                            break;
                        }
                    }
                }
            }
        }
    }
    else if (node_trg.length > 0) {
        if(filteredNodes.length > 0){
            resultNodes = filteredNodes;
            filteredNodes = [];
        }

        for(i = 0; i < resultNodes.length; ++i){
            aNode = resultNodes[i];
            conns = aNode.conn;

            for(j = 0; j < conns.length; ++j) {
                aConn = conns[j];
                if (aConn.fromNode.ID != aNode.ID)
                    continue;


                if (aConn.toNode.name.toLowerCase().indexOf(node_trg) > -1) {
                    filteredNodes.push(aNode);
                    break;
                }
            }
        }
    }

    populateQueryResults(filteredNodes);

    //}catch(err){ showErrorMessage('Q_error', err); }

};

var populateQueryResults = function(results){
    var mHTML = "<ul>";
    queryResults = results;
    for(i = 0; i < results.length; ++i) {
        var aNode = results[i];
        var typeNode = null;
        if(aNode.typing)
            typeNode = aNode.typing.type;
        mHTML = mHTML + '<li><table> <tr>';

        mHTML = mHTML + '<td width ="90px"><a onclick="Q_showResultTrailer(\'' + aNode.ID + '\')">'  + aNode.name + '</a>' + '</td>';

        if(typeNode != null)
            mHTML = mHTML + '<td> : ' + typeNode.name + '</td>';

        mHTML = mHTML + '<td><img src="images/arrow_right.png"  height="24" width="24" onclick="Q_showResult(\'' + aNode.ID + '\')" ></td></tr></table> </li>';
    }
    mHTML = mHTML + '</ul>';
    document.getElementById('queryResult').innerHTML = mHTML;
};

var Q_showResultTrailer = function(nodeId){

    var spec = dpfSpecifications[0];
    var theNode = null, conn, conns;
    for(var i = 0; i < spec.nodes.length; ++i){
        if(spec.nodes[i].ID == nodeId){
            theNode = spec.nodes[i];
            break;
        }
    }
    if(theNode == null){
        spec = dpfSpecifications[1];
        for(i = 0; i < spec.nodes.length; ++i){
            if(spec.nodes[i].ID == nodeId){
                theNode = spec.nodes[i];
                break;
            }
        }
    }
    if(theNode == null)
        return;
    // cleanup items with displayFlag 1 first
    cleanupTemporaryResultsFromDisplay(spec);
    showNodeInDisplay(theNode, 1);
};

var showNodeInDisplay = function(theNode, dispFlag){
    theNode.displayFlag = dispFlag;
    var nodeTypingFlag = nodeTypingSetting;
    var edgeTypingFlag = edgeTypingSetting;
    if(theNode.spec == dpfSpecifications[0]) {
        nodeTypingFlag = false;
        edgeTypingFlag = false;
    }
    if(dispFlag == 0)
        theNode.show(nodeTypingFlag);
    else
        theNode.temporaryshow(nodeTypingFlag);
    if(exploreSrc){
        exploreSrcNodes(theNode, dispFlag, nodeTypingFlag, edgeTypingFlag);
    }
    if(exploreTrg){
        exploreTrgNodes(theNode, dispFlag, nodeTypingFlag, edgeTypingFlag);
    }
};

var exploreTrgNodes = function(theNode, dispFlag, nodeTypingFlag, edgeTypingFlag){
    var conns = theNode.conn;
    for(var i = 0; i < conns.length; ++i){
        var conn = conns[i];
        if(conn.fromNode.ID == theNode.ID){
            conn.displayFlag = dispFlag;
            if(dispFlag == 0)
                conn.show(edgeTypingFlag);
            else
                conn.temporaryshow(edgeTypingFlag);
            if(conn.toNode.displayFlag > dispFlag) {
                conn.toNode.displayFlag = dispFlag;
                if(dispFlag == 0)
                    conn.toNode.show(nodeTypingFlag);
                else
                    conn.toNode.temporaryshow(nodeTypingFlag);
            }
        }
    }
};

var exploreSrcNodes = function(theNode, dispFlag, nodeTypingFlag, edgeTypingFlag){
    var conns = theNode.conn;
    for(var i = 0; i < conns.length; ++i){
        var conn = conns[i];
        if(conn.toNode.ID == theNode.ID){
            conn.displayFlag = dispFlag;
            if(dispFlag == 0)
                conn.show(edgeTypingFlag);
            else
                conn.temporaryshow(edgeTypingFlag);
            if(conn.fromNode.displayFlag > dispFlag) {
                conn.fromNode.displayFlag = dispFlag;
                if(dispFlag == 0)
                    conn.fromNode.show(nodeTypingFlag);
                else
                    conn.fromNode.temporaryshow(nodeTypingFlag);
            }
        }
    }
};

var hideTrgNodes = function(theNode, dispFlag){
    var conns = theNode.conn;
    for(var i = 0; i < conns.length; ++i){
        var conn = conns[i];
        if(conn.fromNode.ID == theNode.ID && conn.toNode.ID != theNode.ID){
            conn.displayFlag = dispFlag;
            conn.hideDpfConnection();

            // hide target node if it does not produce dangling edges
            var trgNode = conn.toNode;
            var danglingFlag = false;
            for(var c = 0; c < trgNode.conn.length; ++c){
                if(trgNode.conn[c].displayFlag < 2){
                    danglingFlag = true; break;
                }
            }
            if(danglingFlag)
                continue;
            trgNode.displayFlag = dispFlag;
            trgNode.hideDpfNode();
        }
    }
};

var hideSrcNodes = function(theNode, dispFlag){
    var conns = theNode.conn;
    for(var i = 0; i < conns.length; ++i){
        var conn = conns[i];
        if(conn.toNode.ID == theNode.ID && conn.fromNode.ID != theNode.ID){
            conn.displayFlag = dispFlag;
            conn.hideDpfConnection();

            // hide src node if it does not produce dangling edges
            var srcNode = conn.fromNode;
            var danglingFlag = false;
            for(var c = 0; c < srcNode.conn.length; ++c){
                if(srcNode.conn[c].displayFlag < 2){
                    danglingFlag = true; break;
                }
            }
            if(danglingFlag)
                continue;
            srcNode.displayFlag = dispFlag;
            srcNode.hideDpfNode();
        }
    }
};

var hideTrgConns = function(theNode, dispFlag){
    var conns = theNode.conn;
    for(var i = 0; i < conns.length; ++i){
        var conn = conns[i];
        if(conn.fromNode.ID == theNode.ID && conn.toNode.ID != theNode.ID){
            conn.displayFlag = dispFlag;
            conn.hideDpfConnection();
        }
    }
};

var hideSrcConns = function(theNode, dispFlag){
    var conns = theNode.conn;
    for(var i = 0; i < conns.length; ++i){
        var conn = conns[i];
        if(conn.toNode.ID == theNode.ID && conn.fromNode.ID != theNode.ID){
            conn.displayFlag = dispFlag;
            conn.hideDpfConnection();
        }
    }
};


var Q_showResult = function(nodeId){

    var spec = dpfSpecifications[0];
    var theNode = null, conn, conns;
    for(var i = 0; i < spec.nodes.length; ++i){
        if(spec.nodes[i].ID == nodeId){
            theNode = spec.nodes[i];
            break;
        }
    }
    if(theNode == null){
        spec = dpfSpecifications[1];
        for(i = 0; i < spec.nodes.length; ++i){
            if(spec.nodes[i].ID == nodeId){
                theNode = spec.nodes[i];
                break;
            }
        }
    }
    if(theNode == null)
        return;

    // cleanup items with displayFlag 1 first
    cleanupTemporaryResultsFromDisplay(spec);
    showNodeInDisplay(theNode, 0);

};

var cleanupTemporaryResultsFromDisplay = function(spec){
    for(var i = 0; i < spec.nodes.length; ++i){
        if(spec.nodes[i].displayFlag == 1) {
            spec.nodes[i].hideDpfNode();
            spec.nodes[i].displayFlag = 2;
        }
    }
    for(i = 0; i < spec.connections.length; ++i){
        if(spec.connections[i].displayFlag == 1) {
            spec.connections[i].hideDpfConnection();
            spec.connections[i].displayFlag = 2;
        }
    }
};

var Q_showAllResults = function(){
    for(var i = 0; i < queryResults.length; ++i){
        showNodeInDisplay(queryResults[i], 0);
    }
};

var removeQueryResult = function(){
    populateQueryResults([]);
    spec = dpfSpecifications[selectedDrawingArea];
    // cleanup items with displayFlag 1
    cleanupTemporaryResultsFromDisplay(spec);

};

var zoomIntoSrcNodes = function(){
  if(highlightedNode == null)
    return;

    var nodeTypingFlag = nodeTypingSetting;
    var edgeTypingFlag = edgeTypingSetting;
    if(highlightedNode.spec == dpfSpecifications[0]) {
        nodeTypingFlag = false;
        edgeTypingFlag = false;
    }
    highlightedNode.displayFlag = 0;
    highlightedNode.show(nodeTypingFlag);
    exploreSrcNodes(highlightedNode, 0, nodeTypingFlag, edgeTypingFlag);
};

var zoomOutFromTrgNodes = function(){
    if(highlightedNode == null)
        return;

    hideTrgNodes(highlightedNode, 2);
};

var zoomOutFromSrcNodes = function(){
    if(highlightedNode == null)
        return;

    hideSrcNodes(highlightedNode, 2);
};

var zoomIntoTrgNodes = function(){
    if(highlightedNode == null)
        return;
    var nodeTypingFlag = nodeTypingSetting;
    var edgeTypingFlag = edgeTypingSetting;
    if(highlightedNode.spec == dpfSpecifications[0]) {
        nodeTypingFlag = false;
        edgeTypingFlag = false;
    }
    highlightedNode.displayFlag = 0;
    highlightedNode.show(nodeTypingFlag);
    exploreTrgNodes(highlightedNode, 0, nodeTypingFlag, edgeTypingFlag);
};

var hideAnElement = function(){
//  if(highlightedConn){
//      highlightedConn.displayFlag = 2;
//      highlightedConn.hideDpfConnection();
//  }
  if(highlightedNode){
      highlightedNode.displayFlag = 2;
      highlightedNode.hideDpfNode();
      hideSrcConns(highlightedNode, 2);
      hideTrgConns(highlightedNode, 2);
  }
};

var hideConnectedElementsRecursively = function(theNode){
    if(theNode.displayFlag == 2)
        return;
    theNode.displayFlag = 2;
    theNode.hideDpfNode();

    var conns = theNode.conn;
    for(var i = 0; i < conns.length; ++i){
        var conn = conns[i];
        if(conn.displayFlag == 2)
            continue;

        conn.displayFlag = 2;
        conn.hideDpfConnection();

        hideConnectedElementsRecursively(conn.fromNode);
        hideConnectedElementsRecursively(conn.toNode);
    }

};

var hideConnectedElements = function(){
    if(highlightedNode){
        hideConnectedElementsRecursively(highlightedNode);
    }
};

var resetExploreFlag = function(nodes){
    for(var i = 0; i < nodes.length; ++i){
        nodes[i].exploreFlag = 0;
    }
};

var reachNodes = function(){
    if(r_fromNode == null || r_toNode == null)
        return;

    if(r_fromNode.spec != r_toNode.spec)
        return;

    if(r_fromNode.spec == dpfSpecifications[0] || r_fromNode.spec == dpfSpecifications[1]){
        // ok
    }
    else
        return;

    resetExploreFlag(r_fromNode.spec.nodes);

    for(var i = 0; i < r_fromNode.conn.length; ++i){
        if(traverseNodes(r_fromNode, r_fromNode.conn[i], r_toNode, [r_fromNode]))
            break;
    }
};

var traverseNodes = function(fromNode, theConn, toNode, visitedElements){
    //console.log(fromNode.name + '  -> ' + theConn.name );
    if(theConn.exploreFlag == 1)
        return false;

    theConn.exploreFlag = 1;
    var newVisitedElements = [], i = 0;

  if(theConn.fromNode == toNode || theConn.toNode == toNode){
      //set displayFlag to 0 and show nodes..
      var nodeTypingFlag = nodeTypingSetting;
      var edgeTypingFlag = edgeTypingSetting;
      if(toNode.spec == dpfSpecifications[0]) {
          nodeTypingFlag = false;
          edgeTypingFlag = false;
      }
      for(i = 0; i < visitedElements.length; ++i){
          visitedElements[i].displayFlag = 0;
          if(visitedElements[i].dpfType == 'DpfNode')
            visitedElements[i].show(nodeTypingFlag);
          else
            visitedElements[i].show(edgeTypingFlag);
      }
      theConn.displayFlag = 0;
      theConn.show(edgeTypingFlag);
      toNode.displayFlag = 0;
      toNode.show(nodeTypingFlag);

      return true;
  }

  var tempNode = null;
  if(theConn.fromNode == fromNode && theConn.toNode == fromNode)
        return false;

  if(theConn.fromNode == fromNode){
      tempNode = theConn.toNode;
  }
  else
      tempNode = theConn.fromNode;

  if(tempNode.exploreFlag == 1)
    return false;
  else{
      for(i = 0; i < visitedElements.length; ++i){
          newVisitedElements.push(visitedElements[i]);
      }

      newVisitedElements.push(theConn);
      tempNode.exploreFlag = 1;
      newVisitedElements.push(tempNode);
      for(i = 0; i < tempNode.conn.length; ++i) {
          if(traverseNodes(tempNode, tempNode.conn[i], toNode, newVisitedElements))
            return true;
      }
  }
    return false;

};