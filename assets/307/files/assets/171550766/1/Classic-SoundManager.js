/*ClassicSoundManager script that handles game mode music by Emre Şahin - emolingo games */
var ClassicSoundManager = pc.createScript('classicSoundManager');

// initialize code called once per entity
ClassicSoundManager.prototype.initialize = function () {
    this.app.on("ClassicMusic", this.playSound, this);
    this.on("destroy", () => {
        this.app.off("ClassicMusic", this.playSound, this);
    }, this)
};

// update code called every frame
ClassicSoundManager.prototype.playSound = function (name) {
    this.entity.sound.play(name);
};