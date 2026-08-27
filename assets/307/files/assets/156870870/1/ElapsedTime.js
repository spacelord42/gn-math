/*ElapsedTime script that counts elapsed time and creates timer by Emre Şahin - emolingo games */
var ElapsedTime = pc.createScript('elapsedTime');
ElapsedTime.attributes.add('timerText', { type: 'entity' });
ElapsedTime.prototype.initialize = function () {
    this.app.elapsedTime = BikeObby_Utils.getItem("BIKEOBBY_elapsedTime");
    if (this.app.elapsedTime == null) {
        this.app.elapsedTime = 0;
        BikeObby_Utils.setItem("BIKEOBBY_elapsedTime", this.app.elapsedTime);
    } else {
        this.app.elapsedTime = BikeObby_Utils.getItem("BIKEOBBY_elapsedTime") * 1;
    }
};

ElapsedTime.prototype.update = function (dt) {
    if (this.app.stopTimer === true) return;

    this.app.elapsedTime += dt * 1;
    var miliseconds = Math.floor((this.app.elapsedTime % 1) * 1000);
    var seconds = Math.floor(this.app.elapsedTime % 60);
    var minutes = Math.floor((this.app.elapsedTime / 60) % 60);

    var timeString = "";
    timeString += minutes + ":";
    timeString += seconds + ".";
    timeString += miliseconds;

    if (timeString !== "")
        this.timerText.element.text = timeString;

    BikeObby_Utils.setItem("BIKEOBBY_elapsedTime", parseInt(this.app.elapsedTime));
};