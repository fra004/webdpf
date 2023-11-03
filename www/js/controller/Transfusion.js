var transScope = null;      //REQUIRED FOR SIMULATION

app.controller('TransfusionController', function ($scope, ProduktService, PatientService, sharedProperties) {

    transScope = $scope;        //REQUIRED FOR SIMULATION

    // $scope.signalr = SignalRService;


    $scope.bloodbag = {
        part1: '',
        part2: ''
    };

    // console.log($scope.bloodbag.part1 + ' og ' + $scope.bloodbag.part2);

    if ($scope.patient !== undefined && $scope.patient.Fnr !== undefined)
        $scope.patient.waitingProducts = ProduktService.getProductByPatient($scope.patient.Fnr);

    $scope.today = new Date();



    $scope.handleBarcode = function (barcode) {
        //var product = ProduktService.getProductByBarcode(barcode);
        $scope.productCount = ProduktService.getProductCount();              //REQUIRED FOR SIMULATION
        switch ($scope.root.state) {
            case 7:
                var prod = ProduktService.getProductByIndex(barcode);
                $scope.bloodbag.part1 = prod.id1;
                $scope.root.state = 8;
                break;
            case 8:
                prod = ProduktService.getProductByIndex(barcode);
                $scope.bloodbag.part2 = prod.id2;
                console.log($scope.bloodbag.part2);
                //if ($scope.bloodbag.part2) {
                $scope.product = ProduktService.getProductById($scope.bloodbag.part1, $scope.bloodbag.part2);
                if ($scope.product && $scope.product.reservertPasient !== $scope.patient.Fnr) {
                    $scope.root.state = 7;
                    window.parent.executionTaskWithChoice(1);                                           //REQUIRED FOR SIMULATION
                } else {
                    $scope.root.state = 9;
                    if ($scope.product && $scope.product.reservertPasient === $scope.patient.Fnr) {    //REQUIRED FOR SIMULATION
                        ProduktService.decreaseproductCount();
                        window.parent.executionTaskWithChoice(0);                                           //REQUIRED FOR SIMULATION
                    }

                }
                //}
                break;
        }

    }
    $scope.shouldKeepFocus = function () {
        return appScope.root.state === 7 || appScope.root.state === 8;
    }
    $scope.getScannerDiv = function () {
        return $("#checkbloodproduct");
    }

    ons.ready(function () {
        appScope.onScan($scope);
        /*
        var pressed = false;
        var chars = "";
        var scanDiv = $("#checkbloodproduct");
        scanDiv.focus();
        scanDiv.keypress(function (e) {
            console.log(e);
            chars += String.fromCharCode(e.which);
            chars = chars.trim();
            //var barcode = String.fromCharCode(e.keyCode);
            if (pressed == false) {
                setTimeout(function () {
                    $scope.handleBarcode(chars);
                    chars = "";
                    pressed = false;
                }, 500);
            }
            pressed = true;
        });
        scanDiv.blur(function () {
            if (s.shouldKeepFocus())
                scanDiv.focus();
        }); */
    });

    $scope.exitTrans = function () {

        sharedProperties.setBloodbag('');

        if ($scope.patient !== undefined && $scope.patient.Fnr !== undefined)
            $scope.navi.pushPage('patient.html', { title: $scope.patient.id });
        else
            $scope.navi.pushPage('index.html');
    }

    $scope.refreshPage = function () {

        sharedProperties.setBloodbag('');

        transScope.bloodbag.part1 = '';
        transScope.bloodbag.part2 = '';
        transScope.product = null;
        sharedProperties.setBloodbag('');
        $scope.root.state = 7;
    }

});



