/*ClientWheelParent script handles exhaust particle depending on speed by Burak Ersin - emolingo games */
var CoExhaust = pc.createScript('coExhaust');

CoExhaust.prototype.initialize = function () {
    this.isParticlePlaying = false;
    this.app.on("onChangedCarSpeed", this.onChangedCarSpeed, this);
    this.app.on("playerDied", this.onPlayerDied, this);

    this.on("destroy", () => {
        this.app.off("playerDied", this.onPlayerDied, this);
        this.app.off("onChangedCarSpeed", this.onChangedCarSpeed, this);
    }, this);

};

CoExhaust.prototype.onChangedCarSpeed = function (speed) {
    if (this.isParticlePlaying == true) {
        if (speed < 10) {
            this.entity.particlesystem.stop();
            this.isParticlePlaying = false;
        }
    } else {
        if (speed > 10) {
            this.entity.particlesystem.play();
            this.isParticlePlaying = true;
        }
    }
};

CoExhaust.prototype.onPlayerDied = function () {
    this.entity.particlesystem.stop();
};
