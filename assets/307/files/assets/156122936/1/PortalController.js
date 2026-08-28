/*PortalController script that handles portals that change map section by Emre Şahin - emolingo games */
var PortalController = pc.createScript('portalController');
PortalController.attributes.add('worldNumber', { type: 'number', default: 2 });

// initialize code called once per entity
PortalController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.networkManager;
    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.app.currentStage = 100;
            BikeObby_Utils.setItem("BIKEOBBY_currentStage", this.app.currentStage);
            this.networkManager.loadLocalStorageData();
            const targetStage = this.networkManager.stagesParent.children[0];
            this.networkManager.playerController.ball.rigidbody.teleport(targetStage.getPosition().clone().add(targetStage.up));
        }
    }, this);
};