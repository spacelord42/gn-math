/*BallObbyStage script that handles checkpoint points placed on map by Emre Şahin - emolingo games */
var BikeObby_Stage = pc.createScript('stage');
BikeObby_Stage.attributes.add('stageNumber', { type: 'number', default: 0 });
BikeObby_Stage.attributes.add('worldNumber', { type: 'number', default: 1 });
// initialize code called once per entity
BikeObby_Stage.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.networkManager;
    this.stageNumber = this.stageNumber + (this.worldNumber - 1) * 100;
    this.circle = this.entity.children[0];
    this.flag = this.entity.children[1].children[1];
    this.flagMeshInstance = this.flag.render.meshInstances[0];
    this.circleMeshInstance = this.circle.render.meshInstances[0];
    if ((this.app.currentStage >= this.stageNumber && this.app.currentStage > 0) || this.stageNumber === 0) {
        this.complete(true);
    }

    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.complete();
        }
    }, this);

    this.app.on("resetStage", this.resetStage, this);
    this.on('destroy', function () {
        this.app.off("resetStage", this.resetStage, this);
    }, this);
};

BikeObby_Stage.prototype.complete = function (noTween) {
    if (this.completed) return;
    if (noTween != true) {
        this.flag.tween(this.flag.getLocalEulerAngles()).rotate({ x: -90, y: -90, z: 0 }, 0.2, pc.Linear).start();
        this.app.currentStage = this.stageNumber;
        BikeObby_Utils.setItem("BIKEOBBY_currentStage", this.stageNumber);
        this.networkManager.increaseStage();
    }
    this.flagMeshInstance.material = this.networkManager.stageMats[1].resource;
    this.circleMeshInstance.material = this.networkManager.stageMats[3].resource;
    this.completed = true;
};


BikeObby_Stage.prototype.resetStage = function () {
    this.flag.tween(this.flag.getLocalEulerAngles()).rotate({ x: -90, y: 90, z: 0 }, 0.2, pc.Linear).start();
    this.flagMeshInstance.material = this.networkManager.stageMats[0].resource;
    this.circleMeshInstance.material = this.networkManager.stageMats[2].resource;
    this.completed = false;
};