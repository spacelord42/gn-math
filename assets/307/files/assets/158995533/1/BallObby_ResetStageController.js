/*BallObbyResetStageController script that helps clearing local storage data by Emre Şahin - emolingo games */
var BallObbyResetStageController = pc.createScript('ballObbyResetStageController');

// initialize code called once per entity
BallObbyResetStageController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.ballObbyNetworkManager;
    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.app.fire("popupController:showPopup",
                "Reset stage", "Would you like to go the spawn?", true, this.app, "resetStageData", "closePopup");
        }
    }, this);
    this.entity.collision.on('triggerleave', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.app.fire("popupController:hidePopup");
        }
    }, this);
    this.app.on("resetStageData", this.resetStageData, this);
    this.on('destroy', function () {
        this.app.off("resetStageData", this.resetStageData, this);
    }, this);
};

BallObbyResetStageController.prototype.resetStageData = function () {
    this.app.ballCurrentStage = 0;
    this.networkManager.stageUIText.element.text = this.app.ballCurrentStage + 1;
    this.networkManager.stagePercentageText.text = ((this.app.ballCurrentStage + 1)) + "%";
    this.networkManager.stagePercentagePin.setLocalPosition(this.app.ballCurrentStage * 5.37, -40, 0);
    const targetStage = this.networkManager.stagesParent.children[this.app.ballCurrentStage];
    this.networkManager.playerController.ball.rigidbody.teleport(targetStage.getPosition().clone().add(targetStage.up));
    this.app.fire("resetStage");
};