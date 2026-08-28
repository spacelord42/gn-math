var LoTeleferik = pc.createScript('loTeleferik');
LoTeleferik.attributes.add("playerStartCollision", { type: "entity" });
LoTeleferik.attributes.add("to", { type: "vec3" });

LoTeleferik.prototype.initialize = function () {
    this.playerStartCollision.collision.on("triggerenter", this.triggerEnter, this)
    this.isTriggered = false;
    this.player = null;
};

LoTeleferik.prototype.triggerEnter = function (event) {
    if (event.tags.has("Player")) {
        if (!this.isTriggered) {
            this.isTriggered = true;
            this.player = event
            this.isStart = true;
            this.toTween(event);
            event.rigidbody.type = "kinematic";
            this.entity.tags.clear();
        }
    }
};
LoTeleferik.prototype.update = function (dt) {
    if (this.isStart) {
        this.player.rigidbody.teleport(this.entity.getPosition().clone().add(new pc.Vec3(0, -6.7, 0)));
        this.player.script.loPlayerController._animComponent.setBoolean("isInAir", false)
        //this._animComponent.setBoolean("isInAir", false);

    }
};
LoTeleferik.prototype.toTween = function (entity) {
    this.entity
        .tween(this.entity.getLocalPosition())
        .to(this.to, 15.0, pc.SineInOut)
        .onComplete(() => {
            this.isStart = false;
            entity.rigidbody.type = "dynamic";
            this.playerStartCollision.destroy();
            this.entity.tags.add("Ground");
        })
        .start();
};
