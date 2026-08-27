/*CoShopButton script that handles shop button controls by Burak Ersin - emolingo games */
var CoShopButton = pc.createScript('coShopButton');
CoShopButton.attributes.add("priceTextParent", { type: "entity" });
CoShopButton.attributes.add("priceText", { type: "entity" });
CoShopButton.attributes.add("priceImage", { type: "entity" });
CoShopButton.attributes.add("checkImage", { type: "entity" });
CoShopButton.attributes.add("radialImage", { type: "entity" });
CoShopButton.attributes.add('carImage', { type: "entity" });
CoShopButton.attributes.add('carImages', { type: 'asset', assetType: 'texture', array: true });
CoShopButton.attributes.add('buttonImages', { type: 'asset', assetType: 'sprite', array: true });
CoShopButton.attributes.add('priceTypeImages', { type: 'asset', assetType: 'texture', array: true });

CoShopButton.prototype.initialize = function () {
    this.buttonCarID = 0;
    for (i = 0; i < this.entity.parent.children.length; i++) {
        if (this.entity.parent.children[i] === this.entity) {
            this.buttonCarID = i;
            break;
        }
    }

    this.entity.button.on('click', function (event) {
        this.onClicked();
    }, this);

    this.setButton();
};

CoShopButton.prototype.setButton = function () {
    this.checkImage.enabled = CoSaveSystem.getItem("CAROBBY_carID") == this.buttonCarID;

    this.setButtonText();
    this.setPriceTypeImage();
    this.setImageColor();
    this.setCarImage();
    this.setRadialColor();
};

CoShopButton.prototype.onClicked = function () {
    let collectedCars = JSON.parse(CoSaveSystem.getItem("CAROBBY_collectedCars"));
    let carFromCollectedCars = collectedCars[this.buttonCarID];

    if (carFromCollectedCars.hasCar == false) {
        if (carFromCollectedCars.carPriceType == "coin") {
            if (CoSaveSystem.getItem("CAROBBY_coin") < carFromCollectedCars.price) {
                this.app.fire('WarningTextController:setWarning', "You don't have enough money.", 5, new pc.Color(1, 0, 0, 1));
                return;
            } else {
                CoSaveSystem.setItem("CAROBBY_coin", (CoSaveSystem.getItem("CAROBBY_coin") * 1) - carFromCollectedCars.price);
                collectedCars[this.buttonCarID].hasCar = true;
                CoSaveSystem.setItem("CAROBBY_collectedCars", JSON.stringify(collectedCars));
                this.app.fire("changedCoin");
                this.setButton();
                this.changeCar();
            }
        }
        else if (carFromCollectedCars.carPriceType == "flag") {
            if (CoSaveSystem.getItem("CAROBBY_stage") < carFromCollectedCars.price) {
                this.app.fire('WarningTextController:setWarning', "You didn't complete enough levels.", 5, new pc.Color(1, 0, 0, 1));
                return;
            } else {
                collectedCars[this.buttonCarID].hasCar = true;
                CoSaveSystem.setItem("CAROBBY_collectedCars", JSON.stringify(collectedCars));
                this.setButton();
                this.changeCar();
            }
        }
        else if (carFromCollectedCars.carPriceType == "ads") {
            if (carFromCollectedCars.watchedAds < carFromCollectedCars.price) {
                let adSize;
                if (carFromCollectedCars.price == 1) {
                    adSize = "small";
                } else if (carFromCollectedCars.price == 2) {
                    adSize = "medium";
                } else if (carFromCollectedCars.price == 3) {
                    adSize = "large";
                } else {
                    adSize = "small";
                }
                PokiSDK.rewardedBreak({
                    size: adSize,
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
                        collectedCars[this.buttonCarID].watchedAds = carFromCollectedCars.price;
                        CoSaveSystem.setItem("CAROBBY_collectedCars", JSON.stringify(collectedCars));
                        collectedCars[this.buttonCarID].hasCar = true;
                        CoSaveSystem.setItem("CAROBBY_collectedCars", JSON.stringify(collectedCars));
                        this.setButton();
                        this.app.fire('WarningTextController:setWarning', "Reward received!", 5, new pc.Color(0, 1, 0, 1));
                        this.changeCar();
                        this.app.fire("coUiManager:openGameScreen");
                    } else {
                        return;
                    }
                });
            } else {
                collectedCars[this.buttonCarID].hasCar = true;
                CoSaveSystem.setItem("CAROBBY_collectedCars", JSON.stringify(collectedCars));
                this.setButton();
                this.changeCar();
            }
        }
    } else {
        this.changeCar();
    }
};

