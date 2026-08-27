var RiverObbySpeedArea = pc.createScript('riverObbySpeedArea');
RiverObbySpeedArea.attributes.add("boost", { type: "number", default: 1 });
// initialize code called once per entity
RiverObbySpeedArea.prototype.initialize = function () {
    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.player = otherEntity;
            this.firstVelo = this.player.rigidbody.linearVelocity.clone();
            this.app.targetFov = 60 + this.boost;
        }
    }, this);
    this.entity.collision.on('triggerleave', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.player.rigidbody.linearVelocity = this.firstVelo.add(this.player.rigidbody.linearVelocity.mulScalar(1 / 3));
            this.player = null;
            this.app.targetFov = 60;
        }
    }, this);
};

RiverObbySpeedArea.prototype.update = function (dt) {
    if (this.player) {
        this.player.rigidbody.applyForce(this.entity.forward.mulScalar(this.boost));
    }
};