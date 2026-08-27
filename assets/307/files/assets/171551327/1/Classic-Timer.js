/*ClassicTimer script that counts elapsed time and creates timer by Emre Şahin - emolingo games */
var ClassicTimer = pc.createScript('classicTimer');

ClassicTimer.prototype.initialize = function () {
    this.timerText = this.app.root.findByName("TimerText");
    if (Utils.getItem("Classic_elapsedTime")) {
        this.app.elapsedTime = Number.parseFloat(Utils.getItem("Classic_elapsedTime"));
    }
    else {
        Utils.setItem("Classic_elapsedTime", 0)
        this.app.elapsedTime = 0;
    }
    if (Utils.getItem("Classic_elapsedTimerOff")) {
        this.app.elapsedTimeOff = true;
    }

    if (this.entity.start == null)
        this.elapsedTimer(0)
};

ClassicTimer.prototype.update = function (dt) {
    if (this.entity.start)
        this.elapsedTimer(dt);

};

ClassicTimer.prototype.elapsedTimer = function (dt) {
    if (this.app.elapsedTimeOff) return;
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

    Utils.setItem("Classic_elapsedTime", (this.app.elapsedTime));
}