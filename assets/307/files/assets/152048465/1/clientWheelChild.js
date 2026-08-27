/*ClientWheel script that lerps the wheel according to the server packets by Burak Ersin - emolingo games */
var ClientWheel = pc.createScript('clientWheel');
ClientWheel.attributes.add("frontWheel", { type: "boolean" });
ClientWheel.prototype.initialize = function () {
    this.parentWheel = this.entity.parent.script.clientWheelParent;
    this.parentWheelAlpha = 0;
};

ClientWheel.prototype.update = function (dt) {
    this.parentWheelAlpha = this.parentWheel.alpha;
    if (!this.frontWheel)
        this.entity.rotateLocal(this.parentWheelAlpha * dt * 1500, 0, 0);
    else {
        const playerRotQuat = new pc.Quat().setFromEulerAngles(this.entity.getLocalEulerAngles().x, this.parentWheel.steering * 20, 0);
        var rotation = this.entity.getLocalRotation();
        var quat = rotation.slerp(
            rotation,
            playerRotQuat,
            dt * 6
        );
        this.entity.setLocalRotation(quat);

        this.entity.rotateLocal(this.parentWheelAlpha * dt * 1500, 0, 0);
    }
};