/*LookAtCam script that makes the object look at target object by Emre Şahin - emolingo games */
var LookAtCam = pc.createScript('lookAtCam');
LookAtCam.attributes.add('angle', {
    type: 'vec3',
    default: [180, 0, 180]
});

// initialize code called once per entity
LookAtCam.prototype.initialize = function () {
    this.camera = this.app.root.findByName("Camera");
};

// update code called every frame
LookAtCam.prototype.update = function (dt) {
    this.entity.lookAt(this.camera.getPosition());
    this.entity.rotateLocal(this.angle.x, this.angle.y, this.angle.z);
};