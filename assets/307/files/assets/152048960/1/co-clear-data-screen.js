/*BackGroundScreen script that handles clearing data screen panel controls by Burak Ersin - emolingo games */
var CoClearDataScreen = pc.createScript('coClearDataScreen');
CoClearDataScreen.attributes.add('quitButton', { type: 'entity' });
CoClearDataScreen.attributes.add('clearDataButton', { type: 'entity' });

CoClearDataScreen.prototype.initialize = function () {
    this.quitButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openGameScreen");
    }, this);

    this.clearDataButton.button.on('click', function (event) {
        this.app.fire("clearData");
        this.app.fire("coUiManager:openGameScreen");
    }, this);
};