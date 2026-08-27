/*ClassicChest script that gives free reward on trigger by Emre Şahin - emolingo games */
var ClassicChest = pc.createScript('classicChest');


ClassicChest.prototype.initialize = function () {
    this.entity.collision.on("triggerenter", this.trigger, this);
};


ClassicChest.prototype.trigger = function (entity) {
    if (entity.tags.has("Player")) {
        this.entity.anim.setTrigger("open");
        this.app.fire("ClassicMusic", "chest");
        this.app.fire("Classic-ChestRewarded");
    }
};
