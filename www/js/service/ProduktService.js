app.factory('ProduktService', function ($http, $rootScope, $timeout) {
    produktData = [
        {
            id1: 'J003042123714',
            //id2: 'E3846000',
            //id1: 'LOC10017',
            id2: 'LOC10021',
            type: 'Erytrocytter',
            hla: true,
            bestralt: false,
            reservertPasient: '15076500565',
            reservertDato: '2015-09-30',
            transDato: '',
            preDok: false,
            postDok: false
        },
        {
            id1: 'J003042123715',
            //id2: 'E3846000',
            //id1: 'LOC10017',
            id2: 'LOC10021',
            type: 'Erytrocytter',
            hla: true,
            bestralt: false,
            reservertPasient: '15076500565',
            reservertDato: '2015-09-30',
            transDato: '',
            preDok: false,
            postDok: false
        },
        {
            id1: 'J003042123714',
            //id2: 'E3846000',
            //id1: 'LOC10018',
            id2: 'LOC10022',
            type: 'Erytrocytter',
            hla: true,
            bestralt: false,
            reservertPasient: '13116900216',
            reservertDato: '2015-09-30',
            transDato: '',
            preDok: false,
            postDok: false
        },
        {
            //id1: 'J003011345714',
            //id2: 'E3846000',
            id1: 'LOC10019',
            id2: 'LOC10023',
            type: 'Erytrocytter',
            hla: true,
            bestralt: false,
            reservertPasient: '15076500565',
            reservertDato: '2015-09-22',
            transDato: '2015-09-24',
            preDok: true,
            postDok: false
        },
        {
            //id1: 'J003011345714',
            //id2: 'E3846000',
            id1: '1',
            id2: '1',
            type: 'Erytrocytter',
            hla: true,
            bestralt: false,
            reservertPasient: '15076500565',
            reservertDato: '2015-09-22',
            transDato: '2015-09-24',
            preDok: true,
            postDok: false
        },
        {
            //id1: 'J00304212371444',
            //id2: 'E3846000',
            id1: '2',
            id2: '2',
            type: 'Erytrocytter',
            hla: true,
            bestralt: false,
            reservertPasient: '15076500565',
            reservertDato: '2015-09-30',
            transDato: '',
            preDok: false,
            postDok: false
        },
        {
            //id1: 'J003042123714',
            //id2: 'E3846000',
            id1: '3',
            id2: '3',
            type: 'Erytrocytter',
            hla: true,
            bestralt: false,
            reservertPasient: '13116900216',
            reservertDato: '2015-09-30',
            transDato: '',
            preDok: false,
            postDok: false
        },
        {
            //id1: 'J003011345714',
            //id2: 'E3846000',
            id1: '4',
            id2: '4',
            type: 'Erytrocytter',
            hla: true,
            bestralt: false,
            reservertPasient: '15076500565',
            reservertDato: '2015-09-22',
            transDato: '2015-09-24',
            preDok: true,
            postDok: false
        },
        {
            //id1: 'J00301500018053',
            //id2: 'E8447000',
            id1: 'LOC10020',
            id2: 'LOC10024',
            type: 'Trombocytter',
            hla: true,
            bestralt: false,
            reservertPasient: '15076500565',
            reservertDato: '2015-09-30',
            transDato: '',
            preDok: false,
            postDok: false
        }
    ];

    _orderableProducts = [
        {
            id: 0,
            name: 'Erytrocyttkonsentrat',
            count: 0
        },
        {
            id: 1,
            name: 'Plasma',
            count: 0
        },
        {
            id: 2,
            name: 'Trombocyttkonsentrat',
            count: 0
        }
    ];

    _departments = [
        "Akuttmottak",
        "Akuttmottak 2",
        "Medisin 2N",
        "Medisin 3N",
        "Medisin 5N",
        "Øre Nese Hals",
        "Testavdeling 123",
        "Testavdeling 111",
        "Testavdeling 456"
    ];

    _productCount = 0;


    //_getProductByBarcode = function (barcode) {
    //    return barcode < produktData.length ? produktData[barcode] : null;
    //};

    _getProductByIndex = function (index) {

        return index < produktData.length ? produktData[index] : null;
    };

    _getProductByPatient = function (patientId) {

        return produktData.filter(
            function (data) { return data.reservertPasient == patientId }
        );
    };

    _increaseOrder = function (id) {
        _orderableProducts.filter(function (data) { return data.id === id })[0].count++;
        _count++;
        console.log(_count);
    }

    _decreaseOrder = function (id) {
        _orderableProducts.filter(function (data) { return data.id === id })[0].count--;
        _count--;
        console.log(_count);
    }

    _getProductById = function (Id1, Id2) {
        return produktData.filter(
            function (data) { return (data.id1 === Id1 && data.id2 === Id2) }
        )[0];


    };

    _getMissingDocumentationByPatient = function (Fnr) {
        return produktData.filter(
            function (data) { return data.reservertPasient === Fnr && (data.transDato.length > 0 && (data.predok === false || data.postDok === false)) }
        );


    };

    _setTransStart = function (id1, id2, dato) {
        var as = $(transDokData).filter(function (i, n) { return n.id1 === id1 && n.id2 === id2 });
        // her skal vi bare ha en
        for (var i = 0; i < as.length; i++) {
            as[i].transDato = dato;
        };
    };

    _setTransPostDok = function (id1, id2, post) {
        var as = $(transDokData).filter(function (i, n) { return n.id1 === id1 && n.id2 === id2 });
        // her skal vi bare ha en
        for (var i = 0; i < as.length; i++) {
            as[i].postDok = post;
        };
    };
    _setTransPreDok = function (id1, id2, pre) {
        var as = $(transDokData).filter(function (i, n) { return n.id1 === id1 && n.id2 === id2 });
        // her skal vi bare ha en
        for (var i = 0; i < as.length; i++) {
            as[i].preDok = pre;
        };
    };

    _decreaseProductCount = function(){
        _productCount--;
    };

    _increaseProductCount = function(){
        _productCount++;
    };

    _getProductCount = function(){
        return _productCount;
    };

    return {
        getProductById: _getProductById,
        getProductByIndex: _getProductByIndex,
        getProductByPatient: _getProductByPatient,
        orderableProducts: _orderableProducts,
        departments: _departments,
        decreaseOrder: _decreaseOrder,
        increaseOrder: _increaseOrder,
        setTransStart: _setTransStart,
        setTransPreDok: _setTransPreDok,
        setTransPostDok: _setTransPostDok,
        getMissingDocumentationByPatient: _getMissingDocumentationByPatient,
        getProductCount: _getProductCount,
        decreaseproductCount: _decreaseProductCount,
        increaseproductCount: _increaseProductCount
    }
});