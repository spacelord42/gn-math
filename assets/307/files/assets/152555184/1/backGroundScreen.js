/*BackGroundScreen script that handles background screen panel controls by Burak Ersin - emolingo games */
var BackGroundScreen = pc.createScript('backGroundScreen');

BackGroundScreen.prototype.initialize = function () {
    this.app.coBackGroundEnabled = false;
    this.on("state", this.onEnabled);
};

BackGroundScreen.prototype.onEnabled = function (enabled) {
    this.app.coBackGroundEnabled = enabled;
    this.entity.children[0].element.opacity = 0;
    if (enabled) {
        this.data = { value: 0 };
        this.entity.children[0]
            .tween(this.data).to({ value: 0.75 }, 0.2, pc.SineOut)
            .onUpdate((dt) => {
                this.entity.children[0].element.opacity = this.data.value;
            }).start();
    } else {
        this.entity.children[0].element.opacity = 0;
    }
};

BackGroundScreen.prototype.closePanel = function () {
    this.data = { value: 0.75 };
    this.entity.children[0]
        .tween(this.data).to({ value: 0 }, 0.1, pc.SineOut)
        .onUpdate((dt) => {
            this.entity.children[0].element.opacity = this.data.value;
        })
        .onComplete(() => {
            this.entity.enabled = false;
        }).start();
};