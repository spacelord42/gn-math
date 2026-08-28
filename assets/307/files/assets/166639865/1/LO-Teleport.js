var LoTeleport = pc.createScript('loTeleport');
LoTeleport.attributes.add("stageManagerEntity", { type: "entity" });

LoTeleport.prototype.initialize = function () {
    this.stageManager = this.stageManagerEntity.script.loStageTrigger;
    this.entity.collision.on("triggerenter", this.trigger, this);
};

LoTeleport.prototype.trigger = function (entity) {
    //this.stageManager.stagePoints[this.app.currentStage].
    if (entity.tags.has("Player"))
        this.stageManager.player.rigidbody.teleport(this.stageManager.stagePoints[this.app.currentStage].getPosition().clone());
    if (entity.tags.has("Ladder"))
        this.stageManager.ladder.rigidbody.teleport(this.stageManager.stagePoints[this.app.currentStage].getPosition().clone().add(new pc.Vec3(1.250, 0.189, 0, 0.645)))

};