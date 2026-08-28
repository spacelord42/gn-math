/*BallObbyDeadObject script that triggers death mechanic by Emre Şahin - emolingo games */
var BallObbyDeadObject = pc.createScript('ballObbyDeadObject');

// initialize code called once per entity
BallObbyDeadObject.prototype.initialize = function () {
    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            const playerController = otherEntity.parent.script.ballObbyPlayerController;
            if (playerController.totemEnabled == true) {
                playerController.removeTotem();
                this.entity.enabled = false;
            } else {
                playerController.died();
            }
        }
    }, this);
};