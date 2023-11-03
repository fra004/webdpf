/**
 * Created by rabbi on 11/13/15.
 */
var executingTaskName = "";

var getExecutingTaskName = function(){
    return executingTaskName;
};

var hidesimulationForm = function(){
    //document.getElementById('simulator-frame').style.left = '-3000px';
    transformDPO_NC_step(1);
};

var simulateTaskExecution = function(){
    if(!simulateFlag){
        document.getElementById('simulator-frame').style.left = '-3000px';
        return;
    }
    // Find the task instance with running annotation
    var maxIndex = theMetaModelStack.metamodel.length -1;
    if(maxIndex < 0)
        return;

    var modelInstance = theMetaModelStack.metamodel[maxIndex].modelSpec;
    var predConst = modelInstance.predicateConstraints;
    var runningTask = null;
    var bloodAppScope = document.getElementById("simulator-frame").contentWindow.appScope;
    var transScope = document.getElementById("simulator-frame").contentWindow.transScope;

    for(var i = 0; i < predConst.length; ++i){
        if(predConst[i].outputName == "<R>"){
            runningTask = predConst[i].attachedModelNodes[0].trgNode;

            executingTaskName = runningTask.name;
            console.log(executingTaskName);

            if(executingTaskName == ":Get Patient \nInfo"){
                console.log("Get patient info from DIPS");
                // angular.injector(['ng', 'app']).get("AppController")
                executionTask();
                return;
            }
            else if(executingTaskName == ":Show Patient \nInfo"){
                window.setTimeout(function() {
                    bloodAppScope._loadPatientDataUsingBarcode();
                    console.log(bloodAppScope.patient);
                }, 0);

                window.setTimeout(function() {
                    executionTask();
                }, 450);

                return;
            }
            else if(executingTaskName == ":Check Patients\nBlood Info"){
                executionTask();
                return;
            }
            else if(executingTaskName == ":Order Test"){
                        executionTask(executingTaskName);
                        console.log(bloodAppScope.patient);
                        if( bloodAppScope.patient.bloodInfo != null &&
                            bloodAppScope.patient.bloodInfo.validType != null &&
                            bloodAppScope.patient.bloodInfo.validPre  != null &&
                            bloodAppScope.patient.bloodInfo.validType == true &&
                            bloodAppScope.patient.bloodInfo.validPre == false){
                            F_showTarget(0);
                        }
                        else if( bloodAppScope.patient.bloodInfo == null ||
                                 bloodAppScope.patient.bloodInfo.validType == null ||
                                 bloodAppScope.patient.bloodInfo.validType == false ){
                            F_showTarget(1);
                        }
                        else {
                            F_showTarget(2);
                            executionTask();
                        }
                        return;
            }

            else if(executingTaskName == ":Print Tag"){
                bloodAppScope.printTagForBloodAnalysis();
                executionTask();
                return;
            }
            else if(executingTaskName == ":Send Sample"){
                window.setTimeout(function() {
                    bloodAppScope.patient.pasInfo = "Blodprøve verifisert, rekvisisjon sendt";
                }, 0);

                window.setTimeout(function() {
                    executionTask();
                }, 200);
                return;
            }
            else if(executingTaskName == ":Test completed"){
                testCompletedFlag = true;
                if(orderBloodFlag == false)
                    return;

                executionTask();
                return;
            }
            else if(executingTaskName == ":Provide Blood"){
                executionTask();
                return;
            }
            else if(executingTaskName == ":Collect Blood"){
                window.setTimeout(function() {
                    bloodAppScope.patient.pasInfo = "";
                    bloodAppScope.root.state = 7;
                }, 0);

                window.setTimeout(function() {
                    executionTask();
                }, 20);
                return;
            }
            else if(executingTaskName == ":Stop Transfusion\nContact AIT"){

                window.setTimeout(function() {
                      executionTask();
                }, 400);

                transScope.refreshPage();
                return;
            }
            else if(executingTaskName == ":Perform \nTransfusion"){
                executionTask();
                return;
            }
            else if(executingTaskName == ":Send \nTransformationarket"){
                document.getElementById('simulator-frame').style.left =  '-3000px';
                return;
            }
        }
    }
    if(runningTask == null)
        return;




    document.getElementById('simulator-frame').style.left = simulationFrameLeft;
    //window.frames[1].window.document.getElementById("screenName").innerHTML = executingTaskName;
    //window.frames[1].window.document.getElementById("Sim_wristband").value = executingTaskName;
};

var testCompletedFlag = false;
var orderBloodFlag = false;

var executionTask = function(){
    //window.alert('calling transformDPO');
    //document.getElementById('simulator-frame').style.left = '-3000px';
    transformDPO_NC_step(1);

    //window.alert('calling showTarget');
    if(ed_step.length == 1) {
        F_showTarget(0);
        window.setTimeout(function() {
            simulateTaskExecution();
        }, 0);
    }
};



var executeSpecificTask = function(taskName){
    // make sure task with taskName is in the running state

    if(taskName == ":Order Blood") {
        orderBloodFlag = true;
        if (testCompletedFlag == false)
            return;
    }


    var maxIndex = theMetaModelStack.metamodel.length -1;
    if(maxIndex < 0)
        return;

    var modelInstance = theMetaModelStack.metamodel[maxIndex].modelSpec;
    var predConst = modelInstance.predicateConstraints;
    var runningTask = null;
    var taskRunningFlag = false;
    //var bloodAppScope = document.getElementById("simulator-frame").contentWindow.appScope;

    for(var i = 0; i < predConst.length; ++i){
        if(predConst[i].outputName == "<R>") {
            runningTask = predConst[i].attachedModelNodes[0].trgNode;
            if(runningTask.name == taskName){
                taskRunningFlag = true;
                break;
            }
        }
    }

    if(taskRunningFlag) {
        transformDPO_NC_step(1);

        //window.alert('calling showTarget');
        if (ed_step.length == 1) {
            F_showTarget(0);
            window.setTimeout(function () {
                simulateTaskExecution();
            }, 0);
        }
    }
};



var executionTaskWithChoice = function(choiceIndex){


    window.setTimeout(function() {
        transformDPO_NC_step(1);
        F_showTarget(choiceIndex);
        window.setTimeout(function() {
            simulateTaskExecution();
        }, 400);

    }, 400);

};