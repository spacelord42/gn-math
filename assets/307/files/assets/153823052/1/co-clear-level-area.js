/*CoBuyArea script that triggers clear level event by Burak Ersin - emolingo games */
var CoClearLevelArea = pc.createScript('coClearLevelArea');

CoClearLevelArea.prototype.initialize = function () {
    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    this.entity.collision.on('triggerleave', this.onTriggerExit, this);
};

CoClearLevelArea.prototype.onTriggerEnter = function (entity) {
    if (entity.tags.has("player") == false)
        return;

    this.app.fire("openSound:joinArea");

    this.app.fire("coUiManager:openClearLevelScreen");
};

CoClearLevelArea.prototype.onTriggerExit = function (entity) {
    if (entity.tags.has("player") == false)
        return;

    this.app.fire("coUiManager:openGameScreen");
};