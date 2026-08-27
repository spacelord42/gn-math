var LoPowerUp = pc.createScript('loPowerUp');
LoPowerUp.attributes.add("ballon", { type: "boolean" });
LoPowerUp.attributes.add("rocket", { type: "boolean" });
LoPowerUp.attributes.add("tallLadder", { type: "boolean" });

LoPowerUp.prototype.initialize = function () {
    this.rewardedUI = this.app.root.findByName("Rewarded");
    this.rewardedButton = this.rewardedUI.findByName("RewardedAdButton")
    this.rewardedClose = this.rewardedUI.findByName("CloseButton")

    this.rewBallon = this.app.root.findByName("BaloonCoil")
    this.rewJetpack = this.app.root.findByName("JetpackCoil")
    this.rewLadder = this.app.root.findByName("LadderCoil")

    this.rewBallonText = this.rewBallon.findByName("Text");
    this.rewJetpackText = this.rewJetpack.findByName("Text");
    this.rewLadderText = this.rewLadder.findByName("Text");


    this.networkManager = this.app.root.findByName("NetworkManager").script.loNetworkManager;

    this.rewardedClose.button.on("click", this.rewardedPanelClose, this);

    this.entity.collision.on("triggerenter", this.triggerEnter, this);
    this.entity.collision.on("triggerexit", this.triggerExit, this);
    this.rewardedButton.button.on("click", this.rewarded, this);

    this.player = this.app.root.findByName("Player")

    this.current = false;
    this.maxTimer = 60
    this.timer = this.maxTimer;

    this.app.rocket = false;

    this.ballonImage = this.rewardedUI.findByName("BaloonImage")
    this.jetImage = this.rewardedUI.findByName("JetImage")
    this.ladderImage = this.rewardedUI.findByName("LadderImage")


    this.on("destroy", () => {
        this.rewardedClose.button.off("click", this.rewardedClose, this);
        this.rewardedButton.button.off("click", this.rewarded, this);

        //this.entity.collision.off("triggerenter", this.triggerEnter, this);
        //this.entity.collision.off("triggerexit", this.triggerExit, this);
    }, this)
};

LoPowerUp.prototype.triggerEnter = function (entity) {
    if (entity.tags.has("Player")) {
        this.rewardedPanelOpen();
        this.current = true;
        if (this.ballon) {

        }
        else if (this.rocket) {

        }
        else if (this.tallLadder) {
        }
    }
};

LoPowerUp.prototype.triggerExit = function (entity) {
};
LoPowerUp.prototype.rewardedPanelOpen = function () {
    this.rewardedUI.enabled = true;
    this.app.fire("openRandomPanel");
    this.allImageEnabled(false);
    if (this.ballon) {
        this.ballonImage.enabled = true;
    }
    else if (this.rocket) {
        this.jetImage.enabled = true;
    }
    else if (this.tallLadder) {
        this.ladderImage.enabled = true;
    }
}
LoPowerUp.prototype.rewardedPanelClose = function () {
    this.rewardedUI.enabled = false;
    this.app.fire("lo-closeButton", true);
    this.current = false;
}
LoPowerUp.prototype.rewarded = function () {
    if (!this.current) return;
    if (this.ballon) {
        this.rewBallon.enabled = true;
        this.rewBallonText.element.text = 60;

        this.app.isBallon = true;
        this.rewardedEnd("ballon");
        this.timer = this.maxTimer;
        this.player.script.loInventoryController.setItem(0);
        if (this.networkManager.room)
            this.networkManager.room.send("changePowerUp", { start: 0 });
    }
    else if (this.rocket) {
        this.rewJetpack.enabled = true;
        this.rewJetpackText.element.text = 60;

        this.timer = this.maxTimer;
        this.app.rocket = true;
        this.rewardedEnd("rocket")
        this.player.script.loInventoryController.setItem(1);
        if (this.networkManager.room)
            this.networkManager.room.send("changePowerUp", { start: 1 });
    }
    else if (this.tallLadder) {
        this.rewLadder.enabled = true;
        this.rewLadderText.element.text = 60;

        this.timer = this.maxTimer;
        this.rewardedEnd("tallLadder")
        this.app.fire("PowerUpTallLadder")
        if (this.networkManager.room)
            this.networkManager.room.send("changePowerUp", { start: 2 });
    }

};
LoPowerUp.prototype.rewardedEnd = function (end) {
    if (end == "ballon") {
        this.interval = setInterval(() => {

            if (this.timer == 0) {
                this.rewBallon.enabled = false;

                clearInterval(this.interval);
                this.app.isBallon = false;
                this.player.script.loInventoryController.clearItem(0);
                if (this.networkManager.room)
                    this.networkManager.room.send("changePowerUp", { end: 0 });

            }
            this.timer--;
            this.rewBallonText.element.text = this.timer;
        }, 1000)
    }
    else if (end == "rocket") {
        this.interval = setInterval(() => {
            if (this.timer == 0) {
                this.rewJetpack.enabled = false;

                clearInterval(this.interval);
                this.app.rocket = false;
                this.player.script.loInventoryController.clearItem(1);
                if (this.networkManager.room)
                    this.networkManager.room.send("changePowerUp", { end: 1 });

            }
            this.timer--;
            this.rewJetpackText.element.text = this.timer;

        }, 1000)
    }
    else if (end == "tallLadder") {
        this.interval = setInterval(() => {
            if (this.timer == 0) {
                this.rewLadder.enabled = false;


                clearInterval(this.interval);
                this.app.fire("NanTallLadder");
                if (this.networkManager.room)
                    this.networkManager.room.send("changePowerUp", { end: 2 });
            }
            this.timer--;
            this.rewLadderText.element.text = this.timer;
        }, 1000)
    }
};
LoPowerUp.prototype.allImageEnabled = function (enabled) {
    this.ballonImage.enabled = enabled;
    this.jetImage.enabled = enabled;
    this.ladderImage.enabled = enabled;
};