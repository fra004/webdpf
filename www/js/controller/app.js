var app = angular.module('app', ['onsen']);

var appScope = null;     //REQUIRED FOR SIMULATION

(function () {
    'use strict';
    app.controller('AppController', function ($scope, DoctorService, ProduktService, PatientService) {
        // parent scope

        appScope = $scope;          //REQUIRED FOR SIMULATION

        $scope._init = function () {
            $scope.root = {
                state: 0
                // 0 = not logged in, 1 = logging in, 2 = logged in
            }
            $scope.patient = null;
            $scope.nurse = {
                fullName: null
            }

        }
        $scope._init();
        //$scope.addScannerListener = function(listenerhandle){
        //    var pressed = false;
        //    var chars = [];
        //    $("#scanner").focus();
        //    $("#scanner").keypress(function (e) {
        //        chars.push(String.fromCharCode(e.keyCode));
        //        chars.push(String.fromCharCode(e.which));
        //        if (pressed == false) {
        //            setTimeout(listenerhandle(chars.join("")),500);
        //        }
        //        pressed = true;
        //    });
        //}
        $scope.handleBarcode = function (barcode) {
            switch ($scope.root.state) {
                case 0:
                    $scope._setNurse(DoctorService.getNurse(barcode));
                    break;
                case 2:
                    var p = PatientService.getPatientInfoByIndex(barcode);
                    $scope._setPatient(p);
                    $scope.scannedBarCode = p.barcode;
                    window.parent.executionTask();
                    break;
            }
        }
        $scope.shouldKeepFocus = function () {
            return $scope.root.state === 0 || $scope.root.state === 2;
        }
        $scope.getScannerDiv = function () {
            return $("#scanner");
        }
        $scope.onScan = function (s) {
            var pressed = false;
            var chars = "";
            var scanDiv = s.getScannerDiv();
            scanDiv.focus();
            scanDiv.keypress(function (e) {
                console.log(e);
                chars += String.fromCharCode(e.which);
                chars = chars.trim();
                //var barcode = String.fromCharCode(e.keyCode);
                if (pressed == false) {
                    setTimeout(function () {
                        s.handleBarcode(chars);
                        chars = "";
                        pressed = false;
                    }, 500);
                }
                pressed = true;
            });
            scanDiv.blur(function () {
                if (s.shouldKeepFocus())
                    scanDiv.focus();
            });
        }

        ons.ready(function () {
            $scope.onScan($scope);
        });

        $scope._setNurse = function (nurse) {
            if (nurse) {
                $scope.nurse = nurse;
                $scope.nurse.fullName = nurse.getName();
                $scope.root.state = 1;
            }
        }

        $scope._setPatient = function (patient) {
            if (patient) {
                $scope.patient = patient;
                $scope.root.state = 3;
                $scope.navi.pushPage('patient.html', { title: $scope.patient.Fnr });
            }
        }

        $scope._loadPatientDataUsingBarcode = function()
        {
            $scope._setPatient(PatientService.getPatientInfo($scope.scannedBarCode));
        };

        $scope.printTagForBloodAnalysis = function(){
            $scope.patient.tagPrinted = true;
        };


        //skdsakljasdjlk
        $scope.logout = function () {
            ons.notification.confirm({
                message: 'Er du sikker på at du vil logge ut?',
                buttonLabels: ['Avbryt', 'Logg ut'],
                title: 'Logg ut',
                callback: function (idx) {
                    switch (idx) {
                        case 0:
                            break;
                        case 1:
                            $scope._init();
                            $scope.navi.resetToPage('index.html', { onTransitionEnd: function () { $scope.onScan($scope); } });
                            break;
                    }
                }
            });
        }
    });

    app.filter('unique', function () {
        return function (collection, keyname) {
            var output = [],
                keys = [];

            angular.forEach(collection, function (item) {
                var key = item[keyname];
                if (keys.indexOf(key) === -1) {
                    keys.push(key);
                    output.push(item);
                }
            });

            return output;
        };
    });
})();

app.controller('LoginController', ["$scope", function ($scope, clock) {
    //$scope.signalr = SignalRService;
    $scope.pincode = [];
    $scope.pincodeString = "";

    $scope.addNumber = function (number) {
        console.log(number);
        $scope.pincode.push(number);
        $scope.setPincodeString();
        if ($scope.pincode.length >= 4) {
            $scope.checkPin();
        }
    }
    $scope.checkPin = function () {
        $scope.root.state = 2;
        $scope.clearPin();
        //if($scope.patient.id.length > 0)
        //    $scope.navi.pushPage('patient.html', { title: $scope.patient.id });
        //ons.notification.alert({ message: "Feil pinkode!", callback: function () { $scope.clearPin() } });
    }
    $scope.removeNumber = function () {
        $scope.pincode.pop();
        $scope.setPincodeString();
    }
    $scope.clearPin = function () {
        $scope.pincode = [];
        $scope.pincodeString = "";
    }
    $scope.setPincodeString = function () {
        $scope.pincodeString = "";
        for (var i = 0; i < $scope.pincode.length; i++) {
            $scope.pincodeString += $scope.pincode[i];
        }
    }
    $scope.logOutPatient = function () {
        $scope.patient = null;
        $scope.patientName = null;
        $scope.root.state = 2;
        $scope.navi.popPage('patient.html');
    }

}]);