/*BikeObby_LookAtcamera script that makes the object look at target object by Emre Şahin - emolingo games */
var BikeObby_LookAtcamera = pc.createScript('lookAtcamera');
BikeObby_LookAtcamera.attributes.add('angle', {
    type: 'vec3',
    default: [180, 0, 180]
});

// initialize code called once per entity
BikeObby_LookAtcamera.prototype.initialize = function () {
    this.camera = this.app.root.findByName("Camera");
};

// update code called every frame
BikeObby_LookAtcamera.prototype.update = function (dt) {
    this.entity.lookAt(this.camera.getPosition());
    this.entity.rotateLocal(this.angle.x, this.angle.y, this.angle.z);
};