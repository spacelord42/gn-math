/*BallObbyMarketItem script that handles ball skin market and buy mechanics by Emre Şahin - emolingo games */
var BallObbyMarketItem = pc.createScript('ballObbyMarketItem');
BallObbyMarketItem.attributes.add("index", { type: "number", default: 0 });
BallObbyMarketItem.attributes.add("adsCount", { type: "number", default: 0 });
BallObbyMarketItem.attributes.add("neededCoin", { type: "number", default: 0 });

// initialize code called once per entity
BallObbyMarketItem.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.ballObbyNetworkManager;
    this.needRewardedText = this.entity.children[0];

    if (this.index != 11) {
        this.textPanel = this.entity.children[1];
        this.text = this.entity.children[1].children[1];
    }
    else {
        this.textPanel = this.entity.children[2];
        this.text = this.entity.children[2].children[1];
    }
    if (this.index == 0) {
        this.own = true;
    }
    if (this.adsCount > 3)
        this.adsCount = 3;
    if (this.adsCount > 0)
        this.text.element.text = this.adsCount;
    else if (this.neededCoin > 0)
        this.text.element.text = this.neededCoin;

    this.entity.button.on('click', () => {
        if (this.own) {
            this.sellect();
            return;
        }
        if (this.adsCount != 0) {
            this.showAds();
        }
        if (this.neededCoin != 0) {
            this.buy();
        }
    });

    if (BallObby_Utils.getItem("ballObby:currentSkin"))
        if (BallObby_Utils.getItem("ballObby:currentSkin") * 1 == this.index) {
            this.sellect();
        }
    if (BallObby_Utils.getItem("ballObby:skins"))
        if (JSON.parse(BallObby_Utils.getItem("ballObby:skins"))[this.index] == true) {
            this.own = true;
            this.textPanel.enabled = false;
            this.closePanel();
        }
    this.closePanel();

};

BallObbyMarketItem.prototype.sellect = function () {
    this.textPanel.enabled = false;
    BallObby_Utils.setItem("ballObby:currentSkin", this.index);

    if (this.networkManager.room) {
        this.networkManager.room.send("Client:ChangeBall", { ballId: this.index });
    }
    //this.networkManager.playerController.playerModel;

    let player = this.networkManager.playerController;
    let ballModel = this.networkManager.playerController.ball.children[0].children[0];

    ballModel.render.meshInstances[0].material =
        player.playerMaterials[this.index].resource;

    this.closePanel();
};
BallObbyMarketItem.prototype.showAds = function () {
    //this.rewardedAds();
    this.app.isWatchingAd = true;
    let adSize;
    if (this.adsCount == 1) {
        adSize = "small";
    } else if (this.adsCount == 2) {
        adSize = "medium";
    } else if (this.adsCount == 3) {
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
        this.app.isWatchingAd = false;
        if (success) {
            gameanalytics.GameAnalytics.addAdEvent(
                gameanalytics.EGAAdAction.Show,
                gameanalytics.EGAAdType.RewardedVideo,
                "poki",
                "BallObby"
            );
            //this.app.fire('WarningTextController:setWarning', "Reward received!", 5, new pc.Color(0, 1, 0, 1));
            this.rewardedAds();
        } else {

        }
    });
};
BallObbyMarketItem.prototype.rewardedAds = function () {
    this.adsCount = 0;
    this.text.element.text = this.adsCount;
    if (this.adsCount < 1) {
        this.own = true;
        if (BallObby_Utils.getItem("ballObby:skins")) {
            let oldJson = JSON.parse(BallObby_Utils.getItem("ballObby:skins"));
            oldJson[this.index] = true;
            BallObby_Utils.setItem("ballObby:skins", JSON.stringify(oldJson));
        }
        else {
            let json = {}
            json[this.index] = true;
            BallObby_Utils.setItem("ballObby:skins", JSON.stringify(json))
        }
        this.textPanel.enabled = false;
        this.closePanel();
        this.sellect()
        this.networkManager.playerController.playerModel.sound.play("bought");
        this.app.fire('WarningTextController:setWarning', "Reward received!", 5, new pc.Color(0, 1, 0, 1));
    }

};
BallObbyMarketItem.prototype.buy = function () {
    let needMoney = this.neededCoin - this.app.ballObbyCoin;
    if (!this.app.ballObbyCoin) {
        this.app.fire('WarningTextController:setWarning', "you need " + needMoney + " gold to buy new ball", 5, new pc.Color(1, 0, 0, 1));
        this.closePanel();
        return;
    }
    if (this.app.ballObbyCoin < this.neededCoin) {
        this.app.fire('WarningTextController:setWarning', "you need " + needMoney + " gold to buy new ball", 5, new pc.Color(1, 0, 0, 1));
        this.closePanel();
        return;
    }
    this.own = true;
    if (BallObby_Utils.getItem("ballObby:skins")) {
        let oldJson = JSON.parse(BallObby_Utils.getItem("ballObby:skins"));
        oldJson[this.index] = true;
        BallObby_Utils.setItem("ballObby:skins", JSON.stringify(oldJson));
    }
    else {
        let json = {}
        json[this.index] = true;
        BallObby_Utils.setItem("ballObby:skins", JSON.stringify(json))
    }
    this.sellect();
    this.networkManager.playerController.playerModel.sound.play("bought");
    this.app.ballObbyCoin -= this.neededCoin;
    this.app.fire("goldTextUpload");
};
BallObbyMarketItem.prototype.closePanel = function () {
    this.networkManager.shopButtonClose.button.fire('click');
};