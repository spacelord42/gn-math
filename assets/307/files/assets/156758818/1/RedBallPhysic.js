/*RedBallPhysic script that triggers death mechanic on collision by Emre Şahin - emolingo games */
var RedBallPhysic = pc.createScript('redBallPhysic');
RedBallPhysic.attributes.add("spawnArea", { type: "entity" });
// initialize code called once per entity
RedBallPhysic.prototype.initialize = function () {
    this.entity.collision.on('collisionstart', this.onCollisionStart, this);
};

// update code called every frame
RedBallPhysic.prototype.update = function (dt) {
    if (this.entity.getPosition().y < 0) {
        let tempPos = this.spawnArea.getPosition().clone();
        tempPos.x += (Math.random() * 10) - 5;
        tempPos.z += (Math.random() * 10) - 5;
        this.entity.rigidbody.teleport(tempPos);
        this.entity.rigidbody.linearVelocity = new pc.Vec3();
    }
};

RedBallPhysic.prototype.onCollisionStart = function (result) {
    if (result.other) {
        if (result.other.tags.has("Player")) {
            const playerController = result.other.parent.script.playerController;
            if (playerController.totemEnabled == true) {
                playerController.removeTotem();
                this.entity.enabled = false;
            } else {
                result.other.parent.script.playerController.died();
            }
        }
    }
};