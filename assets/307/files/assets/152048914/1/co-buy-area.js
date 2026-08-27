/*CoBuyArea script that triggers and controls rewarded items by Burak Ersin - emolingo games */
var CoBuyArea = pc.createScript('coBuyArea');
CoBuyArea.attributes.add('carID', { type: 'number', default: 0 });
CoBuyArea.attributes.add('skillTemplates', { type: 'asset', assetType: "template", array: true });
CoBuyArea.attributes.add('carTemplates', { type: 'asset', assetType: "template", array: true });
CoBuyArea.attributes.add('skillsParent', { type: 'entity' });
CoBuyArea.attributes.add('carsParent', { type: 'entity' });

CoBuyArea.prototype.initialize = function () {
    this.canInteract = true;
    this.isSkill = false;
    if (this.carID == 0)
        this.isSkill = parseInt(pc.math.random(0, 100)) > 50;

    if (this.isSkill) {
        this.skillID = parseInt(pc.math.random(0, 2));

        spawnedSkill = this.skillTemplates[this.skillID].resource.instantiate();
        this.skillsParent.addChild(spawnedSkill);
    } else {
        if (this.carID == 0)
            this.carID = parseInt(pc.math.random(1, 9));

        spawnedCar = this.carTemplates[this.carID - 1].resource.instantiate();
        this.carsParent.addChild(spawnedCar);
    }

    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    this.entity.collision.on('triggerleave', this.onTriggerExit, this);
    this.app.on("changedCar", this.changeCar, this);

    this.on('destroy', function () {
        this.app.off("changedCar", this.changeCar, this);
    }, this);

};
CoBuyArea.prototype.changeCar = function (entity) {
    this.canInteract = false;
    setTimeout(() => { this.canInteract = true; }, 1000);
};
CoBuyArea.prototype.onTriggerEnter = function (entity) {
    if (this.canInteract == false)
        return;

    if (entity.tags.has("player") == false)
        return;

    this.app.fire("openSound:joinArea");

    if (this.isSkill) {
        if (this.skillID == 0) {
            this.app.fire("coUiManager:openTakeNitroSkillScreen");
        } else if (this.skillID == 1) {
            this.app.fire("coUiManager:openTakeTotemSkillScreen");
        }
    } else {
        this.app.fire("coUiManager:openCarBuyScreen", this.carID);
    }
};

CoBuyArea.prototype.onTriggerExit = function (entity) {
    if (entity.tags.has("player") == false)
        return;

    this.app.fire("coUiManager:openGameScreen", this.carID);
};