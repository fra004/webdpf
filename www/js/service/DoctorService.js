//function Doctor(fornavn, etternavn, middelnavn){
//    this.fornavn = fornavn;
//    this.etternavn = etternavn;
//    this.middelnavn = middelnavn;
//    this.getName = function(){
//		return this.fornavn + (this.middelnavn ? (" "  + this.middelnavn): "") + " " + this.etternavn;
//	}
//}
//function Nurse(fornavn, etternavn, middelnavn) {
//    Doctor.call(this, fornavn, etternavn, middelnavn);
//}

function Doctor(fornavn, etternavn, middelnavn, barcode){
    this.fornavn = fornavn;
    this.etternavn = etternavn;
    this.middelnavn = middelnavn;
    this.barcode = barcode;
    this.getName = function(){
		return this.fornavn + (this.middelnavn ? (" "  + this.middelnavn): "") + " " + this.etternavn;
	}
}
function Nurse(fornavn, etternavn, middelnavn, barcode) {
    Doctor.call(this, fornavn, etternavn, middelnavn, barcode);
}

app.factory('DoctorService', function () {
    doctors = {
        "LOC10009": new Doctor('Arthur', 'Doyle', 'Conan', "LOC10009"),        
        "LOC10010": new Doctor('Mae', 'Jemison', 'C.', "LOC10010"),
        "LOC10011": new Doctor('Jonathan', 'Letterman', '', "LOC10011"),
        "1": new Doctor('Arthur', 'Doyle', 'Conan', "LOC10009"),
        "2": new Doctor('Mae', 'Jemison', 'C.', "LOC10010"),
        "3": new Doctor('Jonathan', 'Letterman', '', "LOC10011"),
    };

    nurses = {
        "1": new Nurse('Florence', 'Nightingale', '', "LOC10001"),
        "2": new Nurse('Walt', 'Whitman', '', "LOC10002"),
        "LOC10001": new Nurse('Florence', 'Nightingale', '', "LOC10001"),
        "LOC10002": new Nurse('Walt', 'Whitman', '', "LOC10002")
    };


    /*
    * Get patient information based on barcode.
    * Now: Barcode is the index
    * Future: Get patient information  from server
    * TODO
    */
    _getDoctor = function (barcode) {
        return doctors[barcode];
        //return barcode < docotors.length ? docotors[barcode] : null;
    };

    _getNurse = function (barcode) {
        return nurses[barcode];
        //return barcode < nurses.length ? nurses[barcode] : null;
    };

    return {
        getDoctor: _getDoctor,
        getNurse:_getNurse
    }
});