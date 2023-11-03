/**
 * Created by rabbi on 2/14/15.
 */

function MetaModelStack(){
    this.metamodel = [];
    this.predSpec = null;
    this.compRuleSpec = null;
    this.allDpfNodes = [];
    this.allDpfConns = [];
    this.processingLayer = 0;
    this.processingIndex = 1;
    this.maxNodeIdSnapshot = 0;
    this.maxConnIdSnapshot = 0;
    this.drawingCompleted = false;
    this.selectedEdRef = null;
}

function MetaModel(name, metaModelSpec, modelSpec, metaModelStack, mLevel){
    if(mLevel) {
        this.metaLevel = mLevel;
        if(mLevel >= maxMetaLevel)
            maxMetaLevel = mLevel + 1;
    }
    else
        this.metaLevel = maxMetaLevel++;

    this.name = name;
    this.metaModelSpec = metaModelSpec;
    this.modelSpec = modelSpec;
    metaModelStack.metamodel.push(this);
}

var removeSpecification = function(){
  if(M_selected_metamodel == null)
    return;


  if(M_selected_metamodel.nodes.length == 0 && M_selected_metamodel){
      showErrorMessage('F_error', 'The metamodel is not empty!');
  }
};

var editModelName = function(){
    if(M_selected_model == null)
        return;
    var newName = document.getElementById('F_modelName').value;
    if(newName == null || newName.length == 0)
        return;
    M_selected_model.name = newName;
    populateMetaModelStacks();
};

var buildNewModel = function(){
    var name = document.getElementById('F_modelName').value;
    console.log(name);
    if(!name || name.length <= 0)
        return;

    var metaModel = null;

    if(theMetaModelStack.metamodel.length == 0){
        metaModel = new DpfSpecification(0);
        model = new DpfSpecification(1);
        theMetaModelStack.predSpec = new DpfSpecification(2); // this part is a bit ugly, I have to fix this
        theMetaModelStack.compRuleSpec = new DpfSpecification(3); // this part is a bit ugly, I have to fix this

        M_selected_metamodel = new MetaModel(name, metaModel, model, theMetaModelStack);
        M_selected_model = M_selected_metamodel;

    }
    else if(theMetaModelStack.metamodel.length == 1){
        metaModel = theMetaModelStack.metamodel[0].metaModelSpec;
        metaModel.level = 0;
        model = new DpfSpecification(1);

        M_selected_metamodel = new MetaModel(name, metaModel, model, theMetaModelStack);
        M_selected_model = M_selected_metamodel;
    }
    else {
        metaLevel = theMetaModelStack.metamodel.length - 1;
        metaModel = theMetaModelStack.metamodel[metaLevel].modelSpec;
        metaModel.level = 0;
        model = new DpfSpecification(1);

        M_selected_metamodel = new MetaModel(name, metaModel, model, theMetaModelStack);
        M_selected_model = M_selected_metamodel;
    }

    populateMetaModelStacks();

    F_showModel(name);

};

var populateMetaModelStacks = function(){
    var mHTML = "<ul>";
    for(i = 0; i < theMetaModelStack.metamodel.length; ++i) {
        var metaConf = theMetaModelStack.metamodel[i];
        mHTML = mHTML + '<li><table> <tr> <td> <a onclick="F_selectMetaModel(\'' + i + '\')">'  + metaConf.name + '</a>' + '</td></tr></table> </li>';
    }
    mHTML = mHTML + '</ul>';
    document.getElementById('metamodels').innerHTML = mHTML;
    populateModelOptions();
};

var refreshDrawingPanes = function(){
    // cleanup existing drawings...
    if(dpfSpecifications.length > 0) {
        cleanupDrawingPane(dpfSpecifications[0]);
        cleanupDrawingPane(dpfSpecifications[1]);
        refreshFields();
        refreshEdgeFields();
        prepareBuildingNewPredicate();
    }

    setupOffsetValues();
};

