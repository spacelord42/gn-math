/*CoBuyArea script that triggers clear data event by Burak Ersin - emolingo games */
var CoClearDataArea = pc.createScript('coClearDataArea');

CoClearDataArea.prototype.initialize = function () {
    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    this.entity.collision.on('triggerleave', this.onTriggerExit, this);
};

CoClearDataArea.prototype.onTriggerEnter = function (entity) {
    if (entity.tags.has("player") == false)
        return;
    this.app.fire("openSound:joinArea");
    this.app.fire("coUiManager:openClearDataScreen");
};

CoClearDataArea.prototype.onTriggerExit = function (entity) {
    if (entity.tags.has("player") == false)
        return;

    this.app.fire("coUiManager:openGameScreen");
};