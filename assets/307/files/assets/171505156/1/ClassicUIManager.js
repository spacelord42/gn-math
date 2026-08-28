/*BallObbyUimanager script that handles UI panels and interactions by Emre Şahin - emolingo games */
var ClassicUimanager = pc.createScript('classicUimanager');
ClassicUimanager.attributes.add("skinMaterials", { type: "asset", assetType: "material", array: true })
ClassicUimanager.attributes.add("body", { type: "entity" })

ClassicUimanager.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.classicNetworkManager;
    this.blackBackGround = this.app.root.findByName("BlackBG");
    this.deadMenu = this.app.root.findByName("DeadMenu");
    this.lowHPEffect = this.app.root.findByName("lowHPEffect");

    //mobile
    this.joystick = this.app.root.findByName("Left Half Touch Joystick");
    this.touchButton = this.app.root.findByName("Touch Button");
    this.touchButton2 = this.app.root.findByName("Touch Button2");

    //coin 
    this.coinText = this.app.root.findByName("CoinText");
    this.checkPointText = this.app.root.findByName("StageUIText");

    //market
    this.market = this.app.root.findByName("Market");
    this.marketButtons = this.market.children[1].children;
    this.shopButton = this.app.root.findByName("ShopButton");

    //market
    this.popupGroup = this.app.root.findByName("PopupGroup");
    this.popupGroupTitle = this.popupGroup.findByName("Title");
    this.popupGroupCloseButton = this.popupGroup.findByName("CloseButton");
    this.popupGroupCloseButton.button.on('click', function (event) {
        this.popupGroup.enabled = false;
    }, this);


    this.bodyMeshInstances = this.body.render.meshInstances[0];

    this.marketItems = {
        0: { coin: 0, ads: false, isOwn: true },
        1: { coin: 25, ads: false, isOwn: false },
        2: { coin: 75, ads: false, isOwn: false },
        3: { coin: 1, ads: true, isOwn: false, total: 1 },
        4: { coin: 3, ads: true, isOwn: false, total: 3 },
        5: { coin: 3, ads: true, isOwn: false, total: 3 },
        6: { isOwn: false }
    }
    if ((Utils.getItem("ClassicObbyMarket")))
        for (let i = 0; i < 7; i++) {
            let save = JSON.parse(Utils.getItem("ClassicObbyMarket"))
            if (save[i]) {
                this.marketItems[i].isOwn = true;
                this.marketButtons[i].children[2].enabled = false;
            }
        }

    this.app.uiManager = this.entity;
    if (Utils.getItem("RainbowObby_skinId")) {
        this.app.currentBodyMaterial = this.skinMaterials[Number.parseInt(Utils.getItem("RainbowObby_skinId"))];
        this.selectItem(Number.parseInt(Utils.getItem("RainbowObby_skinId")));
    }
    else {
        this.app.currentBodyMaterial = this.skinMaterials[0].resource;
        this.selectItem(0);
    }


    this.frameCalculator = 0;


    if (this.app.touch) {
        this.openMobile();
    }
    this.app.on("UpdateProgresTexts", this.updateText, this);
    this.app.on("OpenMarket", this.openMarket, this);
    this.app.on("MarketButton", this.selectMenuItem, this);

    this.on("destroy", () => {
        this.app.off("UpdateProgresTexts", this.updateText, this);
        this.app.off("OpenMarket", this.openMarket, this);
        this.app.off("MarketButton", this.selectMenuItem, this);
    }, this)
};

ClassicUimanager.prototype.connectServer = function () {
    this.app.uiManager = this.entity;
    if (Utils.getItem("RainbowObby_skinId")) {
        this.app.currentBodyMaterial = this.skinMaterials[Number.parseInt(Utils.getItem("RainbowObby_skinId"))];
        this.selectItem(Number.parseInt(Utils.getItem("RainbowObby_skinId")));
    }
    else {
        this.app.currentBodyMaterial = this.skinMaterials[0].resource;
        this.selectItem(0);
    }
};


