/*BallObbyStage script that handles checkpoint points placed on map by Emre Şahin - emolingo games */
var BallObbyStage = pc.createScript('ballObbyStage');
BallObbyStage.attributes.add("greenMaterial", { type: "asset", assetType: "material" })
BallObbyStage.attributes.add("greenCircleMaterial", { type: "asset", assetType: "material" })
BallObbyStage.attributes.add("dirK", { type: "boolean" })
BallObbyStage.attributes.add("dirM", { type: "boolean" })
BallObbyStage.attributes.add("dirRK", { type: "boolean" })
BallObbyStage.attributes.add("dirRM", { type: "boolean" })
// initialize code called once per entity
BallObbyStage.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.ballObbyNetworkManager;
    this.app.on("resetStage", this.resetStage, this);
    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    var inputString = this.entity.name;
    var match = inputString.match(/Stage(\d+)/);

    if (match) {
        var number = parseInt(match[1], 10);
        this.stageValue = number - 1;
    }


    this.on('destroy', function () {
        this.app.off("resetStage", this.resetStage, this);
    }, this);

    if ((this.app.ballCurrentStage >= this.stageValue && this.app.ballCurrentStage > 0) || this.stageValue === 0) {
        this.complete(true);
        return;
    }

    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
};

BallObbyStage.prototype.onTriggerEnter = function (results) {
    if (results.tags.has("Player")) {
        if (this.completed) return;
        console.log("onTriggerEnter", this.stageValue)
        this.app.ballCurrentStage = this.stageValue;
        this.networkManager.stageUIText.element.text = this.app.ballCurrentStage + 1;
        this.networkManager.stagePercentageText.text = ((this.app.ballCurrentStage + 1)) + "%";
        this.networkManager.stagePercentagePin.setLocalPosition(this.app.ballCurrentStage * 5.37, -40, 0);
        this.complete();
        BallObby_Utils.setItem("BALLOBBY_currentStage", this.app.ballCurrentStage);
        if (this.networkManager.playerController.playerModel)
            this.networkManager.playerController.playerModel.sound.play("checkpoint");
        if (this.app.ballCurrentStage === 99 || this.app.ballCurrentStage === 199) {
            if (this.app.ballCurrentStage === 99)
                this.app.ballStopTimer = true;
            this.networkManager.endConfetti.play();
            setTimeout(() => {
                if (this.networkManager.endConfetti)
                    this.networkManager.endConfetti.stop();
            }, 15000);
        }
    }
};

BallObbyStage.prototype.complete = function (noTween) {
    if (this.completed) return;
    const flag = this.entity.children[1].children[1];
    const circle = this.entity.children[0];
    circle.render.meshInstances[0].material = this.greenCircleMaterial.resource;
    flag.render.meshInstances[0].material = this.greenMaterial.resource;
    if (noTween != true) {
        flag.tween(flag.getLocalEulerAngles()).rotate({ x: -90, y: -270, z: 0 }, 0.2, pc.Linear).start();
    }
    if (this.app.ballCurrentStage < this.stageValue) {
        this.app.ballCurrentStage = this.stageValue;
    }
    this.completed = true;
};

BallObbyStage.prototype.resetStage = function () {
    const flag = this.entity.children[1].children[1];
    const circle = this.entity.children[0];
    circle.render.meshInstances[0].material = this.networkManager.redCircleMaterial.resource;
    flag.render.meshInstances[0].material = this.networkManager.redMaterial.resource;
    flag.tween(flag.getLocalEulerAngles()).rotate({ x: -90, y: -270, z: 0 }, 0.2, pc.Linear).start();
    this.completed = false;
};