var setupOffsetValues = function(){
    // setup left offset for drawingPane[0] and drawingPane[1].
    if(dpfSpecifications.length > 0) {
        dpfSpecifications[0].leftOffSet = drawingPane[0].attr('x');
        dpfSpecifications[1].leftOffSet = drawingPane[1].attr('x');
        dpfSpecifications[2].rightOffSet = drawingPane[2].attr('width');
        dpfSpecifications[2].bottomOffSet = drawingPane[2].attr('height');

        dpfSpecifications[3].rightOffSet = drawingPane[3].attr('width');
        dpfSpecifications[3].topOffSet = drawingPane[3].attr('y');
    }
};

var F_selectMetaModel = function(metamodelIndex){
    M_setSelectedIndex(metamodelIndex);
    var name = theMetaModelStack.metamodel[metamodelIndex].name;
    F_showModel(name);
};

var F_showModel = function(name, skipRefresh, skipRefresh2){
    //console.log('opening model ' + name);
    if(!skipRefresh)
        refreshDrawingPanes();

    M_selected_metamodel = null;
    M_selected_model = null;

    for(var i = 0; i < theMetaModelStack.metamodel.length; ++i){
        if(theMetaModelStack.metamodel[i].name == name){
            M_selected_metamodel = theMetaModelStack.metamodel[i];
            M_selected_model = theMetaModelStack.metamodel[i];
            break;
        }
    }

    if(M_selected_metamodel == null){
        showErrorMessage('F_error', 'Cannot open model in editor');
        return;
    }
    document.getElementById('F_modelName').value = M_selected_metamodel.name;

    var metaModel = M_selected_metamodel.metaModelSpec;
    var model = M_selected_metamodel.modelSpec;
    var predicateSpecification = theMetaModelStack.predSpec;
    var ruleSpecification = theMetaModelStack.compRuleSpec;

    metaModel.level = 0;
    model.level = 1;
    predicateSpecification.level = 2;
    ruleSpecification.level = 3;

    while(dpfSpecifications.length > 0)
        dpfSpecifications.pop();

    dpfSpecifications.push(metaModel);
    dpfSpecifications.push(model);
    dpfSpecifications.push(predicateSpecification);
    dpfSpecifications.push(ruleSpecification);

    if(skipRefresh2)
        setupOffsetValues();

    // need to fix the coordinate of metamodel and model
    var corner = getCornerCoordinate(metaModel);
    //console.log('corner coords of metamodel: ' + corner + ' metamodel.leftOffset: ' + metaModel.leftOffSet);
    var dx = 0, dy = 0;
    dx = drawingPane[0].attr('x') - metaModel.leftOffSet;
    dy = drawingPane[0].attr('height') - corner[3] - 30;
    console.log('drawingPane[0]..... dx: ' + dx + ' dy: ' + dy);
    showDrawingPane(metaModel, false, dx, dy);

    dx = 0; dy = 0;
    corner = getCornerCoordinate(model);
    dx = drawingPane[1].attr('x') - model.leftOffSet;
    if(corner[2] < drawingPane[1].attr('y')){
        dy = drawingPane[1].attr('y') - corner[2] + 30;
    }
    console.log('drawingPane[1]..... dx: ' + dx + ' dy: ' + dy);
    showDrawingPane(model, true, dx, dy);



    dx = drawingPane[2].attr('width') - predicateSpecification.rightOffSet;
    dy = drawingPane[2].attr('height') - predicateSpecification.bottomOffSet;
    initializeDrawingPane(predicateSpecification, dx, dy);
    moveTypingForModelSwitching(metaModel);

    dx = drawingPane[3].attr('width') - ruleSpecification.rightOffSet;
    dy = drawingPane[3].attr('y') - ruleSpecification.topOffSet;
    //console.log('dx: ' + dx + ' dy: ' + dy);
    initializeDrawingPane(ruleSpecification, dx, dy);
    moveTypingForModelSwitching(predicateSpecification);

    // hide typing if the typing checkbox is off
    displayNodeTyping();
    displayEdgeTyping();


    if(simulateFlag) {
        var predConst = model.predicateConstraints;
        for (var p = 0; p < predConst.length; ++p) {
            var aPredConst = predConst[p];
            if (aPredConst.outputName == "<R>") {
                aPredConst.d_lines[0].hide();
                aPredConst.d_text.hide();
                aPredConst.attachedModelNodes[0].trgNode.d_node.attr({'fill': '#00DD33', 'stroke': '#234524'});
                aPredConst.attachedModelNodes[0].trgNode.d_text.attr({'fill': '#121212'});
            }
            else if(aPredConst.outputName == "<D>"){
                aPredConst.d_lines[0].hide();
                aPredConst.d_text.hide();
                aPredConst.attachedModelNodes[0].trgNode.d_node.attr({'fill': '#333333', 'stroke': '#000000'});
                aPredConst.attachedModelNodes[0].trgNode.d_text.attr({'fill': '#DDDDDD'});
            }
        }
    }

};


