//app.factory('SignalRService', function ($http, $rootScope, Hub) {
//    var SignalR = this;
//    var scope = $rootScope;

//    //Hub setup
//    var hub = new Hub("myHub", {
//        listeners: {
//            'patientScanned': function (value) {
//                console.log("Pasient Scannet: " + value);
//                $rootScope.$broadcast('patientScanned', value);
//                scope.barcode = value;
//                $rootScope.$apply();
//            },
//            'keycardScanned':function(value){
//                console.log("Ansattkort Scannet: " + value);
//                $rootScope.$broadcast('keycardScanned', value);
//                scope.keycard = value;
//                $rootScope.$apply();
//            },
//            'bloodBagScanned': function (value) {
//                console.log("Blodpose Scannet: " + value);
//                $rootScope.$broadcast('bloodBagScanned', value);
//                scope.bloodbag = value;
//                $rootScope.$apply();
//            },
//            //'labGlassScanned': function (value) {
//            //    console.log("Labglass Scannet: " + value);
//            //    scope.labglass = value;
//            //    $rootScope.$apply();
//            //}
//            'labGlassScanned': function (value) {
//                console.log("Labglass Scannet: " + value);
//                $rootScope.$broadcast('labGlassScanned', value);
//            }
//        },
//        //rootPath: 'http://pcadvtmica071.ihelse.net/signalr',
//        rootPath: 'http://localhost:81/signalr',
//        //rootPath: 'http://pc89665.ihelse.net:81/signalr',
//        errorHandler: function (error) {
//            ons.notification.alert({ message: error, callback: function () { hub.connect();} });
//            console.error(error);
//        },
//        stateChanged: function (state) {
//            switch (state.newState) {
//                case $.signalR.connectionState.connecting:
//                    scope.connectionState = hub.connection.state;
//                    SignalR.connected = false;
//                    $rootScope.$apply();
//                    break;
//                case $.signalR.connectionState.connected:
//                    scope.connectionState = hub.connection.state;
//                    SignalR.connected = true;
//                    $rootScope.$apply();
//                    break;
//                case $.signalR.connectionState.reconnecting:
//                    scope.connectionState = hub.connection.state;
//                    SignalR.connected = false;
//                    $rootScope.$apply();
//                    break;
//                case $.signalR.connectionState.disconnected:
//                    scope.connectionState = hub.connection.state;
//                    SignalR.connected = false;
//                    $rootScope.$apply();
//                    break;
//            }
//        },
//        transport: 'webSockets',
//        logging: true
//    });
//    scope.connectionState = hub.connection.state;
//    SignalR.connected = false;
//    SignalR.connectionState = function () {
//        return scope.connectionState;
//    };
//    SignalR.barcode = function () {
//        return scope.barcode;
//    };
//    SignalR.keycard = function () {
//        return scope.keycard
//    };
//    SignalR.bloodbag = function () {
//        return scope.bloodbag
//    };
//    SignalR.labglass = function () {
//        return scope.labglass
//    };
//    return SignalR;
//});