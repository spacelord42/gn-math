/*TriggeredFakeGravity script that tweens player by provided parameters by Emre Şahin - emolingo games */
var TriggeredFakeGravity = pc.createScript('triggeredFakeGravity');


TriggeredFakeGravity.prototype.initialize = function () {
    this.entity.collision.on("collisionstart", this.collisionEnter, this);

};


TriggeredFakeGravity.prototype.collisionEnter = function (result) {
    if (!result.other.tags.has("Player")) return;

    let firstPosition = this.entity.getLocalPosition().clone();

    setTimeout(() => {
        if (!this.tween)
            this.tween = this.entity
                .tween(this.entity.getLocalPosition())
                .to(new pc.Vec3(firstPosition.x, -2000, firstPosition.z), 5, pc.Linear)
                .onComplete(() => {
                    setTimeout(() => {
                        this.tween = null;
                        this.entity.rigidbody.teleport(firstPosition);
                    }, 1000)
                })
                .start();
    }, 200)

};