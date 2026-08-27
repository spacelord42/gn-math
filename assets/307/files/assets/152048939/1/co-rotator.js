/*CoRotator script that rotates the object by given parameters by Emre Şahin - emolingo games*/
var CoRotator = pc.createScript('coRotator');
CoRotator.attributes.add('speed', { type: 'vec3', default: [30, 0, 0] });
CoRotator.attributes.add('rotateGlobally', { type: 'boolean', default: false });

CoRotator.prototype.update = function (dt) {
    if (this.rotateGlobally)
        this.entity.rotate(this.speed.x * dt, this.speed.y * dt, this.speed.z * dt);
    else
        this.entity.rotateLocal(this.speed.x * dt, this.speed.y * dt, this.speed.z * dt);
};