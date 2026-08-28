/*CoSaveManager script that saves the game state to localstorage by Emre Şahin - emolingo games */
var CoSaveManager = pc.createScript('coSaveManager');

CoSaveManager.prototype.initialize = function () {
    this.app.pixelRatio = Math.min(devicePixelRatio, 1.5);
    pc.Application.getApplication().graphicsDevice.maxPixelRatio = this.app.pixelRatio;

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

    if (CoSaveSystem.getItem("CAROBBY_version") == "1") {
        this.dataSetAsDefault();
        return;
    }

    if (CoSaveSystem.getItem("CAROBBY_version") == null) {
        CoSaveSystem.setItem("CAROBBY_version", 2);
    }

    if (CoSaveSystem.getItem("CAROBBY_zoom") == null) {
        CoSaveSystem.setItem("CAROBBY_zoom", 5);
    }

    if (CoSaveSystem.getItem("CAROBBY_quality") == null) {
        CoSaveSystem.setItem("CAROBBY_quality", 1);
    }

    if (CoSaveSystem.getItem("CAROBBY_sound") == null) {
        CoSaveSystem.setItem("CAROBBY_sound", 50);
    }

    if (CoSaveSystem.getItem("CAROBBY_coin") == null) {
        CoSaveSystem.setItem("CAROBBY_coin", 0);
    }

    if (CoSaveSystem.getItem("CAROBBY_stage") == null) {
        CoSaveSystem.setItem("CAROBBY_stage", 1);
    }

    if (CoSaveSystem.getItem("CAROBBY_carID") == null) {
        CoSaveSystem.setItem("CAROBBY_carID", 0);
    }

    if (CoSaveSystem.getItem("CAROBBY_deathCount") == null) {
        CoSaveSystem.setItem("CAROBBY_deathCount", 0);
    }

    if (CoSaveSystem.getItem("CAROBBY_elapsedTime") == null) {
        CoSaveSystem.setItem("CAROBBY_elapsedTime", 0);
    }

    if (CoSaveSystem.getItem("CAROBBY_collectedCoins") == null) {
        CoSaveSystem.setItem("CAROBBY_collectedCoins", JSON.stringify({}));
    }

    if (CoSaveSystem.getItem("CAROBBY_collectedCars") == null) {
        CoSaveSystem.setItem("CAROBBY_collectedCars", JSON.stringify(allCars));
    }

    this.app.on("clearData", this.dataSetAsDefault, this);
    this.app.on("clearStage", this.clearStageData, this);

    this.on("destroy", function () {
        this.app.off("clearData", this.dataSetAsDefault, this);
        this.app.off("clearStage", this.clearStageData, this);
    }, this);
};

CoSaveManager.prototype.clearStageData = async function () {
    CoSaveSystem.setItem("CAROBBY_stage", 1);
    if (this.app.root.findByName("Network Manager").script.coNetworkManager.room)
        await this.app.root.findByName("Network Manager").script.coNetworkManager.room.leave();

    this.app.root.findByName("Sound Manager").sound.stop("Game Music");
    this.app.scenes.changeScene("CarObby");
};

CoSaveManager.prototype.dataSetAsDefault = async function () {
    CoSaveSystem.setItem("CAROBBY_zoom", 5);
    CoSaveSystem.setItem("CAROBBY_quality", 1);
    CoSaveSystem.setItem("CAROBBY_sound", 50);
    CoSaveSystem.setItem("CAROBBY_coin", 0);
    CoSaveSystem.setItem("CAROBBY_stage", 1);
    CoSaveSystem.setItem("CAROBBY_carID", 0);
    CoSaveSystem.setItem("CAROBBY_deathCount", 0);
    CoSaveSystem.setItem("CAROBBY_elapsedTime", 0);
    CoSaveSystem.setItem("CAROBBY_collectedCoins", JSON.stringify({}));
    CoSaveSystem.setItem("CAROBBY_collectedCars", JSON.stringify(allCars));
    CoSaveSystem.setItem("CAROBBY_version", 2);

    if (this.app.root.findByName("Network Manager").script.coNetworkManager.room)
        await this.app.root.findByName("Network Manager").script.coNetworkManager.room.leave();

    this.app.root.findByName("Sound Manager").sound.stop("Game Music");
    this.app.scenes.changeScene("CarObby");
};
