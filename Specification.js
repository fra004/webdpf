/**
 * Created by rabbi on 2/9/15.
 */

function DpfSpecification(level){

    this.level= level;
    this.nodes= [];
    this.connections= [];
    this.predicates= [];
    this.predicateConstraints= [];

    this.leftOffSet= 0;
    this.rightOffSet = 0;
    this.topOffSet = 0;
    this.bottomOffSet = 0;
}

DpfSpecification.prototype.copySpecCoords = function(){
    for(var i = 0; i < this.nodes.length; ++i){
            this.nodes[i].copyNodeCoords();
    }
    for(i = 0; i < this.connections.length; ++i){
        this.connections[i].copyConnectionCoords();
    }


    for(i = 0; i < this.predicateConstraints.length; ++i){
        this.predicateConstraints[i].copyConstraintCoordinates();
    }

};


DpfSpecification.prototype.copySpec = function(copyRef){
    var newSpec = new DpfSpecification(this.level);

    for(var i = 0; i < this.nodes.length; ++i){
        this.nodes[i].copyNode(newSpec, copyRef);
    }
    for(i = 0; i < this.connections.length; ++i){
        this.connections[i].copyConnection(newSpec, copyRef);
    }
    for(i = 0; i < this.predicates.length; ++i){
        newSpec.predicates.push(this.predicates[i]);
    }
    for(i = 0; i < this.predicateConstraints.length; ++i){
        this.predicateConstraints[i].copyConstraint(newSpec, copyRef);
    }

    newSpec.leftOffSet = this.leftOffSet;
    newSpec.rightOffSet = this.rightOffSet;
    newSpec.topOffSet = this.topOffSet;
    newSpec.bottomOffSet = this.bottomOffSet;
    return newSpec;
};


DpfSpecification.prototype.removeSpecFromPaper = function(){
    for(var i = 0; i < this.nodes.length; ++i){
        this.nodes[i].removeNodeFromPaper();
    }
    for(i = 0; i < this.connections.length; ++i){
        this.connections[i].removeConnectionFromPaper();
    }
    for(i = 0; i < this.predicateConstraints.length; ++i){
        this.predicateConstraints[i].removeConstraintFromPaper();
    }
};

DpfSpecification.prototype.redrawSpec = function(){
    console.log(this.connections);
    for(var i = 0; i < this.nodes.length; ++i){
        this.nodes[i].drawNode();
        if(this.nodes[i].typing)
            this.nodes[i].typing.drawTypingForNode();
    }
    for(i = 0; i < this.connections.length; ++i){
        if(this.connections[i].lineCoords.length > 0)
            this.connections[i].drawConnectionFromCoords(this.connections[i].lineCoords, this.connections[i].d_textCoords, []);
        else
            this.connections[i].drawConnection();

        if(this.connections[i].typing)
            this.connections[i].typing.drawTypingForConnection();
    }
    for(i = 0; i < this.predicateConstraints.length; ++i){
        this.predicateConstraints[i].drawPredicateConstFromCoords(this.predicateConstraints[i].lineCoords, this.predicateConstraints[i].conn, this.predicateConstraints[i].d_textCoords, this.predicateConstraints[i].nodes);
    }
};

var parseDpfSpecification = function(spXml, spec){
    console.log(spXml);
    var nodes = spXml.getElementsByTagName("DpfNode");
    for(var i = 0; i < nodes.length; ++i){
        var nodeXml = nodes[i];
        parseDpfNode(nodeXml, spec);
    }
    var conns = spXml.getElementsByTagName("DpfConnection");
    for(i = 0; i < conns.length; ++i){
        var connXml = conns[i];
        parseDpfConnection(connXml, spec);
    }

    var predConstXmls = spXml.getElementsByTagName("DpfPredicateConstraint");
    for(i = 0; i < predConstXmls.length; ++i){
        var predConstXml = predConstXmls[i];
        parseDpfPredicateConstraint(predConstXml, spec);
    }

    spec.leftOffSet = parseFloat(spXml.getElementsByTagName("leftOffSet")[0].childNodes[0].nodeValue );
    spec.rightOffSet = parseFloat(spXml.getElementsByTagName("rightOffSet")[0].childNodes[0].nodeValue );
    spec.topOffSet = parseFloat(spXml.getElementsByTagName("topOffSet")[0].childNodes[0].nodeValue );
    spec.bottomOffSet = parseFloat(spXml.getElementsByTagName("bottomOffSet")[0].childNodes[0].nodeValue );
};

