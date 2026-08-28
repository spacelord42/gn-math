/*CoGameManager script that controls the death and respawn mechanics by Burak Ersin - emolingo games */
var CoGameManager = pc.createScript('coGameManager');
CoGameManager.attributes.add("nitroParent", { type: "entity" });
CoGameManager.attributes.add("totemParent", { type: "entity" });
CoGameManager.attributes.add("nitroText", { type: "entity" });

CoGameManager.prototype.initialize = function () {
    this.isPlayerDied = false;
    this.networkManager = this.app.root.findByName("Network Manager").script.coNetworkManager;
    //this.app.fire("changeCar", CoSaveSystem.getItem("CAROBBY_carID"));
    this.app.on("playerDied", this.onPlayerDied, this);
    this.app.on("playerRespawned", this.onPlayerRespawned, this);
    this.app.on("StageCompleted", this.stageCompleted, this);

    this.on('destroy', function () {
        this.app.off("playerDied", this.onPlayerDied, this);
        this.app.off("playerRespawned", this.onPlayerRespawned, this);
        this.app.off("StageCompleted", this.stageCompleted, this);
    }, this)
};

CoGameManager.prototype.onPlayerDied = function () {
    if (this.isPlayerDied)
        return;

    this.isPlayerDied = true;
    this.networkManager.sendPacket("isDead", { isdead: true });
    CoSaveSystem.setItem("CAROBBY_deathCount", (CoSaveSystem.getItem("CAROBBY_deathCount") * 1) + 1);
    this.app.fire("changedDeathCount");
    this.app.fire("listen:isDie", this.isPlayerDied);
};

CoGameManager.prototype.onPlayerRespawned = function () {
    this.isPlayerDied = false;
    this.networkManager.sendPacket("isDead", { isdead: false });
    this.app.fire("listen:isDie", this.isPlayerDied);
};

CoGameManager.prototype.stageCompleted = function () {
    if (CoSaveSystem.getItem("CAROBBY_stage") >= 100) {
        let collectedCars = JSON.parse(CoSaveSystem.getItem("CAROBBY_collectedCars"));

        for (let i = 0; i < collectedCars.length; i++) {
            collectedCars[i].hasCar = true;
        }

        CoSaveSystem.setItem("CAROBBY_collectedCars", JSON.stringify(collectedCars));
    }
};