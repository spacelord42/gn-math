/*BikeObby_BuyBike script that handles buying new bikes from market by Emre Şahin - emolingo games */
var BikeObby_BuyBike = pc.createScript('buyBike');
BikeObby_BuyBike.attributes.add('type', { type: 'number' });
BikeObby_BuyBike.attributes.add('price', { type: 'number' });

// initialize code called once per entity
BikeObby_BuyBike.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.networkManager;
    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            if (this.type === 7) {
                this.app.fire("popupController:showPopup",
                    "Car Obby", "Would you like to play car obby?", true, this.entity, "openCarObby", "closePopup");
                this.networkManager.buyBike(this.type, this.price);
            } if (this.type === 8) {
                this.app.fire("popupController:showPopup",
                    "Rainbow Obby", "Would you like to play rainbow obby?", true, this.entity, "openRainbowObby", "closePopup");
            } else {
                this.networkManager.buyBike(this.type, this.price);
            }
        }
    }, this);
    this.entity.collision.on('triggerleave', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.app.fire("popupController:hidePopup");
        }
    }, this);
    this.entity.on("openRainbowObby", this.openRainbowObby, this);
    this.entity.on("openCarObby", this.openCarObby, this);
};

BikeObby_BuyBike.prototype.openRainbowObby = function () {
    this.loadSceneAssets("ClassicObby");
    this.app.fire('WarningTextController:setWarning', "Loading Rainbow Obby..", 5, new pc.Color(0, 1, 0, 1));
};

BikeObby_BuyBike.prototype.openCarObby = function () {
    this.loadSceneAssets("CarObby");
    this.app.fire('WarningTextController:setWarning', "Loading Car Obby..", 5, new pc.Color(0, 1, 0, 1));
};

BikeObby_BuyBike.prototype.loadSceneAssets = function (loadLevel) {
    this.networkManager.musicPlayer.sound.stop("music");
    // Find all the assets that have been tagged with the scene name
    var assets = this.app.assets.findByTag(loadLevel);
    var assetsLoaded = 0;
    var assestTotal = assets.length;

    // Callback when all the assets are loaded
    var onAssetsLoaded = () => {
        PokiSDK.commercialBreak(() => {
            // you can pause any background music or other audio here
            this.app.systems.sound.volume = 0;
        }).then(async () => {
            console.log("Commercial break finished, proceeding to game ");
            // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
            // continue your game here
            this.app.systems.sound.volume = 1;
            if (this.networkManager.room)
                await this.networkManager.room.leave();
            this.app.scenes.changeScene(loadLevel);
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
}