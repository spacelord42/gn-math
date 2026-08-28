/*BallObbyRedBall script that triggers death mechanic on collision by Emre Şahin - emolingo games */
var BallObbyRedBall = pc.createScript('ballObbyRedBall');
BallObbyRedBall.attributes.add("spawnArea", { type: "entity" });

// initialize code called once per entity
BallObbyRedBall.prototype.initialize = function () {
    this.entity.collision.on('collisionstart', this.onCollisionStart, this);
};

// update code called every frame
BallObbyRedBall.prototype.update = function (dt) {
    if (this.entity.getLocalPosition().y < -6386) {
        let tempPos = this.spawnArea.getPosition().clone();
        tempPos.x += (Math.random() * 10) - 5;
        tempPos.z += (Math.random() * 10) - 5;
        this.entity.rigidbody.teleport(tempPos);
        this.entity.rigidbody.linearVelocity = new pc.Vec3();
    }
};

BallObbyRedBall.prototype.onCollisionStart = function (result) {
    if (result.other) {
        if (result.other.tags.has("Player")) {
            const playerController = result.other.parent.script.ballObbyPlayerController;
            if (playerController.totemEnabled == true) {
                playerController.removeTotem();
                this.entity.enabled = false;
            } else {
                playerController.died();
            }
        }
    }
};