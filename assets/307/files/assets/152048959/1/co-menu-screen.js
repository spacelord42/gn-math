/*CoMenuScreen script that handles menu screen panel controls by Burak Ersin - emolingo games */
var CoMenuScreen = pc.createScript('coMenuScreen');
CoMenuScreen.attributes.add('quitButton', { type: 'entity' });
CoMenuScreen.attributes.add('clearDataButton', { type: 'entity' });
CoMenuScreen.attributes.add('createRoomButton', { type: 'entity' });
CoMenuScreen.attributes.add('joinRoomButton', { type: 'entity' });
CoMenuScreen.attributes.add('backToMenuButton', { type: 'entity' });

CoMenuScreen.prototype.initialize = function () {
    this.quitButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openGameScreen");
    }, this);

    this.clearDataButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openClearDataScreen");
    }, this);

    this.createRoomButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openLoadingScreen");
        this.app.fire("CreateRoom");
    }, this);

    this.joinRoomButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openJoinRoomScreen");
    }, this);

    this.backToMenuButton.button.on('click', async function (event) {
        this.app.root.findByName("Sound Manager").sound.stop("Game Music");
        if (this.app.root.findByName("Network Manager").script.coNetworkManager.room)
            await this.app.root.findByName("Network Manager").script.coNetworkManager.room.leave();
        this.app.scenes.changeScene("Menu");
    }, this);

    this.onEnable();
    this.entity.script.on('enable', this.onEnable, this);
    this.on('disable', this.onDisable, this);

    this.on("destroy", () => {
        this.entity.script.off('enable', this.onEnable, this);
        this.off('disable', this.onDisable, this);
    }, this);
};

CoMenuScreen.prototype.onEnable = function () {
    this.quitButton.enabled = false;
    setTimeout(() => { this.quitButton.enabled = true; }, 1050);
};

CoMenuScreen.prototype.onDisable = function () {
    //CarADSSHOW
    let commercialBreakCounter = Date.now();
    PokiSDK.commercialBreak(() => {
        this.app.systems.sound.volume = 0;
    }).then(() => {
        this.app.isWatchingAd = false;

        if (Date.now() - commercialBreakCounter > 1000) {
            gameanalytics.GameAnalytics.addAdEvent(
                gameanalytics.EGAAdAction.Show,
                gameanalytics.EGAAdType.Interstitial,
                "poki",
                "carObby"
            );
        }
        this.app.systems.sound.volume = 1;
    });
};