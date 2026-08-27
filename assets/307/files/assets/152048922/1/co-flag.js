/*CoFlag script that handles checkpoint points placed on map by Emre Şahin - emolingo games */
var CoFlag = pc.createScript('coFlag');
CoFlag.attributes.add("flagEntity", { type: "entity" });
CoFlag.attributes.add("circleEntity", { type: "entity" });
CoFlag.attributes.add("redMaterial", { type: "asset", assetType: "material" });
CoFlag.attributes.add("greenMaterial", { type: "asset", assetType: "material" });

CoFlag.prototype.initialize = function () {
    this.checkPointID = parseInt(this.entity.clone().name.replace("Flag ", "")) + 1;
    this.isRotated = false;

    if (CoSaveSystem.getItem("CAROBBY_stage") * 1 >= this.checkPointID) {
        this.setRotationAsDefault();
    }

    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
};

CoFlag.prototype.onTriggerEnter = function (entity) {
    if (CoSaveSystem.getItem("CAROBBY_stage") * 1 >= this.checkPointID && this.isRotated == false) {
        this.setRotationAsDefault();
        return;
    }

    if (CoSaveSystem.getItem("CAROBBY_stage") * 1 != this.checkPointID - 1)
        return;

    //CarADSSHOW
    /*
    let commercialBreakCounter = Date.now();
    PokiSDK.commercialBreak(() => {
        this.app.systems.sound.volume = 0;
    }).then(() => {
        this.app.isWatchingAd = false;
        if (Date.now() - commercialBreakCounter > 1000) {
            gameanalytics.GameAnalytics.addAdEvent(
                gameanalytics.EGAAdAction.Show,
                gameanalytics.EGAAdType.Interstitial,
                "poki",
                "carObby"
            );
        }
        this.app.systems.sound.volume = 1;
    });
    */

    this.app.fire("openSound:flag");
    this.isRotated = true;
    this.flagEntity.tween(this.flagEntity.getLocalEulerAngles()).rotate({ x: -90, y: 180, z: 0 }, 0.2, pc.Linear)
        .onComplete(function () {
            this.circleEntity.element.color = pc.Color.GREEN;
            this.flagEntity.render.meshInstances[0].material = this.greenMaterial.resources[0];
            CoSaveSystem.setItem("CAROBBY_stage", this.checkPointID);
            this.app.fire("changedStage");
            this.app.fire("StageCompleted");
        }.bind(this)).start();
};

CoFlag.prototype.setRotationAsDefault = function () {
    if (this.isRotated)
        return;

    this.flagEntity.rotate(new pc.Vec3(0, 180, 0));
    this.circleEntity.element.color = pc.Color.GREEN;
    this.flagEntity.render.meshInstances[0].material = this.greenMaterial.resources[0];
    this.isRotated = true;
};