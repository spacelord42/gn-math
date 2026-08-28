/*CoSoundButton script that handles sound button controls by Burak Ersin - emolingo games */
var CoSoundButton = pc.createScript('coSoundButton');

CoSoundButton.prototype.initialize = function () {
    this.entity.button.on("click", this.onClick, this);
    this.on("destroy", () => {
        this.entity.button.off("click", this.onClick, this);
    }, this);
};

CoSoundButton.prototype.onClick = function () {
    this.app.fire("openSound:uiClick");
};