app.factory('PatientService', function ($http, $rootScope, $timeout) {
    pasientData = [
        {
            Fornavn: 'Roland',
            Etternavn: 'Gundersen',
            Fnr: '15076500565',
            kjonn: 'Mann',
            barcode: 'LOC10021',
            alder: '50',
            bloodAnalysisRequired: true,   //REQUIRED FOR SIMULATION
            bloodTestRequired: false,        //REQUIRED FOR SIMULATION
            bloodInfo: {
                type: 'A Rhd pos',
                typeTime: '10. Des. 2011', //Denne er altså ikke gyldig, og må gjøres på nytt
                pre: 'Ikke mottatt',
                comment: '',
                validPre: false,
                validType: true,
                sampleSent: true
            }
        },
        {
            Fornavn: 'Roland',
            Etternavn: 'Gundersen',
            Fnr: '15076500565',
            kjonn: 'Mann',
            barcode: 'LOC10022',
            alder: '50',
            bloodAnalysisRequired: true,   //REQUIRED FOR SIMULATION
            bloodTestRequired: false,        //REQUIRED FOR SIMULATION
            bloodInfo: {
                type: 'A Rhd pos',
                typeTime: '10. Des. 2011', //Denne er altså ikke gyldig, og må gjøres på nytt
                pre: 'Ikke mottatt',
                comment: '',
                validPre: false,
                validType: true,
                sampleSent: true
            }
        },
        {
            Fornavn: 'Finn',
            Etternavn: 'Dottno',
            Fnr: '21016400952',
            kjonn: 'Mann',
            barcode: 'LOC10006',
            alder: '51',
            bloodAnalysisRequired: true,   //REQUIRED FOR SIMULATION
            bloodTestRequired: true        //REQUIRED FOR SIMULATION
        },
        {
            Fornavn: 'Finn',
            Etternavn: 'Dottno',
            Fnr: '21016400952',
            kjonn: 'Mann',
            barcode: '2',
            alder: '51',
            bloodAnalysisRequired: true,   //REQUIRED FOR SIMULATION
            bloodTestRequired: true        //REQUIRED FOR SIMULATION
        },
        {
            Fornavn: 'Gry',
            Etternavn: 'Telokk',
            Fnr: '12057900499',
            kjonn: 'Kvinne',
            barcode: 'LOC10007',
            alder: '39',
            bloodAnalysisRequired: true,   //REQUIRED FOR SIMULATION
            bloodTestRequired: true        //REQUIRED FOR SIMULATION
        },
        {
            Fornavn: 'Gry',
            Etternavn: 'Telokk',
            Fnr: '12057900499',
            kjonn: 'Kvinne',
            barcode: '4',
            alder: '39',
            bloodAnalysisRequired: true,   //REQUIRED FOR SIMULATION
            bloodTestRequired: true        //REQUIRED FOR SIMULATION
        },
        {
            Fornavn: 'Line',
            Etternavn: 'Danser',
            Fnr: '13116900216',
            kjonn: 'Kvinne',
            barcode: 'LOC10008',
            alder: '45',
            bloodAnalysisRequired: true,   //REQUIRED FOR SIMULATION
            bloodTestRequired: false,        //REQUIRED FOR SIMULATION
            bloodInfo: {
                type: 'A Rhd neg',
                typeTime: '10. Sept. 2015',
                pre: 'Ikke mottatt',
                comment: '',
                validPre: false,
                validType: true,
                sampleSent: true
            }
        },
        {
            Fornavn: 'Line',
            Etternavn: 'Danser',
            Fnr: '13116900216',
            kjonn: 'Kvinne',
            barcode: '3',
            alder: '45',
            bloodAnalysisRequired: true,   //REQUIRED FOR SIMULATION
            bloodTestRequired: false,        //REQUIRED FOR SIMULATION
            bloodInfo: {
                type: 'A Rhd neg',
                typeTime: '10. Sept. 2015',
                pre: 'Ikke mottatt',
                comment: '',
                validPre: false,
                validType: true,
                sampleSent: true
            }
        },
        {
            Fornavn: 'Folke',
            Etternavn: 'Danser',
            Fnr: '14019800513',
            kjonn: 'Mann',
            alder: '17',
            bloodAnalysisRequired: true,   //REQUIRED FOR SIMULATION
            bloodTestRequired: true        //REQUIRED FOR SIMULATION
        },
        {
            Fornavn: 'Andine',
            Etternavn: 'And',
            Fnr: '70019950032',
            kjonn: 'Kvinne',
            alder: '16',
            bloodAnalysisRequired: true,   //REQUIRED FOR SIMULATION
            bloodTestRequired: true        //REQUIRED FOR SIMULATION
        },
        {
            Fornavn: 'Ærlend',
            Etternavn: 'Sørgård',
            Fnr: '05073500186',
            kjonn: 'Mann',
            alder: '80',
            bloodAnalysisRequired: true,   //REQUIRED FOR SIMULATION
            bloodTestRequired: true        //REQUIRED FOR SIMULATION
        }

    ];


    _getPatient = function (patientId) {

        return pasientData.filter(
            function (data) { return data.Fnr == patientId }
        )[0];

        //return { name: 'Test Testesen' };
    };
    ///*
    //* Get patient information based on barcode.
    //* Now: Barcode is the index
    //* Future: Get patient information  from server
    //* TODO
    //*/

    _getPatientInfoByIndex = function (index) {
        /*var result = null;
        for (result in pasientData)
            if (pasientData[result].barcode === barcode)
                return pasientData[result];
        return null;*/
        return index < pasientData.length ? pasientData[index] : null;
    };

    _getPatientInfo = function (barcode) {
        var result = null;
         for (result in pasientData)
         if (pasientData[result].barcode === barcode)
         return pasientData[result];
         return null;
        //return barcode < pasientData.length ? pasientData[barcode] : null;
    };

    _setBloodAnalysisOrdered = function (patient) {
        patient.bloodInfo.validPre = true;
        patient.bloodInfo.validType = true;
    };

    _increasesampleSent = function (patient) {
        patient.bloodInfo.sampleSent++;
    };

    _decreasesampleSent = function (patient) {
        if (patient.bloodInfo.sampleSent > 0) {
            patient.bloodInfo.sampleSent--;
        }
    };

    return {
        getPatient: _getPatient,
        getPatientInfo: _getPatientInfo,
        getPatientInfoByIndex: _getPatientInfoByIndex,
        setBloodAnalysisOrdered: _setBloodAnalysisOrdered,
        increasesampleSent: _increasesampleSent,
        decreasesampleSent: _decreasesampleSent
    }
});