/*CoDeathArea script that triggers death mechanic by Emre Şahin - emolingo games */
var CoDeathArea = pc.createScript('coDeathArea');

CoDeathArea.prototype.initialize = function () {
    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    this.hasTotem = false;

    this.app.on("skill:getTotem", this.getTotem, this);

    this.app.on("skill:TotemEnd", this.totemEnd, this);
    this.on("destroy", function () {
        this.app.off("skill:getTotem", this.getTotem, this);
        this.app.off("skill:TotemEnd", this.totemEnd, this);
    }, this);
};
CoDeathArea.prototype.getTotem = function (entity) {
    this.hasTotem = true;
};
CoDeathArea.prototype.totemEnd = function (entity) {
    this.hasTotem = false;
};
CoDeathArea.prototype.onTriggerEnter = function (entity) {
    if (this.hasTotem == true) {
        this.app.fire("skill:TotemEnd");
        return;
    }

    if (entity.tags.has("player") == false) return;

    this.app.fire("playerDied");
};