var F_showMetaModel = function(name, skipRefresh){
    //console.log('opening model ' + name);
    if(!skipRefresh){
        cleanupDrawingPane(dpfSpecifications[0]);
        setupOffsetValues();
    }

    M_selected_metamodel = null;
    for(var i = 0; i < theMetaModelStack.metamodel.length; ++i){
        if(theMetaModelStack.metamodel[i].name == name){
            M_selected_metamodel = theMetaModelStack.metamodel[i];
            break;
        }
    }

    if(M_selected_metamodel == null){
        showErrorMessage('F_error', 'Cannot open model in editor');
        return;
    }

    if(M_selected_metamodel == M_selected_model)
        document.getElementById('F_modelName').value = M_selected_metamodel.name;

    var metaModel = M_selected_metamodel.metaModelSpec;

    metaModel.level = 0;

    dpfSpecifications[0] = metaModel;


    // need to fix the coordinate of metamodel and model
    var corner = getCornerCoordinate(metaModel);
    //console.log('corner coords of metamodel: ' + corner + ' metamodel.leftOffset: ' + metaModel.leftOffSet);
    var dx = 0, dy = 0;
    dx = drawingPane[0].attr('x') - metaModel.leftOffSet;
    dy = drawingPane[0].attr('height') - corner[3] - 30;
    console.log('drawingPane[0]..... dx: ' + dx + ' dy: ' + dy);
    showDrawingPane(metaModel, false, dx, dy);


    moveTypingForModelSwitching(metaModel);

    // hide typing if the typing checkbox is off
    displayNodeTyping();
    displayEdgeTyping();

};


var F_showInstance = function(name, skipRefresh){
    //console.log('opening model ' + name);
    if(!skipRefresh){
        cleanupDrawingPane(dpfSpecifications[1]);
        setupOffsetValues();
    }

    M_selected_model = null;
    for(var i = 0; i < theMetaModelStack.metamodel.length; ++i){
        if(theMetaModelStack.metamodel[i].name == name){
            M_selected_model = theMetaModelStack.metamodel[i];
            break;
        }
    }

    if(M_selected_model == null){
        showErrorMessage('F_error', 'Cannot open model in editor');
        return;
    }
    document.getElementById('F_modelName').value = M_selected_model.name;


    var model = M_selected_model.modelSpec;

    model.level = 1;

    dpfSpecifications[1] = model;


    // need to fix the coordinate of metamodel and model
    var corner = getCornerCoordinate(model);
    //console.log('corner coords of metamodel: ' + corner + ' metamodel.leftOffset: ' + metaModel.leftOffSet);
    var dx = 0, dy = 0;

    corner = getCornerCoordinate(model);
    dx = drawingPane[1].attr('x') - model.leftOffSet;
    if(corner[2] < drawingPane[1].attr('y')){
        dy = drawingPane[1].attr('y') - corner[2] + 30;
    }
    console.log('drawingPane[1]..... dx: ' + dx + ' dy: ' + dy);
    showDrawingPane(model, true, dx, dy);

    //var metaModel = selected_metamodel.metaModelSpec;
    moveTypingForModelSwitching(dpfSpecifications[0]);

    // hide typing if the typing checkbox is off
    displayNodeTyping();
    displayEdgeTyping();
};




