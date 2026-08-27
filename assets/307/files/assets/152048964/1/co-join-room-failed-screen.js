/*CoJoinRoomFailedScreen script that handles join custom room failed screen panel controls by Burak Ersin - emolingo games */
var CoJoinRoomFailedScreen = pc.createScript('coJoinRoomFailedScreen');
CoJoinRoomFailedScreen.attributes.add('quitButton', { type: 'entity' });
CoJoinRoomFailedScreen.attributes.add('errorText', { type: 'entity' });

CoJoinRoomFailedScreen.prototype.initialize = function () {
    this.quitButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openGameScreen");
    }, this);
};

CoJoinRoomFailedScreen.prototype.onFailed = function (errorMessage) {
    this.errorText.element.text = errorMessage;
};