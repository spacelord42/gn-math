/*ClassicDeath script that triggers death mechanic by Emre Şahin - emolingo games */
var ClassicDeath = pc.createScript('classicDeath');

// initialize code called once per entity
ClassicDeath.prototype.initialize = function () {
    this.entity.collision.on("collisionstart", this.trigger, this)
};

// update code called every frame
ClassicDeath.prototype.trigger = function (entity) {
    if (entity.other.tags.has("Player")) {
        this.app.fire("PlayerTakeDamage")

    }
};