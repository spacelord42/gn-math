/*BallObbyElapsedTime script that counts elapsed time and creates timer by Emre Şahin - emolingo games */
var BallObbyElapsedTime = pc.createScript('ballObbyElapsedTime');
BallObbyElapsedTime.attributes.add('timerText', { type: 'entity' });
BallObbyElapsedTime.prototype.initialize = function () {
    this.app.ballElapsedTime = BallObby_Utils.getItem("BALLOBBY_elapsedTime");
    if (this.app.ballElapsedTime == null) {
        this.app.ballElapsedTime = 0;
        BallObby_Utils.setItem("BALLOBBY_elapsedTime", this.app.ballElapsedTime);
    } else {
        this.app.ballElapsedTime = BallObby_Utils.getItem("BALLOBBY_elapsedTime") * 1;
    }
};

BallObbyElapsedTime.prototype.update = function (dt) {
    if (this.app.ballStopTimer === true) return;

    this.app.ballElapsedTime += dt * 1;
    var miliseconds = Math.floor((this.app.ballElapsedTime % 1) * 1000);
    var seconds = Math.floor(this.app.ballElapsedTime % 60);
    var minutes = Math.floor((this.app.ballElapsedTime / 60) % 60);

    var timeString = "";
    timeString += minutes + ":";
    timeString += seconds + ".";
    timeString += miliseconds;

    if (timeString !== "")
        this.timerText.element.text = timeString;

    BallObby_Utils.setItem("BALLOBBY_elapsedTime", parseInt(this.app.ballElapsedTime));
};