ClassicUimanager.prototype.selectMenuItem = function (value) {
    if (value == 6) {
        try {
            if (!JSON.parse(Utils.getItem("ClassicObbyMarket"))[6])
                window.open("https://discord.gg/QnZx3pMwHU", "_blank");
        } catch (e) {
            console.log(e)
            window.open("https://discord.gg/QnZx3pMwHU", "_blank");
        }

        if (this.marketButtons[value])
            this.marketButtons[value].children[2].enabled = false;

        this.selectItem(value);

        if (Utils.getItem("ClassicObbyMarket"))
            item = JSON.parse(Utils.getItem("ClassicObbyMarket"))
        else
            item = {}
        item[value] = true;
        Utils.setItem("ClassicObbyMarket", JSON.stringify(item));
        return;
    }
    else {
        if (this.marketItems[value].isOwn == false) {
            if (!this.marketItems[value].ads) {
                if (this.app.coin >= this.marketItems[value].coin) {
                    this.app.coin -= this.marketItems[value].coin;
                    this.marketItems[value].isOwn = true;
                    this.marketButtons[value].children[2].enabled = false;
                    let item;
                    this.selectItem(value);

                    if (Utils.getItem("ClassicObbyMarket"))
                        item = JSON.parse(Utils.getItem("ClassicObbyMarket"))
                    else
                        item = {}
                    item[value] = true;
                    Utils.setItem("ClassicObbyMarket", JSON.stringify(item));

                } else {
                    this.popupGroup.enabled = true;
                    this.popupGroupTitle.element.text = "You don't have enough golds. You need " + (this.marketItems[value].coin - this.app.coin) + " golds";
                }
            }
            else {
                let adSize;
                if (this.marketItems[value].coin == 1) {
                    adSize = "small";
                } else if (this.marketItems[value].coin == 2) {
                    adSize = "medium";
                } else if (this.marketItems[value].coin == 3) {
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
                        gameanalytics.GameAnalytics.addAdEvent(
                            gameanalytics.EGAAdAction.Show,
                            gameanalytics.EGAAdType.Interstitial,
                            "poki",
                            "ClassicObby"
                        );
                        //if (this.app.coin >= this.marketItems[value].coin) {
                        this.marketItems[value].coin = 0;
                        let item;
                        this.marketButtons[value].children[2].findByName("Text").element.text = (this.marketItems[value].total - this.marketItems[value].coin) + "/" + this.marketItems[value].total;///
                        if (this.marketItems[value].coin <= 0) {
                            this.marketButtons[value].children[2].enabled = false;
                            this.selectItem(value);
                            this.marketItems[value].isOwn = true;
                            if (Utils.getItem("ClassicObbyMarket"))
                                item = JSON.parse(Utils.getItem("ClassicObbyMarket"))
                            else
                                item = {}
                            item[value] = true;
                            Utils.setItem("ClassicObbyMarket", JSON.stringify(item));
                        }
                        //}
                    }
                });
            }
        }
        else {
            this.selectItem(value);
        }
    }
}
ClassicUimanager.prototype.selectItem = function (value) {
    this.bodyMeshInstances.material = this.skinMaterials[value].resource;
    this.app.currentBodyMaterial = this.skinMaterials[value];
    this.app.currentskin = value;
    this.openMarket(false);
    Utils.setItem("RainbowObby_skinId", value);
    if (this.networkManager.room) {
        this.networkManager.room.send("skin", this.findSkinName(value))
    }

};
ClassicUimanager.prototype.findSkinName = function (value) {
    if (value == 0) {
        return "default"
    } else if (value == 1) {
        return "angel"
    } else if (value == 2) {
        return "alien"
    } else if (value == 3) {
        return "ninja"
    } else if (value == 4) {
        return "pirate"
    } else if (value == 5) {
        return "devil"
    } else if (value == 6) {
        return "discord"
    } return "default"
};

ClassicUimanager.prototype.openMarket = function (enabled = true) {
    if (enabled)
        if (this.app.deadMenuEnabled || this.app.menuPanelEnabled) return

    if (enabled) {
        //this.app.fire("SdkGamePlay", true);
    }
    else {
        this.app.fire("SdkGamePlay", false);
    }

    this.market.enabled = enabled;
    if (enabled == 0)
        this.app.marketPanel = false;
    else {
        this.app.marketPanel = this.market.enabled;

    }
    this.app.fire("lockCamera", enabled);
}

ClassicUimanager.prototype.updateText = function () {
    this.coinText.element.text = this.app.coin;
    this.checkPointText.element.text = this.app.currentCheckPoint;

}
ClassicUimanager.prototype.openMobile = function () {
    this.joystick.enabled = true
    this.touchButton.enabled = true
    this.touchButton2.enabled = true
};
ClassicUimanager.prototype.openDeathPanel = function (enabled) {
    if (enabled == false) {
        this.blackBackGround.enabled = enabled;
        this.deadMenu.enabled = enabled;
        this.app.deadMenuEnabled = enabled
        this.lowHPEffect.enabled = false
        this.app.fire("SdkGamePlay", false);

        return;
    }
    //this.app.fire("SdkGamePlay", true);
    if (this.app.marketPanel) {
        this.openMarket(false);
    }
    this.networkManager.setMenu(false);
    var color = { opacity: 0, blackOpacity: 0 };
    this.lowHPEffect.enabled = true
    this.lowHPEffect.element.opacity = 0;
    this.blackBackGround.enabled = enabled;
    this.blackBackGround.element.opacity = 0;
    this.app.deadMenuEnabled = enabled


    this.app
        .tween(color)
        .to({ opacity: 1, blackOpacity: 0.45 }, 0.5, pc.Linear)
        .onComplete(() => {
            this.deadMenu.enabled = enabled;
            this.deadMenu.setLocalScale(0, 0, 0)
            this.deadMenu
                .tween(this.deadMenu.getLocalScale())
                .to(new pc.Vec3(1, 1, 1), 0.5, pc.SineOut)
                .start();

        })
        .onUpdate(() => {
            this.lowHPEffect.element.opacity = color.opacity;
            this.blackBackGround.element.opacity = color.blackOpacity;
        })
        .start();


};
ClassicUimanager.prototype.postUpdate = function () {
    if (!this.app.currentBodyMaterial)
        if (Utils.getItem("RainbowObby_skinId")) {
            this.app.currentBodyMaterial = this.skinMaterials[Number.parseInt(Utils.getItem("RainbowObby_skinId"))];
        }
        else {
            this.app.currentBodyMaterial = this.skinMaterials[0].resource;
        }
    if (this.app.keyboard.wasPressed(pc.KEY_M)) {
        this.openMarket(!this.app.marketPanel);

    }
    if (!pc.Mouse.isPointerLocked()) {
        if (this.app.isMenu) {
            this.frameCalculator += 1;
        } else {
            this.frameCalculator = 0;
        }
    } else {
        this.frameCalculator = 0;
    }

    if (this.frameCalculator > 20) {
        this.frameCalculator = 0;
    }
}

