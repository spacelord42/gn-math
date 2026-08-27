/*CoSoundController script that handles car engine sound by Emre Şahin - emolingo games */
var CoSoundController = pc.createScript('coSoundController');
// initialize code called once per entity
CoSoundController.prototype.initialize = function () {
    this.bikeDriveSlot = this.entity.sound.slot("carDrive");
    this.bikeDriveSound = false;
    this.distance = 0;

    this.app.on("sound:carSoundStart", this.soundStart, this);
    this.app.on("sound:carSoundStop", this.soundStop, this);
    this.app.on("sound:carSoundDie", this.soundDie, this);

    this.on("destroy", function () {
        this.app.off("sound:carSoundStart", this.soundStart, this);
        this.app.off("sound:carSoundStop", this.soundStop, this);
        this.app.off("sound:carSoundDie", this.soundDie, this);
    }, this);
};

CoSoundController.prototype.update = function (dt) {
    this.bikeDriveSlot.pitch = Math.min(Math.max(this.distance / 1.5, 0.4), 2);
    if (this.bikeDriveSound == false) {
        this.entity.sound.play("carDrive");
        this.bikeDriveSound = true;
    }
};

CoSoundController.prototype.soundStart = function () {
    this.bikeDriveSound = false;

};

CoSoundController.prototype.soundStop = function () {
    this.bikeDriveSound = true;
    this.entity.sound.stop("carDrive");
};
CoSoundController.prototype.soundDie = function () {
    //this.playerModel.sound.play("oof");
    this.bikeDriveSound = true;
    this.entity.sound.stop("carDrive");

};
