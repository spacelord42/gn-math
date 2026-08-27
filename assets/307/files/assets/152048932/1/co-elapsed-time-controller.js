/*CoElapsedTimeController script that counts elapsed time and creates timer by Emre Şahin - emolingo games */
var CoElapsedTimeController = pc.createScript('coElapsedTimeController');

CoElapsedTimeController.prototype.initialize = function () {
    this.elapsedTime = CoSaveSystem.getItem("CAROBBY_elapsedTime");
    if (this.elapsedTime == null) {
        this.elapsedTime = 0;
        CoSaveSystem.setItem("CAROBBY_elapsedTime", this.elapsedTime);
    } else {
        this.elapsedTime = CoSaveSystem.getItem("CAROBBY_elapsedTime") * 1;
    }
};

CoElapsedTimeController.prototype.update = function (dt) {
    this.elapsedTime += dt * 1;

    var seconds = Math.floor(this.elapsedTime % 60);
    var minutes = Math.floor((this.elapsedTime / 60) % 60);
    var hours = Math.floor((this.elapsedTime / 3600));

    var timeString = "";
    if (hours > 0) {
        timeString += hours + "h ";
    }
    if (minutes > 0) {
        timeString += minutes + "m ";
    }
    if (seconds > 0) {
        timeString += seconds + "s";
    }

    if (timeString !== "")
        this.entity.element.text = timeString;

    CoSaveSystem.setItem("CAROBBY_elapsedTime", parseInt(this.elapsedTime));
};