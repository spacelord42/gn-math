/*CoJoinRoomScreen script that handles join room screen panel controls by Burak Ersin - emolingo games */
var CoJoinRoomScreen = pc.createScript('coJoinRoomScreen');
CoJoinRoomScreen.attributes.add('quitButton', { type: 'entity' });
CoJoinRoomScreen.attributes.add('joinRoomButton', { type: 'entity' });
CoJoinRoomScreen.attributes.add('joinRoomIDText', { type: 'entity' });

CoJoinRoomScreen.prototype.initialize = function () {
    this.quitButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openGameScreen");
    }, this);

    this.joinRoomButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openLoadingScreen");
        this.app.fire("JoinRoom", this.joinRoomIDText.element.text);
    }, this);
};