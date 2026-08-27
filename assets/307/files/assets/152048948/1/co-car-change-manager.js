/*CoCarChangeManager script that changes car based on local storage by Burak Ersin - emolingo games */
var CoCarChangeManager = pc.createScript('coCarChangeManager');

CoCarChangeManager.attributes.add("carData", { type: "asset", assetType: "json" });

CoCarChangeManager.attributes.add("networkManager", { type: "entity" });

CoCarChangeManager.prototype.initialize = function () {
    this.data = this.carData.resource;
    this.speedManager = this.app.root.findByName("Player Speed Controller").script.coPlayerSpeedController;
    this.currentId = 0;
    this.changeCar(CoSaveSystem.getItem("CAROBBY_carID"), true);
    this.app.on("changeCar", this.changeCar, this);
    this.on("destroy", function () {
        this.app.off("changeCar", this.changeCar, this);
    }, this);
};

CoCarChangeManager.prototype.changeCar = function (id, start) {//yeni araba eklerken childlaradan 0. ya her zaman 
    // if (this.currentId == id) return;
    if (this.data[id.toString()] == undefined)
        id = 0;

    let collectedCars = JSON.parse(CoSaveSystem.getItem("CAROBBY_collectedCars"));
    let carFromCollectedCars = collectedCars[id];
    if (carFromCollectedCars.hasCar == false) {
        collectedCars[id].hasCar = true;
        CoSaveSystem.setItem("CAROBBY_collectedCars", JSON.stringify(collectedCars));
    }

    CoSaveSystem.setItem("CAROBBY_carID", id);

    var templateAsset = this.app.assets.get(this.data[id.toString()].carPhysicsAssetId);
    var player = this.networkManager.script.coNetworkManager.player.parent;

    const position = player._children[0].getPosition();
    const rotation = player._children[0].getRotation();
    player.destroy();
    var instance = templateAsset.resource.instantiate();
    this.app.root.addChild(instance);
    this.networkManager.script.coNetworkManager.player = instance._children[0];//positionunu networkten yollanacak bu
    this.currentId = id;
    if (start == null)
        instance._children[0].rigidbody.teleport(position, rotation);
    else {
        instance.script.coPlayer.initPosition();
    }

    this.speedManager.car = instance._children[0];
    this.speedManager.player = instance;

    this.networkManager.script.coNetworkManager.sendPacket("changeCar", { carId: id });

    this.app.fire("skill:nitroEnd");
    this.app.fire("skill:totemEnd");
};

CoCarChangeManager.prototype.changeClientCar = function (id, sessionId) {
    if (this.data[id.toString()] == undefined)
        id = 0;
    let templateAsset = this.app.assets.get(this.data[id.toString()].carClientAssetId);

    let instance = templateAsset.resource.instantiate();
    this.app.root.addChild(instance);
    this.networkManager.script.coNetworkManager.playerEntitys[sessionId].entity.destroy();
    this.networkManager.script.coNetworkManager.playerEntitys[sessionId].entity = instance;
};