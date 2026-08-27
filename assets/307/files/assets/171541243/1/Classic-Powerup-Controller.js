/*ClassicPowerupController script that handles all powerup interactions and mechanics by Emre Şahin - emolingo games */
var ClassicPowerupController = pc.createScript('classicPowerupController');
ClassicPowerupController.attributes.add("rocket", { type: "entity" });
ClassicPowerupController.attributes.add("totem", { type: "entity" });
ClassicPowerupController.attributes.add("spring", { type: "entity" });
ClassicPowerupController.attributes.add("speedShoe", { type: "entity" });
ClassicPowerupController.attributes.add("speedShoe1", { type: "entity" });

ClassicPowerupController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.classicNetworkManager;

    this.isRocket = false;
    this.isSpeedShoe = false;
    this.isSpring = false;
    this.app.totem = false;

    this.powerUpPanel = this.app.root.findByName("Rewarded")
    this.coilImage = this.app.root.findByName("CoilImage")
    this.jetImage = this.app.root.findByName("JetImage")
    this.totemImage = this.app.root.findByName("TotemImage")
    this.bootsImage = this.app.root.findByName("BootsImage")

    this.jetpackPowerUI = this.app.root.findByName("JetpackPower")
    this.jumpCoilPowerUI = this.app.root.findByName("JumpCoilPower")
    this.speedBootsPowerUI = this.app.root.findByName("SpeedBootsPower")

    this.rewardedTitleText = this.powerUpPanel.findByName("TitleText")

    this.entity.on("triggerenter", this.trigger, this);
    this.currentItem = "Rocket";

    this.app.on("rewardedClose", this.closeRewarded, this);
    this.app.on("UseTotem", this.useTotem, this);
    this.app.on("GetAdsRewarded", this.showAds, this);
    this.on("destroy", () => {
        this.app.off("rewardedClose", this.closeRewarded, this);
        this.app.off("UseTotem", this.useTotem, this);
        this.app.off("GetAdsRewarded", this.showAds, this);
    }, this);
};
ClassicPowerupController.prototype.useTotem = function (entity) {
    if (this.networkManager.room) {
        this.networkManager.room.send("hasTotemOfUndying", false);
    }
    this.app.totem = false;
    this.totem.enabled = false;
};
ClassicPowerupController.prototype.trigger = function (entity) {
    if (entity.tags.has("Rocket")) {
        this.openRewarded(this.jetImage);
        this.currentItem = "Rocket";
        this.rewardedTitleText.element.text = "Rocket";
    }
    else if (entity.tags.has("Totem")) {
        this.openRewarded(this.totemImage);
        this.currentItem = "Totem";
        this.rewardedTitleText.element.text = "Totem";
    }
    else if (entity.tags.has("Boots")) {
        this.openRewarded(this.bootsImage);
        this.currentItem = "Boots";
        this.rewardedTitleText.element.text = "Boots";
    }
    else if (entity.tags.has("JumpCoil")) {
        this.openRewarded(this.coilImage);
        this.currentItem = "JumpCoil";
        this.rewardedTitleText.element.text = "Jump Coil";
    }
};

ClassicPowerupController.prototype.showAds = function () {
    PokiSDK.rewardedBreak({
        size: "small",
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
            this.getItem();
        } else {

        }
    });
};

ClassicPowerupController.prototype.getItem = function () {
    this.closeRewarded();
    if (this.currentItem == "Rocket") {
        this.rocket.enabled = true;
        this.app.rocket = true;
        this.rocketFuel = 100;
        this.jetpackPowerUI.enabled = true
        this.jetpackPowerUI.children[0].element.text = "100%";

        if (this.networkManager.room) {
            this.networkManager.room.send("hasJetpack", true);
        }

        /*
        if (this.rocketInterval) {
            clearInterval(this.rocketInterval);
        }
        this.rocketInterval = setInterval(() => {
            time--;
            this.jetpackPowerUI.children[0].element.text = time + "/15";
            if (time <= 0) {
                if (this.networkManager.room) {
                    this.networkManager.room.send("hasJetpack", false);
                }
                this.app.rocket = false
                this.jetpackPowerUI.enabled = false;
                this.rocket.enabled = false;
            }
        }, 1000)*/
    }
    else if (this.currentItem == "Totem") {
        if (this.networkManager.room) {
            this.networkManager.room.send("hasTotemOfUndying", true);
        }
        this.app.totem = true;
        this.totem.enabled = true;
    }
    else if (this.currentItem == "Boots") {
        this.speedShoe.enabled = true;
        this.speedShoe1.enabled = true;
        this.entity.script.classicCharacterController.moveSpeed = 10;
        let time = 30;

        if (this.networkManager.room) {
            this.networkManager.room.send("hasSpeedBoots", true);
        }

        this.speedBootsPowerUI.enabled = true
        this.speedBootsPowerUI.children[0].element.text = time;
        if (this.bootsInterval) {
            clearInterval(this.bootsInterval);
        }
        this.bootsInterval = setInterval(() => {
            time--;
            this.speedBootsPowerUI.children[0].element.text = time + "/30";
            if (time <= 0) {
                if (this.networkManager.room) {
                    this.networkManager.room.send("hasSpeedBoots", false);
                }

                this.entity.script.classicCharacterController.moveSpeed = 6;
                clearInterval(this.bootsInterval);
                this.speedShoe.enabled = false;
                this.speedBootsPowerUI.enabled = false;
                this.speedShoe1.enabled = false;
            }
        }, 1000)
    }
    else if (this.currentItem == "JumpCoil") {
        let time = 30;

        if (this.networkManager.room) {
            this.networkManager.room.send("hasJumpCoil", true);
        }

        this.jumpCoilPowerUI.enabled = true
        this.jumpCoilPowerUI.children[0].element.text = time;
        this.app.isBallon = true
        this.spring.enabled = true
        if (this.coilInterval) {
            clearInterval(this.coilInterval);
        }
        this.coilInterval = setInterval(() => {
            time--;
            this.jumpCoilPowerUI.children[0].element.text = time + "/30";
            if (time <= 0) {
                if (this.networkManager.room) {
                    this.networkManager.room.send("hasJumpCoil", false);
                }

                clearInterval(this.coilInterval);
                this.jumpCoilPowerUI.enabled = false
                this.app.isBallon = false;
                this.spring.enabled = false;
            }
        }, 1000)
    }
};
ClassicPowerupController.prototype.update = function (dt) {
    if (this.app.usingRocket) {
        this.rocketFuel -= dt * 15
        this.jetpackPowerUI.children[0].element.text = Math.floor(this.rocketFuel) + "%";

        if (this.rocketFuel <= 0) {
            if (this.networkManager.room) {
                this.networkManager.room.send("hasJetpack", false);
            }
            this.app.rocket = false
            this.jetpackPowerUI.enabled = false;
            this.rocket.enabled = false;
        }
    }
};
ClassicPowerupController.prototype.openRewarded = function (entity) {
    if (this.app.deadMenuEnabled || this.app.marketPanel) return
    this.app.rewardedPanelEnabled = true;
    this.powerUpPanel.enabled = true;
    entity.enabled = true;
    this.app.fire("lockCamera", true);
    this.app.fire("SdkGamePlay", false);
};
ClassicPowerupController.prototype.closeRewarded = function () {
    this.app.rewardedPanelEnabled = false;
    this.powerUpPanel.enabled = false;
    this.app.fire("lockCamera", false);

    //this.app.fire("SdkGamePlay", true);

    this.coilImage.enabled = false;
    this.jetImage.enabled = false;
    this.totemImage.enabled = false;
    this.bootsImage.enabled = false;
};