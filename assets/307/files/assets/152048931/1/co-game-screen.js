/*CoGameScreen script that handlesc core game screen panel controls by Burak Ersin - emolingo games */
var CoGameScreen = pc.createScript('coGameScreen');
CoGameScreen.attributes.add('coinText', { type: 'entity' });
CoGameScreen.attributes.add('elapsedTimeText', { type: 'entity' });
CoGameScreen.attributes.add('deathCountText', { type: 'entity' });
CoGameScreen.attributes.add('percentArrow', { type: 'entity' });
CoGameScreen.attributes.add('stagePercentText', { type: 'entity' });
CoGameScreen.attributes.add('backgroundScreen', { type: 'entity' });
CoGameScreen.attributes.add('restartButton', { type: 'entity' });
CoGameScreen.attributes.add('shopButton', { type: 'entity' });
CoGameScreen.attributes.add('esctButton', { type: 'entity' });

CoGameScreen.prototype.initialize = function () {
    this.app.on("changedCoin", this.changedCoinCount, this);
    this.app.on("changedDeathCount", this.changedDeathCount, this);

    this.restartButton.button.on("click", () => {
        this.app.fire("playerDied");
    }, this);

    this.shopButton.button.on("click", () => {
        this.app.fire("coUiManager:openShopScreen");
    }, this);

    this.esctButton.button.on("click", () => {
        this.app.fire("coUiManager:openMenuScreen");
    }, this);

    this.on("destroy", () => {
        this.app.off("changedCoin", this.changedCoinCount, this);
        this.app.off("changedDeathCount", this.changedDeathCount, this);
    }, this);
    this.onEnable();
    this.entity.script.on('enable', this.onEnable, this);
};

CoGameScreen.prototype.onEnable = function (dt) {
    this.coinText.element.text = CoSaveSystem.getItem("CAROBBY_coin");
    this.elapsedTimeText.element.text = CoSaveSystem.getItem("CAROBBY_elapsedTime");
    this.deathCountText.element.text = CoSaveSystem.getItem("CAROBBY_deathCount");
};

CoGameScreen.prototype.update = function (dt) {
    const stageSave = CoSaveSystem.getItem("CAROBBY_stage");
    this.stagePercentText.element.text = stageSave + "%";

    var percentArrowPosition = (stageSave * 1 - 50) * 7.2;
    var newPos = pc.math.lerp(this.percentArrow.getLocalPosition().x, percentArrowPosition, 0.1);
    this.percentArrow.setLocalPosition(new pc.Vec3(newPos, -45, 0));

    if (this.app.keyboard.wasPressed(pc.KEY_M)) {
        this.app.fire("coUiManager:openShopScreen");
    }

    if (this.app.keyboard.wasPressed(pc.KEY_R) && this.backgroundScreen.enabled == false) {
        this.app.fire("playerDied");
    }
};

CoGameScreen.prototype.changedCoinCount = function (dt) {
    this.coinText.element.text = CoSaveSystem.getItem("CAROBBY_coin");
};

CoGameScreen.prototype.changedDeathCount = function (dt) {
    this.deathCountText.element.text = CoSaveSystem.getItem("CAROBBY_deathCount");
};