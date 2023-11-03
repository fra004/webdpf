app.controller('BloodAnalysisController', function ($scope, PatientService) {
    $scope.orderSelectedTests = function () {
        //$scope.root.state = 3; // sample requested
        $scope.patient.pasInfo = "Etiketter sendt til printer";
        $scope.patient.samples = [];
        $scope.patient.sampleRequired = $('#bloodtyping').checked ? 2 : 1;
        $scope.navi.popPage();
        $scope.patient.tagPrinted = true;

        window.setTimeout(function() {                            //REQUIRED FOR SIMULATION
            if($scope.patient.bloodTestRequired == true) {
                $scope.patient.bloodAnalysisRequired = false;
                window.parent.executeSpecificTask(":Blood \nTyping");
            }
            else{
                $scope.patient.bloodAnalysisRequired = false;
                window.parent.executeSpecificTask(":Book Pre\nExamination");
            }

        }, 0);


    };
    $scope.cancelTestOrder = function () {
        $scope.navi.popPage();
        //$scope.root.state = 3;
    }
});

app.controller('BloodProductsController', function ($scope, ProduktService, DoctorService) {
    $scope._init = function () {
        $scope.patient.pasInfo = "";
        $scope.products = ProduktService;
        $scope.count = 0;
        $scope.paidBy = null;
        $scope.doctor = { fullName: "" };
        $scope.root.state = 3;
    }
    $scope._init();
    $scope.decreaseOrder = function (id) {
        $scope.products.orderableProducts.filter(function (data) { return data.id === id })[0].count--;
        $scope.count--;
        $scope.products.decreaseproductCount();
    }

    $scope.increaseOrder = function (id) {
        $scope.products.orderableProducts.filter(function (data) { return data.id === id })[0].count++;
        $scope.count++;
        $scope.products.increaseproductCount();
    }

    $scope.sendOrder = function () {
        $scope.patient.pasInfo = "Bestilling sendt";
        $scope.navi.popPage();
        $scope.patient.bloodOrdered = true;
        if ($scope.patient.testOrdered) {
            $scope.root.state = 7;
        } else
            $scope.root.state = 3;

        window.setTimeout(function() {
            window.parent.executeSpecificTask(":Order Blood");
        }, 300);

    }
    $scope.handleBarcode = function (barcode) {
        if ($scope.count > 0)
        switch ($scope.root.state) {
            case 3:
                $scope._setDoctor(DoctorService.getDoctor(barcode));
                break;
        }
    }
    $scope.shouldKeepFocus = function () {
        return $scope.root.state === 3;
    }
    $scope.getScannerDiv = function () {
        return $("#checkBloodOrder");
    }

    ons.ready(function () {
        $scope.onScan($scope);
    });
    
    $scope._setDoctor = function (doctor) {
        if (doctor) {
            $scope.doctor = doctor;
            $scope.doctor.fullName = doctor.getName();
            $scope.root.state = 4;
        }
    }
    $scope.cancelOrder = function () {
        $scope._init();
        $scope.navi.popPage();
    }
});

app.controller('VerifyBloodAnalysisController', function ($scope, PatientService) {

    $scope.sendTestOrder = function () {
        $scope.root.state = $scope.patient.bloodOrdered ? 7 : 3;
        $scope.patient.testOrdered = true;
        $scope.patient.pasInfo = "";
        $scope.navi.popPage();

        window.parent.executeSpecificTask(":Register\nTag Information");
    }

    $scope.handleBarcode = function (barcode) {
        switch ($scope.root.state) {
            case 3:
                $scope._scanSamples(barcode);
                break;
            case 4:
                $scope._scannPatient2CheckSamples(barcode);
                break;
        }
    }
    $scope.getScannerDiv = function () {
        return $("#checkSample");
    }

    $scope.shouldKeepFocus = function () {
        return $scope.root.state === 3 || $scope.root.state === 4;
    }

    ons.ready(function () {
        $scope.onScan($scope);
    });
    
    $scope._scannPatient2CheckSamples = function (barcode) {
        if ($scope.patient === PatientService.getPatientInfoByIndex(barcode)) {
            $scope.root.state = 5;//samples are checked correct

        } else {
            //TODO should add feedback when wrong patient is scanned.
        }
    }

    $scope._scanSamples = function (barcode) {
        if ($scope.patient.samples.length < $scope.patient.sampleRequired) {
            $scope.patient.samples.push(barcode);
            if ($scope.patient.samples.length === $scope.patient.sampleRequired)
                $scope.root.state = 4;//all samples are scanned
        }
    }
    $scope.cancelTestOrder = function () {
        $scope.root.state = 3;
        $scope.patient.pasInfo = "Blodprøve send out is cancelled";
        $scope.navi.popPage();
    }
});