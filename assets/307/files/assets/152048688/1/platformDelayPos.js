/*PlatformDelayPos script that delays and tweens platform by Burak Ersin - emolingo games */
var PlatformDelayPos = pc.createScript('platformDelayPos');
PlatformDelayPos.attributes.add("position", { type: "vec3" });

PlatformDelayPos.attributes.add("time", { type: "number", default: 1 });
PlatformDelayPos.attributes.add("delay", { type: "number", default: 0 });
PlatformDelayPos.attributes.add("isTrigger", { type: "boolean", default: false });
// initialize code called once per entity
PlatformDelayPos.prototype.initialize = function () {
    this.tempPosition = this.entity.getLocalPosition().clone();
    this.tween();
};
PlatformDelayPos.prototype.tween = function () {
    this.entity
        .tween(this.entity.getLocalPosition())
        .to(this.position, this.time, pc.SineInOut)
        //.loop(true)
        .onComplete(() => {
            this.tween2();
        })
        .delay(this.delay)
        .start();
};
PlatformDelayPos.prototype.tween2 = function () {
    this.entity
        .tween(this.entity.getLocalPosition())
        .to(this.tempPosition, this.time, pc.SineInOut)
        .onComplete(() => {
            this.tween();
        })
        .delay(this.delay)
        .start();
};