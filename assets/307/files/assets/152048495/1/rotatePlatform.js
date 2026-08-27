/*RotatePlatform script that handles rotates platform with tween by Burak Ersin - emolingo games */
var RotatePlatform = pc.createScript('rotatePlatform');
RotatePlatform.attributes.add("endRot", { type: "vec3" });
RotatePlatform.attributes.add("delay", { type: "number" });
RotatePlatform.attributes.add("time", { type: "number", default: 6 });
RotatePlatform.attributes.add("linear", { type: "boolean", default: true });
RotatePlatform.attributes.add("delayLoop", { type: "boolean", default: false });

RotatePlatform.prototype.initialize = function () {
    if (this.delayLoop == true) {
        this.tempRot = this.entity.getEulerAngles();
        this.tween();
        return;
    }
    const endRot = this.endRot;
    if (this.linear)
        this.entity.tween(this.entity.getLocalEulerAngles()).rotate({ x: endRot.x, y: endRot.y, z: endRot.z }, this.time, pc.Linear)
            .loop(true)
            .delay(this.delay)
            .yoyo(true)
            .start();
    else
        this.entity.tween(this.entity.getLocalEulerAngles()).rotate({ x: endRot.x, y: endRot.y, z: endRot.z }, this.time, pc.SineInOut)
            .loop(true)
            .delay(this.delay)
            .yoyo(true)
            .start();
};

RotatePlatform.prototype.tween = function () {
    const endRot = this.endRot;

    this.entity.tween(this.entity.getLocalEulerAngles()).rotate({ x: endRot.x, y: endRot.y, z: endRot.z }, this.time, pc.SineInOut)
        //.loop(true)
        .delay(this.delay)
        .onComplete(() => {
            this.entity.tween(this.entity.getLocalEulerAngles()).rotate({ x: this.tempRot.x, y: this.tempRot.y, z: this.tempRot.z }, this.time, pc.SineInOut)
                //.loop(true)
                .delay(this.delay)
                .onComplete(() => {
                    this.tween();
                })
                .start();
        })
        .start();
};