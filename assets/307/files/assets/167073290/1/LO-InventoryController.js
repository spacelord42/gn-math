var LoInventoryController = pc.createScript('loInventoryController');
LoInventoryController.attributes.add("ballon", { type: "entity" })
LoInventoryController.attributes.add("rocket", { type: "entity" })

LoInventoryController.prototype.initialize = function () {
    this.rocket = this.entity.findByName("RocketModel");
    this.ballon = this.entity.findByName("BallonModel");
};
LoInventoryController.prototype.setItem = function (id) {
    console.log(id);
    if (id == 0) {
        this.ballon.enabled = true;
        this.rocket.enabled = false;
    }
    else if (id == 1) {
        this.ballon.enabled = false;
        this.rocket.enabled = true;
    }
};
LoInventoryController.prototype.clearItem = function (id) {
    if (id == 0)
        this.ballon.enabled = false;
    else if (id == 1)
        this.rocket.enabled = false;
};
