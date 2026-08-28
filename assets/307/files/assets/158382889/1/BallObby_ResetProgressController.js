/*BallObbyResetProgressController script that clears all the progress saved on local storage by Emre Şahin - emolingo games */
var BallObbyResetProgressController = pc.createScript('ballObbyResetProgressController');

// initialize code called once per entity
BallObbyResetProgressController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.ballObbyNetworkManager;
    /*
    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.app.fire("popupController:showPopup",
                "Delete progress", "Would you like to reset your progress?", true, this.app, "resetData", "closePopup");
        }
    }, this);
    this.entity.collision.on('triggerleave', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.app.fire("popupController:hidePopup");
        }
    }, this);*/
    this.app.on("resetData", this.resetData, this);
    this.on('destroy', function () {
        this.app.off("resetData", this.resetData, this);
    }, this);

};

BallObbyResetProgressController.prototype.resetData = async function () {
    if (this.networkManager.room)
        await this.networkManager.room.leave();

    this.app.ballElapsedTime = 0;
    BallObby_Utils.setItem("BALLOBBY_elapsedTime", 0);
    this.app.ballStopTimer = false;
    this.networkManager.musicPlayer.sound.stop("music");
    BallObby_Utils.clear();
    //var oldHierarchy = pc.app.root.findByName("Root");
    //oldHierarchy.destroy();
    //this.app.loadSceneHierarchy("1869105.json", function (err, parent) { });
    this.app.scenes.changeScene("BallObby");
};