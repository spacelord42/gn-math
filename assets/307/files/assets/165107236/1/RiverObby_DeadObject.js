var RiverObbyDeadObject = pc.createScript('riverObbyDeadObject');

// initialize code called once per entity
RiverObbyDeadObject.prototype.initialize = function () {
    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            const playerController = otherEntity.script.riverObbyPlayerController;
            if (playerController.totemEnabled == true) {
                playerController.removeTotem();
                this.entity.enabled = false;
            } else {
                playerController.died();
            }
        }
    }, this);
};