var getSpecXml = function(spec, indentStr0){
    var xmlText = "\n" + indentStr0 + "<DpfSpecification>";
    var indentStr = indentStr0 + "   ";
    xmlText += "\n" + indentStr + "<nodes>";

    for(var i = 0; i < spec.nodes.length; ++i){
        var node = spec.nodes[i];
        xmlText += getDpfNodeXml(node, "                ");
    }

    xmlText += "\n" + indentStr + "</nodes>";
    xmlText += "\n" + indentStr + "<connections>";
    for(i = 0; i < spec.connections.length; ++i){
        var conn = spec.connections[i];
        xmlText += getDpfConnectionXml(conn, "                ");

    }
    xmlText += "\n" + indentStr + "</connections>";

    xmlText += "\n" + indentStr + "<predicateConstraints>";
    for(i = 0; i < spec.predicateConstraints.length; ++i){
        var predConst = spec.predicateConstraints[i];
        xmlText += getDpfPredicateConstraintXml(predConst, indentStr + "    ");
    }
    xmlText += "\n" + indentStr + "</predicateConstraints>";

    xmlText += "\n" + indentStr + "<leftOffSet>" + spec.leftOffSet + "</leftOffSet>";
    xmlText += "\n" + indentStr + "<rightOffSet>" + spec.rightOffSet + "</rightOffSet>";
    xmlText += "\n" + indentStr + "<topOffSet>" + spec.topOffSet + "</topOffSet>";
    xmlText += "\n" + indentStr + "<bottomOffSet>" + spec.bottomOffSet + "</bottomOffSet>";
    xmlText += "\n" + indentStr0 + "</DpfSpecification>";
    return xmlText;
};

var refreshInconsistencyInfo = function(){
    for(var m = 1; m < theMetaModelStack.metamodel.length; ++m){
        var modelspec = theMetaModelStack.metamodel[m].modelSpec;

        for(var i = 0; i < modelspec.nodes.length; ++i){
            modelspec.nodes[i].clearInconsistentNode();
        }
        for(i = 0; i < modelspec.connections.length; ++i){
            modelspec.connections[i].clearInconsistentConnection();
        }
    }
    clearErrorMessage('F_error');
};

