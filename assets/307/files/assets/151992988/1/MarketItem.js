/*BikeObby_MarketItem script that handles listed market item properties object by Emre Şahin - emolingo games */
var BikeObby_MarketItem = pc.createScript('marketItem');
BikeObby_MarketItem.attributes.add('type', {
    type: 'number',
    enum: [
        { 'bike': 0 },
        { 'powerup': 1 },
    ],
});
BikeObby_MarketItem.attributes.add('typeId', { type: 'number', default: 0 });

// initialize code called once per entity
BikeObby_MarketItem.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.networkManager;
    this.checkMark = this.entity.findByName("CheckMark");
    this.priceParent = this.entity.findByName("Text").parent;
    this.priceText = this.entity.findByName("Text").element;

    if (BikeObby_Utils.getItem("BIKEOBBY_activeBike") === this.typeId.toString()) {
        this.checkMark.enabled = true;
    }

    if (this.type === 0) {
        this.data = bikeData[this.typeId];
        if (BikeObby_Utils.getItem("BIKEOBBY_bikeBoughtType" + this.typeId) === "1") {
            this.priceParent.enabled = false;
        }
    } else if (this.type === 1) {

    }

    if (this.data.isRewarded) {
        let count = BikeObby_Utils.getItem("BIKEOBBY_rewardedBike" + this.typeId);
        if (count == null || count == "" || isNaN(count)) {
            count = 0;
        }
        if (this.data.price > 3)
            this.data.price = 3;
        this.priceText.text = this.data.price;
    } else {
        this.priceText.text = this.data.price;
    }

    if (this.data.isAnimated) {
        this.entity
            .tween(this.entity.getLocalScale()).to(new pc.Vec3(1.05, 1.05, 1.05), 0.5, pc.SineInOut)
            .yoyo(true)
            .loop(true)
            .start();
    }

    this.app.on("ActiveBikeChanged", () => {
        if (BikeObby_Utils.getItem("BIKEOBBY_activeBike") === this.typeId.toString()) {
            this.checkMark.enabled = true;
        } else {
            this.checkMark.enabled = false;
        }
    }, this);

    this.entity.button.on('click', function (event) {
        this.buy();
    }, this);

    this.on('destroy', function () {
        this.app.off("ActiveBikeChanged");
    }, this);
};

BikeObby_MarketItem.prototype.buy = function () {
    if (this.data.isRewarded) {
        let adSize;
        if (this.data.price == 1) {
            adSize = "small";
        } else if (this.data.price == 2) {
            adSize = "medium";
        } else if (this.data.price == 3) {
            adSize = "large";
        } else {
            adSize = "small";
        }
        PokiSDK.rewardedBreak({
            size: adSize,
            onStart: () => {
                // you can pause any background music or other audio here
                this.app.systems.sound.volume = 0;
            }
        }).then((success) => {
            console.log("Rewarded break finished, proceeding to game", success);
            this.app.systems.sound.volume = 1;
            this.app.isWatchingAd = false;
            if (success) {
                let count = BikeObby_Utils.getItem("BIKEOBBY_rewardedBike" + this.typeId);
                if (count == null || count == "" || isNaN(count)) {
                    count = this.data.price;
                } else {
                    count = this.data.price;
                }
                BikeObby_Utils.setItem("BIKEOBBY_rewardedBike" + this.typeId, count);
                this.priceText.text = this.data.price;
                if (count >= this.data.price) {
                    if (this.networkManager.buyBike(this.typeId, 0)) {
                        this.priceParent.enabled = false;
                        this.data.bought = true;
                    }
                    this.networkManager.shopButton.button.fire('click');
                }
            }
        });
    } else {
        if (this.type === 0) {
            if (this.networkManager.buyBike(this.typeId, this.data.price)) {
                this.priceParent.enabled = false;
                this.data.bought = true;
            }
            this.networkManager.shopButton.button.fire('click');
        } else if (this.type === 1) {
            //this.networkManager.buyPowerup(this.typeId, this.price);
        }
    }
};