app.controller('TransDokController', function ($scope, ProduktService, TransReaktService, sharedProperties, TransDokService) {

    $scope.patient.waitingProducts = ProduktService.getProductByPatient($scope.patient.Fnr);
    $scope.transDok = TransDokService.getTransDokByPatient($scope.patient.Fnr);
    $scope.patTransReakt = TransReaktService.getTransReaktByPatient($scope.patient.Fnr);
    $scope.transReakt = TransReaktService.getTransReaksjoner();
    $scope.editValue = 0;


    $scope.emptyValue = {
        pas: $scope.patient.Fnr,
        dato: new Date(),
        temperatur: 37.5,
        systoliskBt: 120,
        diastoliskBt: 80,
        puls: 120,
        produkt1: '',
        produkt2: '',
        pre_post: ''
    };
    $scope.emptyReaktValue = {
        pas: $scope.patient.Fnr,
        dato: new Date(),
        produkt1: '',
        produkt2: '',
        reaksjon: ''
    };

    $scope.newValue = angular.copy($scope.emptyValue);
    $scope.newReaktValue = angular.copy($scope.emptyReaktValue);


    $scope.valgtTrans = "";

    $scope.TransDokValgt = function () {
        $scope.newValue.produkt1 = $scope.valgtTrans.split(',')[0];
        $scope.newValue.produkt2 = $scope.valgtTrans.split(',')[1];
    };

    $scope.valgtReaktProd = "";
    $scope.TransReaktProdValgt = function () {
        $scope.newReaktValue.produkt1 = $scope.valgtReaktProd.split(',')[0];
        $scope.newReaktValue.produkt2 = $scope.valgtReaktProd.split(',')[1];
    }
    $scope.valgtReakt = "";
    $scope.TransReaktValgt = function () {
        $scope.newReaktValue.reaksjon = $scope.valgtReakt;
    }

    $scope.clearReakt = function () {
        $scope.valgtReaktProd = "";
        $scope.valgtReakt = "";
    }

    $scope.pushNewReaktValues = function () {
        console.log("legger til reaksjon");
        TransReaktService.setTransReakt($scope.newReaktValue.pas,
            $scope.newReaktValue.produkt1,
            $scope.newReaktValue.produkt2,
            $scope.newReaktValue.dato,
            $scope.newReaktValue.reaksjon);

        if ($scope.newReaktValue.produkt1 !== '' || $scope.newReaktValue.produkt1 !== '')
            ProduktService.setTransPostDok($scope.newReaktValue.produkt1, $scope.newReaktValue.produkt2, true);


        $scope.patTransReakt = TransReaktService.getTransReaktByPatient($scope.patient.Fnr);

        $scope.newReaktValue = angular.copy($scope.emptyReaktValue);

        window.parent.executionTaskWithChoice(1);                                           //REQUIRED FOR SIMULATION

    }

    $scope.activateMeasureTask = function() {
        window.parent.executionTaskWithChoice(0);                                           //REQUIRED FOR SIMULATION
    }

    $scope.deactivateMeasureTask = function(){
        window.parent.executeSpecificTask(":Measure BP\nAnd Temp");                                           //REQUIRED FOR SIMULATION
    }

    $scope.pushNewValues = function () {
        console.log("legger til tilstand");
        TransDokService.setTransDok($scope.newValue.pas,
            $scope.newValue.dato,
            $scope.newValue.temperatur,
            $scope.newValue.systoliskBt,
            $scope.newValue.diastoliskBt,
            $scope.newValue.puls,
            $scope.newValue.produkt1,
            $scope.newValue.produkt2,
            $scope.newValue.pre_post);

        if ($scope.newValue.produkt1.length > 0 && $scope.newValue.produkt2.length > 0)
            ProduktService.setTransPreDok($scope.newValue.produkt1, $scope.newValue.produkt2, true);


        $scope.transDok = TransDokService.getTransDokByPatient($scope.patient.Fnr);
        $scope.newValue = angular.copy($scope.emptyValue);
    };

    $scope.moreBag = function(){
        return ProduktService.getProductCount() > 0;
    }

    $scope.startTrans = function () {
        ProduktService.setTransStart($scope.bloodBag.part1, $scope.bloodBag.part2, new Date());
        sharedProperties.setBloodbag('');
        navi.popPage('TransDok.html');
    }

    $scope.goToNextRound = function() {
        transScope.bloodbag.part1 = '';
        transScope.bloodbag.part2 = '';
        transScope.product = null;
        sharedProperties.setBloodbag('');
        $scope.root.state = 7;
        navi.popPage('TransDok.html');
        window.parent.executionTaskWithChoice(3);                                           //REQUIRED FOR SIMULATION
        //navi.pushPage('Transfusion.html');

    }

    $scope.performAvslutt = function(){             //REQUIRED FOR SIMULATION
        window.parent.executionTaskWithChoice(2);
    }


});
