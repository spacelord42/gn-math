/*CoDeathScreen script that handles death screen panel controls by Burak Ersin - emolingo games */
var CoDeathScreen = pc.createScript('coDeathScreen');
CoDeathScreen.attributes.add('respawnButton', { type: 'entity' });
CoDeathScreen.attributes.add('skipStageButton', { type: 'entity' });

CoDeathScreen.prototype.initialize = function () {
    this.respawnButton.button.on('click', function (event) {
        this.app.fire("playerRespawned");
    }, this);

    this.skipStageButton.button.on('click', function (event) {
        PokiSDK.rewardedBreak({
            size: "small",
            onStart: () => {
                this.app.systems.sound.volume = 0;
            }
        }).then((success) => {
            this.app.systems.sound.volume = 1;
            if (success) {
                this.app.fire("openSound:rewarded");
                gameanalytics.GameAnalytics.addAdEvent(
                    gameanalytics.EGAAdAction.Show,
                    gameanalytics.EGAAdType.RewardedVideo,
                    "poki",
                    "carObby"
                );
                CoSaveSystem.setItem("CAROBBY_stage", (CoSaveSystem.getItem("CAROBBY_stage") * 1) + 1);
                this.app.fire("playerRespawned");
                this.app.fire('WarningTextController:setWarning', "Reward received!", 5, new pc.Color(0, 1, 0, 1));
                this.app.fire("StageCompleted");
            } else {

            }
        });

    }, this);

    this.onEnable();
    this.on('enable', this.onEnable, this);
    this.on('disable', this.onDisable, this);
};

CoDeathScreen.prototype.update = function (dt) {
    if (this.app.keyboard.wasPressed(pc.KEY_SPACE) && (CoSaveSystem.getItem("CAROBBY_stage") * 1) < 100) {
        this.app.fire("playerRespawned");
    }
};

CoDeathScreen.prototype.onEnable = function () {
    this.app.fire("openSound:death");
    this.skipStageButton.enabled = (CoSaveSystem.getItem("CAROBBY_stage") * 1) < 100;
    if (this.app.gameplayStarted == true) {
        PokiSDK.gameplayStop();
        this.app.gameplayStarted = false;
    }
};

CoDeathScreen.prototype.onDisable = function () {
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