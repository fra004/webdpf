app.factory('TransReaktService', function ($http, $rootScope, $timeout) {
    transReaktData = [];


    transReaksjoner = [{
        id: 0,
        value: 'Ingen reaksjon'
    },
        {
            id: 1,
            value: 'Feber'
        },
                {
                    id: 2,
                    value: 'Frysninger'
                },
                        {
                            id: 3,
                            value: 'Utslett'
                        },
                                {
                                    id: 4,
                                    value: 'Ryggsmerter/brystsmerter'
                                },
                                        {
                                            id: 5,
                                            value: 'Pustebesvær'
                                        },
                                                {
                                                    id: 6,
                                                    value: 'Uro/angst'
                                                },
                                                        {
                                                            id: 7,
                                                            value: 'Varmefølelse langs blodårene'
                                                        },
                                                                {
                                                                    id: 8,
                                                                    value: 'Mørk urin (hemoglobinuri)'
                                                                },
                                                                        {
                                                                            id: 9,
                                                                            value: 'Fallende blodtrykk/økende puls og evt. utvikling av anafylaktisk sjokk og nyresvikt.'
                                                                        }

    ];


    _getTransReaksjoner = function () {

        return transReaksjoner;
    };

    _getTransReaktByPatient = function (patientId) {

        return transReaktData.filter(
            function (data) { return data.pas == patientId }
        );
    };

    _setTransReakt = function (pas, produkt1,produkt2, dato, reaksjon) {
        transReaktData.push({
            pas: pas,
            produkt1: produkt1,
            produkt2: produkt2,
            dato: dato,
            reaksjon: reaksjon
        });
    }

    return {
        getTransReaksjoner: _getTransReaksjoner,
        getTransReaktByPatient: _getTransReaktByPatient,
        setTransReakt: _setTransReakt

    }
});