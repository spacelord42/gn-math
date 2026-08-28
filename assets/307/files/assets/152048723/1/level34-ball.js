/*Level34Ball script that tweens section 34 ball by Burak Ersin - emolingo games */
var Level34Ball = pc.createScript('level34Ball');
Level34Ball.attributes.add("delay", { type: "number", default: 4 });
Level34Ball.attributes.add("time", { type: "number", default: 5 });
Level34Ball.attributes.add("toPosition", { type: "vec3" });
Level34Ball.attributes.add("particle", { type: "entity" });

Level34Ball.prototype.initialize = function () {
    this.initPosition = this.entity.getLocalPosition().clone();
    this.tween();
};

Level34Ball.prototype.tween = function () {
    this.entity
        .tween(this.entity.getLocalPosition())
        .to(this.toPosition, this.time, pc.SineIn)
        .onComplete(() => {
            this.entity.setLocalPosition(this.initPosition);
            this.tween();
        })
        .delay(this.delay)
        .start();
};
