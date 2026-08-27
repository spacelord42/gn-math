/*TeleportEvent script that teleports player on trigger by Burak Ersin - emolingo games */
var TeleportEvent = pc.createScript('teleportEvent');
TeleportEvent.attributes.add("teleportPoint", { type: "entity" });
TeleportEvent.attributes.add("eventName", { type: "string", default: "nan" });

TeleportEvent.prototype.initialize = function () {
    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);

};

// update code called every frame
TeleportEvent.prototype.onTriggerEnter = function (event) {
    if (event.rigidbody == null) return;
    event.rigidbody.teleport(this.teleportPoint.getPosition(), this.teleportPoint.getRotation());
    event.rigidbody.linearVelocity = pc.Vec3.ZERO;
    event.rigidbody.angularVelocity = pc.Vec3.ZERO;
    if (this.eventName != "nan") {
        this.app.fire(this.eventName);
    }
};