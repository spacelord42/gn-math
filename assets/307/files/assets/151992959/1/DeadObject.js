/*BikeObby_DeadObject script that triggers death mechanic by Emre Şahin - emolingo games */
var BikeObby_DeadObject = pc.createScript('deadObject');

// initialize code called once per entity
BikeObby_DeadObject.prototype.initialize = function () {
    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            const playerController = otherEntity.parent.script.playerController;
            if (playerController.totemEnabled == true) {
                playerController.removeTotem();
                this.entity.enabled = false;
            } else {
                otherEntity.parent.script.playerController.died();
            }
        }
    }, this);
};