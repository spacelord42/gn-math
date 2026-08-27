/*RepeatPosition script that tweens with repeat by Burak Ersin - emolingo games */
var RepeatPosition = pc.createScript('repeatPosition');
RepeatPosition.attributes.add("position", { type: "vec3" });

RepeatPosition.attributes.add("delay", { type: "number" });
RepeatPosition.attributes.add("repeat", { type: "number", default: 2 });
RepeatPosition.attributes.add("time", { type: "number", default: 2 });


RepeatPosition.prototype.initialize = function () {
    this.firstPosition = this.entity.getLocalPosition().clone();
    this.entity.collision.on('collisionstart', this.tween, this);
};

// update code called every frame
RepeatPosition.prototype.tween = function () {
    this.entity
        .tween(this.entity.getLocalPosition())
        .to(this.position, this.time, pc.SineInOut)
        .delay(this.delay)
        .onComplete(() => {
            this.entity
                .tween(this.entity.getLocalPosition())
                .to(this.firstPosition, this.time, pc.SineInOut)
                .delay(this.delay)
                .start();
        })
        .start();
};
