/*CoCreateRoomFailedScreen script that handles private room failed screen panel controls by Burak Ersin - emolingo games */
var CoCreateRoomFailedScreen = pc.createScript('coCreateRoomFailedScreen');
CoCreateRoomFailedScreen.attributes.add('quitButton', { type: 'entity' });
CoCreateRoomFailedScreen.attributes.add('errorText', { type: 'entity' });

CoCreateRoomFailedScreen.prototype.initialize = function () {
    this.quitButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openGameScreen");
    }, this);
};

CoCreateRoomFailedScreen.prototype.onFailed = function (errorMessage) {
    this.errorText.element.text = errorMessage;
};