var RiverObbyPlayerInventoryController = pc.createScript('riverObbyPlayerInventoryController');
RiverObbyPlayerInventoryController.attributes.add("boats", { type: "entity", array: true });

RiverObbyPlayerInventoryController.prototype.initialize = function () {
    this.boatsInHandParent = this.boats[0].parent;
    this.activeBoat = 0;
};

RiverObbyPlayerInventoryController.prototype.setItem = function (newBoat) {
    this.boats.forEach(item => {
        item.enabled = false;
    });
    this.boats[newBoat].enabled = true;
    this.activeBoat = newBoat;
};