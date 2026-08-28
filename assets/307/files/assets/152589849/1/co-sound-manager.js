/*CoSoundManager script that handles sounds by Burak Ersin - emolingo games */
var CoSoundManager = pc.createScript('coSoundManager');

CoSoundManager.prototype.initialize = function () {
    this.app.on("openSound:coin", this.openCoinSound, this);
    this.app.on("openSound:uiClick", this.openClickSound, this);
    this.app.on("openSound:rewarded", this.openRewardedSound, this);
    this.app.on("openSound:flag", this.openFlagSound, this);
    this.app.on("openSound:death", this.openDeathSound, this);
    this.app.on("openSound:joinArea", this.joinArea, this);

    this.on("destroy", () => {
        this.app.off("openSound:coin", this.openCoinSound, this);
        this.app.off("openSound:uiClick", this.openClickSound, this);
        this.app.off("openSound:rewarded", this.openRewardedSound, this);
        this.app.off("openSound:flag", this.openFlagSound, this);
        this.app.off("openSound:death", this.openDeathSound, this);
        this.app.off("openSound:joinArea", this.joinArea, this);
    }, this);
};

CoSoundManager.prototype.openCoinSound = function () {
    this.entity.sound.play("Coin");
};

CoSoundManager.prototype.openClickSound = function () {
    this.entity.sound.play("Click");
};

CoSoundManager.prototype.openRewardedSound = function () {
    this.entity.sound.play("Rewarded");
};

CoSoundManager.prototype.openFlagSound = function () {
    this.entity.sound.play("Flag");
};

CoSoundManager.prototype.openDeathSound = function () {
    this.entity.sound.play("Death");
};

CoSoundManager.prototype.joinArea = function () {
    this.entity.sound.play("JoinArea");
};