var writeModelIntoFile = function(){
    setupOffsetValues();
    var theModelXml = "<MetaModelStack>";
    var metaModels = theMetaModelStack.metamodel;

    if(theMetaModelStack.predSpec) {
        theModelXml += "\n       <predSpec>";
        theModelXml += getDpfPredicateXml(theMetaModelStack.predSpec, "            ");
        theModelXml += "\n       </predSpec>";
    }

    if(metaModels.length > 0) {
        theModelXml += "\n   <MetaModel>";
        theModelXml += "\n       <metaLevel>" + metaModels[0].metaLevel + "</metaLevel>";
        theModelXml += "\n       <name>" + metaModels[0].name + "</name>";
        theModelXml += "\n       <metaModelSpec>";
        theModelXml += getSpecXml(metaModels[0].metaModelSpec, "            ");
        theModelXml += "\n       </metaModelSpec>";
        theModelXml += "\n   </MetaModel>";
    }


    for(var m = 1; m < metaModels.length; ++m){
        var metaModel = metaModels[m];
        theModelXml += "\n   <MetaModel>";
        theModelXml += "\n       <metaLevel>" + metaModel.metaLevel + "</metaLevel>";
        theModelXml += "\n       <name>" + metaModel.name + "</name>";
        theModelXml += "\n       <modelSpec>";
        theModelXml += getSpecXml(metaModel.modelSpec, "            ");
        theModelXml += "\n       </modelSpec>";
        theModelXml += "\n   </MetaModel>";
    }



    theModelXml += "\n</MetaModelStack>";

    saveTextAsFile(theModelXml);
};


