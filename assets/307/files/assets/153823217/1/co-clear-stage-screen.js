/*CoClearStageScreen script that handles clearing stage data screen panel controls by Burak Ersin - emolingo games */
var CoClearStageScreen = pc.createScript('coClearStageScreen');
CoClearStageScreen.attributes.add('quitButton', { type: 'entity' });
CoClearStageScreen.attributes.add('clearDataButton', { type: 'entity' });

CoClearStageScreen.prototype.initialize = function () {
    this.quitButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openGameScreen");
    }, this);

    this.clearDataButton.button.on('click', function (event) {
        this.app.fire("clearStage");
        this.app.fire("coUiManager:openGameScreen");
    }, this);
};