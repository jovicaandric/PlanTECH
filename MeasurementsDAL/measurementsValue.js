
class measurementsValue {
    //konstruktor
    constructor(ValueID, DataValue, DateTimeUTC) {
        //ovo nam treba
        this.ValueID = ValueID;
        this.DataValue = DataValue;
        this.DateTimeUTC = DateTimeUTC;
        //ovo je ostatak iz .cs klase
        this.DerivedValueJobId = null;
        this.DeriveValueProperty = null;
        this.DerivedValueProperty = null;
        this.LocalDateTime = null;
        this.QualifierID = null;
        this.SelectedSuperSeriesID = null;
        this.SeriesID = null;
        this.SyncTS = null;
        this.UTCOffset = null;
        this.ValueAccuracy = null;
        this.ValueAccuracyReliability = null;
        this.ValueAccuracyShema = null;
        this.ValueAccuracyStatus = null;
    }

    FromBin(data) {
        //not implemented returns ODDataValues
    }
    Clone() {
        //not implemented returns object
    }
    CompareTo(x) {
        //not implemented returns int
    }
    Create() {
        //not implemented returns ODDataValues
    }
    Deserialize(__sc) {
        //not implemented,generic returns ODDataValues
    }
    Dump(dw) {
        //not implemented returns void
    }
    IsValid() {
        //not implemented returns bool
    }
    Read(__sc) {
        //not implemented returns void
    }
    ToString() {
        //not implemented returns string
    }
    Validate() {
        //not implemented returns List
    }
    Write(_sc) {
        //not implemented returns void
    }

}
module.exports = measurementsValue;