var readModelFromXml = function(xmlTxt){

    // reset some variables...
    allRules = [];
    allNodes = [];
    allConns = [];

    if (window.DOMParser)
    {
        parser=new DOMParser();
        xmlDoc=parser.parseFromString(xmlTxt,"text/xml");
    }
    else // Internet Explorer
    {
        xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async=false;
        xmlDoc.loadXML(xmlTxt);
    }

    var metaModel = null, model = null;
    var mModels =xmlDoc.getElementsByTagName("MetaModel");

    if(mModels.length > 0) {
        console.log(mModels[0]);
        var metaLevel = mModels[0].getElementsByTagName("metaLevel")[0].childNodes[0].nodeValue;
        var name = mModels[0].getElementsByTagName("name")[0].childNodes[0].nodeValue;
        console.log(metaLevel);
        console.log(name);

        var spXml = mModels[0].getElementsByTagName("DpfSpecification")[0];

        if (metaLevel == 0) {
            metaModel = new DpfSpecification(0);
            model = new DpfSpecification(1);
            M_selected_metamodel = new MetaModel(name, metaModel, model, theMetaModelStack, metaLevel);
            M_selected_model = M_selected_metamodel;
            parseDpfSpecification(spXml, metaModel);
            cleanupDrawingPane(metaModel);
        }
    }



    var x2, y2, width2;
    x2 = M_selected_metamodel.metaModelSpec.leftOffSet;
    drawingPane[0].attr({x: x2});

    theMetaModelStack.predSpec = new DpfSpecification(2);
    theMetaModelStack.compRuleSpec = new DpfSpecification(3);

    var pModel =xmlDoc.getElementsByTagName("DpfPredicateList");
    console.log(pModel);
    if(pModel[0]) {
        parseDpfPredicate(pModel[0], theMetaModelStack.predSpec, theMetaModelStack.compRuleSpec);

        var i, j;
        for(i = 0; i < allProductionRules.length; ++i){
            for(j = 0; j < allProductionRules[i].annotations.length; ++j){
                allProductionRules[i].annotations[j].setupAttachedModelElements();
            }
        }

        width2 = theMetaModelStack.predSpec.rightOffSet;

        y2 = theMetaModelStack.predSpec.bottomOffSet;

        console.log('x2: ' + x2 + ' y2: ' + y2 + ' width2: ' + width2);
        drawingPane[0].attr({height: y2});

        drawingPane[1].attr({x: x2});
        drawingPane[1].attr({y: y2 + 10});
        drawingPane[1].attr({height: drawingPaneHeight-y2+10 });

        //drawingPane[2].attr({width: width2});
        drawingPane[2].attr({width: (x2+10)});
        drawingPane[2].attr({height: y2});

        drawingPane[3].attr({y: y2 + 10});
        //drawingPane[3].attr({width: width2});
        drawingPane[3].attr({width: (x2+10)});
        drawingPane[3].attr({height: drawingPaneHeight-y2+10 });

        //theMetaModelStack.compRuleSpec.rightOffSet = drawingPane[3].attr('width');
        theMetaModelStack.compRuleSpec.rightOffSet = theMetaModelStack.predSpec.rightOffSet;
        theMetaModelStack.compRuleSpec.topOffSet = drawingPane[3].attr('y');

        for(j = 0; j < drawingPane.length; ++j) {
            drawingPane[j].ox = drawingPane[j].attr('x');
            drawingPane[j].oy = drawingPane[j].attr('y');
            drawingPane[j].ow = drawingPane[j].attr('width');
            drawingPane[j].oh = drawingPane[j].attr('height');
        }
        seperator_horizontal.attr({x: x2});
        seperator_vertical.attr({y: y2 + 1});

        populatePredicateNames(theMetaModelStack.predSpec.predicates);
    }

    cleanupDrawingPane(theMetaModelStack.predSpec);
    cleanupDrawingPane(theMetaModelStack.compRuleSpec);

    var aMetaModel = null;
    for(i = 1; i < mModels.length; ++i) {
        console.log(mModels[i]);
        metaLevel = mModels[i].getElementsByTagName("metaLevel")[0].childNodes[0].nodeValue;
        name = mModels[i].getElementsByTagName("name")[0].childNodes[0].nodeValue;
        console.log(metaLevel);
        console.log(name);

        spXml = mModels[i].getElementsByTagName("DpfSpecification")[0];

        if(metaLevel == 1){
            aMetaModel = theMetaModelStack.metamodel[0].metaModelSpec;
            aMetaModel.level = 0;
            model = new DpfSpecification(1);
            M_selected_metamodel = new MetaModel(name, aMetaModel, model, theMetaModelStack, metaLevel);
            M_selected_model = M_selected_metamodel;
            M_selected_metamodel.metaLevel = metaLevel;
            parseDpfSpecification(spXml, model);
        }
        else {
            aMetaModel = theMetaModelStack.metamodel[theMetaModelStack.metamodel.length - 1].modelSpec;
            aMetaModel.level = 0;
            model = new DpfSpecification(1);
            M_selected_metamodel = new MetaModel(name, aMetaModel, model, theMetaModelStack, metaLevel);
            M_selected_model = M_selected_metamodel;
            M_selected_metamodel.metaLevel = metaLevel;
            parseDpfSpecification(spXml, model);
        }
        cleanupDrawingPane(model);
    }

    populateMetaModelStacks();

    if(theMetaModelStack.metamodel[0])
        F_showModel( theMetaModelStack.metamodel[0].name , true);

    preparePredConstraints();
    makeCompletionRuleLayerTable();
    makeProductionRuleLayerTable();
    paper.safari();

};


function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    if(!files || files.length == 0)
        return;

    var file = files[0];
    var reader = new FileReader();


    reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            var fileContent = evt.target.result;
            readModelFromXml(fileContent);
        }
    };

    reader.readAsText(file);

}

