/*BikeObby_Rotator script that rotates the object by given parameters by Emre Şahin - emolingo games*/
var BikeObby_Rotator = pc.createScript('rotator');
BikeObby_Rotator.attributes.add('speed', { type: 'vec3', default: [30, 0, 0] });
BikeObby_Rotator.attributes.add('rotateGlobally', { type: 'boolean', default: false });
// update code called every frame
BikeObby_Rotator.prototype.update = function (dt) {
    if (this.rotateGlobally) {
        this.entity.rotate(this.speed.x * dt, this.speed.y * dt, this.speed.z * dt);
    } else {
        this.entity.rotateLocal(this.speed.x * dt, this.speed.y * dt, this.speed.z * dt);
    }
};