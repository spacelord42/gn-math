/*CoBikeObbyScreen script that handles loading bike obby screen panel controls by Emre Şahin - emolingo games */
var CoBikeObbyScreen = pc.createScript('coBikeObbyScreen');
CoBikeObbyScreen.attributes.add('goGameButton', { type: 'entity' });
CoBikeObbyScreen.attributes.add('quitButton', { type: 'entity' });

CoBikeObbyScreen.prototype.initialize = function () {
    this.goGameButton.button.on('click', this.goBikeObby, this);
    this.quitButton.button.on('click', () => {
        this.app.fire("coUiManager:openGameScreen");
    }, this);
};

CoBikeObbyScreen.prototype.goBikeObby = function () {
    const loadLevel = "BikeObby";
    var assets = this.app.assets.findByTag(loadLevel);
    var assetsLoaded = 0;
    var assestTotal = assets.length;

    // Callback when all the assets are loaded
    var onAssetsLoaded = () => {
        this.app.isWatchingAd = true;
        //CarADSSHOW
        let commercialBreakCounter = Date.now();
        PokiSDK.commercialBreak(() => {
            // you can pause any background music or other audio here
            this.app.systems.sound.volume = 0;
        }).then(async () => {

            // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
            // continue your game here
            this.app.systems.sound.volume = 1;
            this.app.isWatchingAd = false;

            if (Date.now() - commercialBreakCounter > 1000) {
                gameanalytics.GameAnalytics.addAdEvent(
                    gameanalytics.EGAAdAction.Show,
                    gameanalytics.EGAAdType.Interstitial,
                    "poki",
                    "carObby"
                );
            }

            // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
            // continue your game here

            this.app.systems.sound.volume = 1;
            this.app.root.findByName("Sound Manager").sound.stop("Game Music");
            if (this.app.root.findByName("Network Manager").script.coNetworkManager.room)
                await this.app.root.findByName("Network Manager").script.coNetworkManager.room.leave();
            this.app.scenes.changeScene(loadLevel);
            this.app.fire("coUiManager:openGameScreen");
        });
    };

    // Callback function when an asset is loaded
    var onAssetReady = (asset) => {
        assetsLoaded += 1;

        // Once we have loaded all the assets
        if (assetsLoaded === assestTotal) {
            onAssetsLoaded();
        }
    };

    // Start loading all the assets
    for (var i = 0; i < assets.length; i++) {
        assets[i].ready(onAssetReady);
        this.app.assets.load(assets[i]);
    }

    if (assets.length === 0) {
        onAssetsLoaded();
    }
};