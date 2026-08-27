/*CoCarBuyPanel script that handles car buy panel interactions by Burak Ersin - emolingo games */
var CoCarBuyPanel = pc.createScript('coCarBuyPanel');
CoCarBuyPanel.attributes.add('carImages', { type: 'asset', assetType: 'texture', array: true });
CoCarBuyPanel.attributes.add('carImage', { type: 'entity' });
CoCarBuyPanel.attributes.add('carNameText', { type: 'entity' });
CoCarBuyPanel.attributes.add('buyButton', { type: 'entity' });
CoCarBuyPanel.attributes.add('quitButton', { type: 'entity' });
CoCarBuyPanel.attributes.add('radialImage', { type: 'entity' });
CoCarBuyPanel.attributes.add('rewardedImage', { type: 'entity' });
CoCarBuyPanel.attributes.add('descriptionText', { type: 'entity' });

CoCarBuyPanel.prototype.initialize = function () {
    this.panelCarID = 0;
    for (i = 0; i < this.entity.parent.children.length; i++) {
        if (this.entity.parent.children[i] === this.entity) {
            this.panelCarID = i + 1;
            break;
        }
    }

    this.buyButton.button.on('click', function (event) {
        let collectedCars = JSON.parse(CoSaveSystem.getItem("CAROBBY_collectedCars"));
        let carFromCollectedCars = collectedCars[this.panelCarID];
        if (carFromCollectedCars.hasCar == true) {
            this.app.fire("changeCar", this.panelCarID);
            return;
        }
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
                this.app.fire("changeCar", this.panelCarID);
                this.app.fire('WarningTextController:setWarning', "Reward received!", 5, new pc.Color(0, 1, 0, 1));
                this.app.fire("coUiManager:openGameScreen");
            } else {

            }
        });
    }, this);

    this.quitButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openGameScreen");
    }, this);

    this.carImage.element.texture = this.carImages[this.panelCarID - 1].resource;
    this.carNameText.element.text = "CAR " + this.panelCarID;

    if (this.panelCarID < 3) {
        this.radialImage.element.color = new pc.Color(1, 1, 1);
    } else if (this.panelCarID < 6) {
        this.radialImage.element.color = new pc.Color(0, 1, 0);
    } else if (this.panelCarID < 7) {
        this.radialImage.element.color = new pc.Color(1, 0, 1);
    } else {
        this.radialImage.element.color = new pc.Color(0, 0, 0);
    }

    this.onEnable();
    this.entity.script.on('enable', this.onEnable, this);
};

CoCarBuyPanel.prototype.onEnable = function () {
    let collectedCars = JSON.parse(CoSaveSystem.getItem("CAROBBY_collectedCars"));
    let carFromCollectedCars = collectedCars[this.panelCarID];
    this.rewardedImage.enabled = carFromCollectedCars.hasCar == false;
    this.descriptionText.enabled = carFromCollectedCars.hasCar == false;
};