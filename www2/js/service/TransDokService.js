app.factory('TransDokService', function ($http, $rootScope, $timeout) {
    transDokData = [
        {
            pas: '15076500565',
            dato: '2015-09-22T10:57:28.556094Z',
            temperatur: 37.1,
            systoliskBt: 120,
            diastoliskBt: 80,
            puls: 95,
            produkt1: 'Blodpose1',
            produkt2: '',
            pre_post: 'pre'
        }, {
            pas: '15076500565',
            dato: '2015-09-22T11:57:28.556094Z',
            temperatur: 37.0,
            systoliskBt: 118,
            diastoliskBt: 77,
            puls: 90,
            produkt1: 'Blodpose2',
            produkt2: '',
            pre_post: 'pre'
        }, {
            pas: '15076500565',
            dato: '2015-09-22T12:57:28.556094Z',
            temperatur: 37.0,
            systoliskBt: 118,
            diastoliskBt: 77,
            puls: 90,
            produkt1: '',
            produkt2: '',
            pre_post: 'post'
        }
    ];

    _getTransDokByPatient = function (patientId) {

        return transDokData.filter(
            function (data) { return data.pas == patientId }
        );
    };

    _setTransDok = function (pas, dato, temperatur, systolisk, distolisk, puls, produkt, prepost) {
        transDokData.push({
            pas: pas,
            dato: dato,
            temperatur: temperatur,
            systoliskBt: systolisk,
            diastoliskBt: distolisk,
            puls: puls,
            produkt: produkt,
            pre_post: prepost
        });
    }

    return {
        getTransDokByPatient: _getTransDokByPatient,
        setTransDok: _setTransDok
    }
});