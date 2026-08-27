var RiverObbyCheckpoint = pc.createScript('riverObbyCheckpoint');

// initialize code called once per entity
RiverObbyCheckpoint.prototype.initialize = function () {
    this.riverObbyNetworkManager = this.app.root.findByName("NetworkManager").script.riverObbyNetworkManager;
    this.stageNumber = this.entity.parent.children.indexOf(this.entity);
    this.flag = this.entity.children[0].children[0];
    this.flagMeshInstance = this.flag.render.meshInstances[0];

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

RiverObbyCheckpoint.prototype.complete = function (noTween) {
    if (this.completed) return;
    if (noTween != true) {
        this.flag.tween(this.flag.getLocalEulerAngles()).rotate({ x: 0, y: 0, z: 180 }, 0.2, pc.Linear).start();
        this.riverObbyNetworkManager.increaseStage(this.stageNumber);
    }
    this.flagMeshInstance.material = this.riverObbyNetworkManager.stageMats[1].resource;
    this.completed = true;
};

RiverObbyCheckpoint.prototype.resetStage = function () {
    this.flag.tween(this.flag.getLocalEulerAngles()).rotate({ x: 0, y: 0, z: 180 }, 0.2, pc.Linear).start();
    this.flagMeshInstance.material = this.riverObbyNetworkManager.stageMats[0].resource;
    this.completed = false;
};