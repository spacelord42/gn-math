/*BikeObby_RewardedPopupController script that handles rewarded popup interactions by Emre Şahin - emolingo games */
var BikeObby_RewardedPopupController = pc.createScript('rewardedPopupController');
BikeObby_RewardedPopupController.attributes.add('rewardedPanel', { type: 'entity' });
BikeObby_RewardedPopupController.attributes.add('title', { type: 'entity' });
BikeObby_RewardedPopupController.attributes.add('button', { type: 'entity' });
BikeObby_RewardedPopupController.attributes.add('type', { type: 'number' });
BikeObby_RewardedPopupController.attributes.add('closeButton', { type: 'entity' });
BikeObby_RewardedPopupController.attributes.add('images', { type: 'entity', array: true });
// initialize code called once per entity
BikeObby_RewardedPopupController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.networkManager;
    this.selectedRewarded = false;
    this.activeIndex = 0;

    this.button.button.on('click', function (event) {
        if (this.selectedRewarded == false) return;

        this.app.isWatchingAd = true;

        PokiSDK.rewardedBreak({
            size: "small",
            onStart: () => {
                this.app.systems.sound.volume = 0;
            }
        }).then((success) => {
            this.app.systems.sound.volume = 1;
            this.app.isWatchingAd = false;
            if (success) {
                if (this.type === 0) {
                    this.networkManager.playerController.enableJumpCoil();
                } else if (this.type === 1) {
                    this.networkManager.playerController.enableTotem();
                } else if (this.type === 2) {
                    this.networkManager.playerController.enableJetpack();
                } else if (this.type === 3) {
                    this.networkManager.buyBike(1, 0);
                } else if (this.type === 4) {
                    this.networkManager.buyBike(2, 0);
                } else if (this.type === 5) {
                    this.networkManager.buyBike(4, 0);
                } else if (this.type === 6) {
                    this.networkManager.buyBike(6, 0);
                } else if (this.type === 7) {
                    this.networkManager.buyBike(7, 0);
                }
                this.networkManager.playerController.playerModel.sound.play("prize");

                gameanalytics.GameAnalytics.addAdEvent(
                    gameanalytics.EGAAdAction.Show,
                    gameanalytics.EGAAdType.RewardedVideo,
                    "poki",
                    "BikeObby"
                );
            }
            this.closeButton.button.fire('click');
        });
    }, this);

    this.closeButton.button.on('click', function (event) {
        if (this.rewardedPanel.enabled) {
            this.setTween();
        }
    }, this);

    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.networkManager.playerController.playerModel.sound.play("popup");
            this.setTween();
        }
    }, this);
    this.entity.collision.on('triggerleave', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.closeButton.button.fire('click');
        }
    }, this);
};

BikeObby_RewardedPopupController.prototype.setTween = function () {
    if (this.app.isMarketEnabled || this.app.isPopupEnabled || (this.networkManager.menuPanel.enabled == false && this.networkManager.playerController.isDied)) return;

    if (this.rewardedPanelTween)
        this.rewardedPanelTween.stop();

    if (this.rewardedPanel.enabled == false) {
        this.selectedRewarded = true;
        this.app.fire("lockCamera", true);
        this.rewardedPanel.enabled = true;
        this.app.isRewardedPopupEnabled = true;
        this.app.mouse.disablePointerLock();
        this.rewardedPanel.setLocalScale(new pc.Vec3(0.5, 0.5, 0.5));
        this.rewardedPanelTween = this.rewardedPanel
            .tween(this.rewardedPanel.getLocalScale()).to(new pc.Vec3(0.805, 0.805, 0.805), 0.2, pc.SineOut)
            .onComplete(() => {
                this.rewardedPanelTween = null;
            })
            .start();
        this.networkManager.blackBackground.enabled = true;
        this.data = { value: 0 };
        this.networkManager.blackBackground
            .tween(this.data).to({ value: 0.75 }, 0.2, pc.SineOut)
            .onUpdate((dt) => {
                this.networkManager.blackBackground.element.opacity = this.data.value;
            })
            .start();

        for (let i = 0; i < this.images.length; i++) {
            this.images[i].enabled = false;
        }
        if (this.type === 0) {
            this.title.element.text = "Jump Coil";
            this.images[0].enabled = true;
            this.activeIndex = 0;
        } else if (this.type === 1) {
            this.title.element.text = "Totem";
            this.images[1].enabled = true;
            this.activeIndex = 1;
        } else if (this.type === 2) {
            this.title.element.text = "Jetpack";
            this.images[2].enabled = true;
            this.activeIndex = 2;
        } else if (this.type === 3) {
            this.title.element.text = "Rare Bike";
            this.images[3].enabled = true;
            this.activeIndex = 3;
        } else if (this.type === 4) {
            this.title.element.text = "Jump Bike";
            this.images[4].enabled = true;
            this.activeIndex = 4;
        } else if (this.type === 5) {
            this.title.element.text = "Big Bike";
            this.images[5].enabled = true;
            this.activeIndex = 5;
        } else if (this.type === 6) {
            this.title.element.text = "Motorcycle";
            this.images[6].enabled = true;
            this.activeIndex = 6;
        } else if (this.type === 7) {
            this.title.element.text = "RACE CAR";
            this.images[7].enabled = true;
            this.activeIndex = 7;
        }
    } else {
        if (this.activeIndex)
            this.images[this.activeIndex].enabled = false;
        this.selectedRewarded = false;
        this.app.isRewardedPopupEnabled = false;
        this.rewardedPanel.setLocalScale(new pc.Vec3(0.805, 0.805, 0.805));
        this.rewardedPanelTween = this.rewardedPanel
            .tween(this.rewardedPanel.getLocalScale()).to(new pc.Vec3(0.5, 0.5, 0.5), 0.1, pc.SineIn)
            .onComplete(() => {
                this.rewardedPanel.enabled = false;
                this.rewardedPanelTween = null;
            })
            .start();
        if (this.networkManager.playerController.isDied == false) {
            this.data = { value: 0.75 };
            this.networkManager.blackBackground
                .tween(this.data).to({ value: 0 }, 0.1, pc.SineOut)
                .onUpdate((dt) => {
                    this.networkManager.blackBackground.element.opacity = this.data.value;
                })
                .onComplete(() => {
                    this.networkManager.blackBackground.enabled = false;
                })
                .start();
        }
    }
};