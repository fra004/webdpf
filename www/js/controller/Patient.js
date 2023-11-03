app.controller('PatientController', function ($scope, PatientService, ProduktService) {

    $scope.showNotifications = function (e) {
        $scope.popover.show(e);
    };
    $scope.patient.pasInfo = ""; //"Klar til \u00e5 scanne";
    if (!$scope.patient.bloodInfo) {
        $scope.patient.bloodInfo = {
            sampleSent: true,
            comment: ""
        };
        $scope.patient.bloodTestRequired = true;             //REQUIRED FOR SIMULATION
        $scope.patient.bloodAnalysisRequired = true;             //REQUIRED FOR SIMULATION
    }
    else {
        $scope.patient.bloodTestRequired = false;            //REQUIRED FOR SIMULATION
        if($scope.patient.bloodInfo.validPre === false)
            $scope.patient.bloodAnalysisRequired = true;            //REQUIRED FOR SIMULATION
        else
            $scope.patient.bloodAnalysisRequired = false;            //REQUIRED FOR SIMULATION
    }


    $scope.patient.testOrdered = false;
    $scope.patient.bloodOrdered = false;
    $scope.patient.tagPrinted = false;


    $scope.patient.waitingProducts = ProduktService.getProductByPatient($scope.patient.Fnr);

    $scope.notifications = $scope.patient.waitingProducts.length;
    ons.ready(function () {
        ons.createPopover('popover.html', $scope).then(function (popover) {
            $scope.popover = popover;
        });
    });
    $scope.orderTest = function () {
        $scope.navi.pushPage('bloodanalysis.html');
        //$scope.root.state = 4;
    }
    $scope.orderSamples = function () {
        $scope.navi.pushPage('verifybloodanalysis.html');
        //$scope.root.state = 6;
    }
    $scope.orderBlood = function () {
        navi.pushPage('bloodproducts.html');
        //$scope.root.state = 9;// order blood selected
    }
    $scope.selectTransfusion = function () {
        navi.pushPage('Transfusion.html');
        //$scope.root.state = 13;//transfusion selected
    }
});

app.controller('PatientControllerPopup', function ($scope, ProduktService) {
    $scope.patient.waitingProducts = ProduktService.getProductByPatient($scope.patient.Fnr);
    $scope.missingDoc = ProduktService.getMissingDocumentationByPatient($scope.patient.Fnr);
    $scope.notifications = $scope.patient.waitingProducts.filter(
        function (data) { return data.transDato === '' }
    ).length + $scope.missingDoc.length;
});