var conformanceCheck = function(){
    //check if the jsScript editor is open....
    if(saveJSEditorCode() < 0)
        return;


    var predicates = dpfSpecifications[2].predicates;
    var semanticStr = "";
    //semanticStr += "try{ ";
    semanticStr += "\n var p = null;\n";
    semanticStr += "var errPreds = [];\n";
    semanticStr += "var nodeMap = null;\n";
    semanticStr += "var connMap = null;\n";

    for(var i =0; i < predicates.length; ++i) {
        var thePred = predicates[i];
        semanticStr += thePred.predScript + thePred.validateScript;
        semanticStr += "\n p = new " + thePred.className + "(); ";
        semanticStr += "nodeMap = null;\n";
        semanticStr += "connMap = null;\n";

        semanticStr += "\n nodeMap = {";
        for(var n = 0; n < thePred.nodes.length; ++n) {
            semanticStr += "'" + thePred.nodes[n].name + "' : [] ";
            if(n+1 < thePred.nodes.length)
                semanticStr += ", ";
        }
        semanticStr += "};";

        semanticStr += "\n connMap = {";
        for(n = 0; n < thePred.conn.length; ++n) {
            semanticStr += "'" + thePred.conn[n].name + "' : [] ";
            if(n+1 < thePred.conn.length)
                semanticStr += ", ";
        }
        semanticStr += "};";


        // push all the instances in this class..

        semanticStr += "\n for (var m = 1; m < theMetaModelStack.metamodel.length; ++m) {                               ";
        semanticStr += "\n    var metaModelspec = theMetaModelStack.metamodel[m].metaModelSpec;                         ";

        semanticStr += "\n    var existingPredConst = metaModelspec.predicateConstraints;                               ";
        semanticStr += "\n    for (var j = 0; j < existingPredConst.length; ++j) {                                      ";
        semanticStr += "\n        if (existingPredConst[j].predicate.predicateId == " + thePred.predicateId + ") {      ";
        semanticStr += "\n            for(var k = 0; k < existingPredConst[j].attachedModelNodes.length; ++k) {         ";
        semanticStr += "\n                var X = existingPredConst[j].attachedModelNodes[k].srcNode;                   ";
        semanticStr += "\n                console.log(X);                   ";
        semanticStr += "\n                    console.log(existingPredConst[j]);                                         ";
        semanticStr += "\n                var trgTypeInstances = existingPredConst[j].attachedModelNodes[k].trgNode.instances; ";
        semanticStr += "\n                for (var l = 0; l < trgTypeInstances.length; ++l) {                           ";
        semanticStr += "\n                    var x = trgTypeInstances[l].from;                                         ";
        semanticStr += "\n                    x.param = existingPredConst[j].parameters;                           ";
        semanticStr += "\n                    nodeMap[X.name].push(x);                                            ";
        //semanticStr += "\n                    console.log(nodeMap);                                            ";
        semanticStr += "\n                }                                                                             ";
        semanticStr += "\n            }                                                                                 ";

        semanticStr += "\n            for(k = 0; k < existingPredConst[j].attachedModelConns.length; ++k) {             ";
        semanticStr += "\n                var f = existingPredConst[j].attachedModelConns[k].srcConn;                   ";
        semanticStr += "\n                trgTypeInstances = existingPredConst[j].attachedModelConns[k].trgConn.instances; ";
        semanticStr += "\n                for (l = 0; l < trgTypeInstances.length; ++l) {                               ";
        semanticStr += "\n                    var fi = trgTypeInstances[l].from;                                        ";
        semanticStr += "\n                    fi.param = existingPredConst[j].parameters;                           ";
        semanticStr += "\n                    connMap[f.name].push(fi);                                            ";
        //semanticStr += "\n                    console.log(connMap);                                            ";
        semanticStr += "\n                }                                                                             ";
        semanticStr += "\n            }                                                                                 ";
        semanticStr += "\n        }                                                                                     ";
        semanticStr += "\n    }                                                                                         ";
        semanticStr += "\n}                                                                                             ";

        for(n = 0; n < thePred.nodes.length; ++n) {
            semanticStr += "\n  p." + thePred.nodes[n].name + " = nodeMap['" + thePred.nodes[n].name + "'];";
        }

        for(n = 0; n < thePred.conn.length; ++n) {
            semanticStr += "\n  p." + thePred.conn[n].name + " = connMap['" + thePred.conn[n].name + "'];";
        }

        semanticStr += "\n\t var errObj = p.validate();                                                                 ";

        semanticStr += "\n\t if(errObj && errObj.length > 0){                                                                                ";
        semanticStr += "\n\t    for(n = 0; n < errObj.length; ++n){                                                        ";
        semanticStr += "\n\t       if(errObj[n].dpfType == 'DpfNode'){                                                       ";
        semanticStr += "\n\t          errObj[n].makeInconsistentNode();                                                     ";
        semanticStr += "\n\t       }                                                                                      ";
        semanticStr += "\n\t       else{                                                                                   ";
        semanticStr += "\n\t           errObj[n].makeInconsistentConnection();                                               ";
        semanticStr += "\n\t       }                                                              ";
        semanticStr += "\n\t    }                                                                                          ";
        semanticStr += "\n\t   var rFlag = true;                                                                       ";
        semanticStr += "\n\t   for(var r = 0; r < errPreds.length; ++r){                                                ";
        semanticStr += "\n\t        if(errPreds[r] == '" + thePred.name + "'){ rFlag = false; break; }                             ";
        semanticStr += "\n\t   }                                                                                        ";
        semanticStr += "\n\t   if(rFlag)                                                                                ";
        semanticStr += "\n\t       errPreds.push('" + thePred.name + "');                                                      ";
        semanticStr += "\n\t }                                                                                          ";


    }

    semanticStr += "\n\t   console.log(errPreds);                                                                           ";
    semanticStr += "\n\t   predErrMsg = \"\";                                                                           ";
    semanticStr += "\n\t   for(r = 0; r < errPreds.length; ++r){                                                        ";
    semanticStr += "\n\t        predErrMsg += '\\n ' +  errPreds[r] + ' ';                                                 ";
    semanticStr += "\n\t   }                                                                                        ";

    semanticStr += "\n showErrorMessage('F_error', predErrMsg);                                                                   ";
    //semanticStr += "\n}catch(err){alert(err);}";
    semanticStr += "\n";
    console.log(semanticStr);
    //making new script object
    var objScript = window.document.createElement('script');
    objScript.text = semanticStr;
    objScript.type = 'text/javascript';
    objScript.id = 'myScriptId';

    try {
        var objHead = window.document.getElementsByTagName('head')[0];
        objHead.appendChild(objScript);
    }catch(err2){
        alert(err2);
    }
    objHead.removeChild(objScript);

};