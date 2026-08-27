/*ClassicApplyForce script that applies gravity like force to ground by Emre Şahin - emolingo games */
var ClassicApplyForce = pc.createScript('classicApplyForce');


ClassicApplyForce.prototype.update = function (dt) {
    this.entity.rigidbody.applyForce(0, -1000 * dt, 0);
};