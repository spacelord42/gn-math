var RiverObbyRotator = pc.createScript('riverObbyRotator');

RiverObbyRotator.attributes.add('speed', { type: 'vec3', default: [30, 0, 0] });
RiverObbyRotator.attributes.add('rotateGlobally', { type: 'boolean', default: false });
// update code called every frame
RiverObbyRotator.prototype.update = function (dt) {
    if (this.rotateGlobally) {
        this.entity.rotate(this.speed.x * dt, this.speed.y * dt, this.speed.z * dt);
    } else {
        this.entity.rotateLocal(this.speed.x * dt, this.speed.y * dt, this.speed.z * dt);
    }
};