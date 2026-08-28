/*CoPopUp script that handles popup tween controls by Burak Ersin - emolingo games */
var CoPopUp = pc.createScript('coPopUp');

CoPopUp.prototype.initialize = function () {
    this.onEnable();
    this.on("enable", this.onEnable, this);
    this.on("disable", this.onDisable, this);
};

CoPopUp.prototype.onEnable = function () {
    if (this.activeTween)
        this.activeTween.stop();

    this.entity.setLocalScale(0.5, 0.5, 0.5);

    this.activeTween = this.entity
        .tween(this.entity.getLocalScale()).to(new pc.Vec3(1, 1, 1), 0.2, pc.SineOut)
        .onComplete(() => {
            this.activeTween = null;
        }).start();
};

CoPopUp.prototype.onDisable = function () {
    if (this.activeTween)
        this.activeTween.stop();
    this.entity.setLocalScale(0.5, 0.5, 0.5);
};

CoPopUp.prototype.closePanel = function () {
    if (this.activeTween)
        this.activeTween.stop();
    this.entity.setLocalScale(1, 1, 1);
    this.activeTween = this.entity
        .tween(this.entity.getLocalScale()).to(new pc.Vec3(0.5, 0.5, 0.5), 0.2, pc.SineOut)
        .onComplete(() => {
            this.app.fire("coUiManager:openGameScreen");
        }).start();
};