/*FlameAnimation script that creates a simple flame tween by Emre Şahin - emolingo games */
var FlameAnimation = pc.createScript('flameAnimation');

// initialize code called once per entity
FlameAnimation.prototype.initialize = function () {
    this.entity.tween(this.entity.getLocalRotation())
        .to(new pc.Quat().setFromEulerAngles(0, 0, -10), 0.2, pc.QuinticOut)
        .yoyo(true)
        .repeat(2)
        .delay(0.4)
        .loop(true)
        .start();

    this.entity.tween(this.entity.getLocalScale())
        .to(new pc.Vec3(0.5, 0.5, 0.5), 0.4, pc.QuinticOut)
        .yoyo(true)
        .repeat(2)
        .delay(0.2)
        .loop(true)
        .start();
};

// update code called every frame
FlameAnimation.prototype.update = function (dt) {

};