/*ClassicRewarded script that enables rewarded popups by Emre Şahin - emolingo games */
var ClassicRewarded = pc.createScript('classicRewarded');

ClassicRewarded.prototype.initialize = function () {
    this.entity.collision.on("triggerenter", this.trigger, this);
    this.entity.collision.on("triggerleave", this.triggerExit, this);

};

ClassicRewarded.prototype.trigger = function (entity) {
    if (entity.tags.has("Player")) {
        entity.fire("triggerenter", this.entity);
    }
};


ClassicRewarded.prototype.triggerExit = function (entity) {
    if (entity.tags.has("Player")) {
        this.app.fire("rewardedClose", this.entity);
    }
};