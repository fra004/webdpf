angular.module('app')
.service('sharedProperties', function () {
    var patientString = "";
    var userValue = [];
    var patientValue = [];
    var bloodbag = {
        part1: '',
        part2: ''
    };
    var pasinfo = "";
    return {
        getUser: function () {
            return userValue;
        },
        setUser: function (value) {
            userValue = value;
        },
        getPatient: function () {
            return patientValue;
        },
        setPatient: function (value) {
            patientValue = value;
        },
        getPatientString: function () {
            return patientString;
        },
        setPatientString: function (value) {
            patientString = value;
        },
        getBloodbag: function () {
            return bloodbag;
        },
        setBloodbag: function (value) {
            //console.log("setBloodbag: "+ value);
            //console.log("Bloodbag: " + bloodbag);
            //console.log("Bloodbag.part1.length: " + bloodbag.part1.length);
            //console.log("Bloodbag.part2.length: " + bloodbag.part2.length);
            //console.log(value === 0 || bloodbag && (bloodbag.part1.length > 0 && bloodbag.part2.length > 0));

            // clear or new bag? empty both values...
            if (value === 0 || bloodbag &&(bloodbag.part1.length > 0 && bloodbag.part2.length > 0)) {
                bloodbag.part1 = '';
                bloodbag.part2 = '';
            };

            //console.log(value.replace(/\s/g, ""));
            //console.log("count: " + value.replace(/\s/g, "").length);
            //  del 1: samlet 13 char
            //  del 2: 8 char, E3846000= Erytocytter, E8447000= Trombocytter
            var count = value.replace(/\s/g, "").length;
            if (count === 15) {
                bloodbag.part1 = value;
            } else if (count === 8) {
                bloodbag.part2 = value;
            }

          
        },
        getPasInfo: function () {
            return pasinfo
        },
        setPasInfo: function (value) {
            pasinfo = value;
        }
    }
});