CoShopButton.prototype.changeCar = function () {
    let savedCarID = CoSaveSystem.getItem("CAROBBY_carID");
    this.app.fire("changeCar", this.buttonCarID);
    setTimeout(() => {
        if (savedCarID != CoSaveSystem.getItem("CAROBBY_carID"))
            this.app.fire("changedCar");
        this.app.fire("coUiManager:openGameScreen");
    }, 100);
};

CoShopButton.prototype.setButtonText = function () {
    let collectedCars = JSON.parse(CoSaveSystem.getItem("CAROBBY_collectedCars"));
    let carFromCollectedCars = collectedCars[this.buttonCarID];

    if (carFromCollectedCars.carPriceType == "coin")
        this.priceText.element.text = carFromCollectedCars.price;
    else if (carFromCollectedCars.carPriceType == "flag")
        this.priceText.element.text = CoSaveSystem.getItem("CAROBBY_stage") + "/" + carFromCollectedCars.price;
    else if (carFromCollectedCars.carPriceType == "ads") {
        if (carFromCollectedCars.price > 3)
            carFromCollectedCars.price = 3;
        this.priceText.element.text = carFromCollectedCars.price;
    }

    this.priceTextParent.enabled = carFromCollectedCars.hasCar == false;
};

CoShopButton.prototype.setRadialColor = function () {
    if (this.buttonCarID < 3) {
        this.radialImage.element.color = new pc.Color(1, 1, 1);
    } else if (this.buttonCarID < 6) {
        this.radialImage.element.color = new pc.Color(0, 1, 0);
    } else if (this.buttonCarID < 8) {
        this.radialImage.element.color = new pc.Color(1, 0, 1);
    } else {
        this.radialImage.element.color = new pc.Color(0, 0, 0);
    }
    this.radialImage.enabled = true;
};

CoShopButton.prototype.setImageColor = function () {
    if (this.buttonCarID < 3) {
        this.entity.element.sprite = this.buttonImages[0].resource;
    } else if (this.buttonCarID < 6) {
        this.entity.element.sprite = this.buttonImages[1].resource;
    } else if (this.buttonCarID < 8) {
        this.entity.element.sprite = this.buttonImages[2].resource;
    } else {
        this.entity.element.sprite = this.buttonImages[3].resource;
    }
};

CoShopButton.prototype.setPriceTypeImage = function () {
    let collectedCars = JSON.parse(CoSaveSystem.getItem("CAROBBY_collectedCars"));
    let carFromCollectedCars = collectedCars[this.buttonCarID];

    if (carFromCollectedCars.carPriceType == "coin") {
        this.priceImage.element.texture = this.priceTypeImages[0].resource;
    }
    else if (carFromCollectedCars.carPriceType == "flag") {
        this.priceImage.element.texture = this.priceTypeImages[1].resource;
    }
    else if (carFromCollectedCars.carPriceType == "ads") {
        this.priceImage.element.texture = this.priceTypeImages[2].resource;
    }
};

CoShopButton.prototype.setCarImage = function () {
    this.carImage.element.texture = this.carImages[this.buttonCarID].resource;
    this.carImage.enabled = true;
};