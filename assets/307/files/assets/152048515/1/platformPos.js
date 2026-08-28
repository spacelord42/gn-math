/*PlatformPos script that tweens platform by Burak Ersin - emolingo games */
var PlatformPos = pc.createScript('platformPos');
PlatformPos.attributes.add("endEntity", { type: "entity" });
PlatformPos.attributes.add("position", { type: "vec3" });

PlatformPos.attributes.add("time", { type: "number", default: 1 });
PlatformPos.attributes.add("delay", { type: "number", default: 1 });
PlatformPos.attributes.add("isTrigger", { type: "boolean", default: false });


PlatformPos.prototype.initialize = function () {
    this.isWork = !this.isTrigger;
    if (this.isTrigger == false)
        this.tween(null);
    else {
        if (!this.isWork)
            this.entity.collision.on('collisionstart', this.tween, this);
    }
};

PlatformPos.prototype.tween = function (entity) {

    if (this.endEntity == null) {
        this.entity
            .tween(this.entity.getLocalPosition())
            .to(this.position, this.time, pc.SineInOut)
            .loop(true)
            .yoyo(true)
            .delay(this.delay)
            .start();
        this.iswork = true;
        if (entity != null)
            if (!this.isWork)
                this.entity.collision.off('collisionstart', this.tween, this);
    }
    else {
        this.entity
            .tween(this.entity.getLocalPosition())
            .to(this.endEntity.getLocalPosition(), this.time, pc.SineInOut)
            .loop(true)
            .yoyo(true)
            .delay(this.delay)
            .start();
        this.iswork = true;
        if (entity != null)
            if (!this.isWork)
                this.entity.collision.off('collisionstart', this.tween, this);
    }

};
