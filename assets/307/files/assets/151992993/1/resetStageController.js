/*BikeObby_ResetStageController script that helps clearing local storage data by Emre Şahin - emolingo games */
var BikeObby_ResetStageController = pc.createScript('resetStageController');

// initialize code called once per entity
BikeObby_ResetStageController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.networkManager;
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

BikeObby_ResetStageController.prototype.resetStageData = function () {
    this.app.currentStage = 0;
    const targetStage = this.networkManager.stagesParent.children[this.app.currentStage];
    this.networkManager.playerController.ball.rigidbody.teleport(targetStage.getPosition().clone().add(targetStage.up));
    this.app.fire("resetStage");
};