/*CoBikeGameArea script that teleports player to the bike game mode by Emre Şahin - emolingo games */
var CoBikeGameArea = pc.createScript('coBikeGameArea');

CoBikeGameArea.prototype.initialize = function () {
    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    this.entity.collision.on('triggerleave', this.onTriggerExit, this);
};

CoBikeGameArea.prototype.onTriggerEnter = function (entity) {
    if (entity.tags.has("player") == false)
        return;

    this.app.fire("openSound:joinArea");
    this.app.fire("coUiManager:openBikeGameScreen");
};

CoBikeGameArea.prototype.onTriggerExit = function (entity) {
    if (entity.tags.has("player") == false)
        return;

    this.app.fire("coUiManager:openGameScreen");
};