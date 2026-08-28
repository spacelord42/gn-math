/*VehicleGraphics script sets physical wheel positions to graphical wheel model by Burak Ersin - emolingo games */
var VehicleGraphics = pc.createScript('vehicleGraphics');

VehicleGraphics.attributes.add('physicsVehicle', { type: 'entity' });
VehicleGraphics.attributes.add('wheelNames', { type: 'string', array: true });
VehicleGraphics.attributes.add('wheelOffsets', { type: 'vec3', array: true });

VehicleGraphics.prototype.initialize = function () {
    this.wheels = [];
    for (var i = 0; i < this.wheelNames.length; i++) {
        this.wheels[i] = this.entity.findByName(this.wheelNames[i]);
    }
};

VehicleGraphics.prototype.postUpdate = function (dt) {

    if (this.physicsVehicle) {
        this.entity.setPosition(this.physicsVehicle.getPosition());
        this.entity.setRotation(this.physicsVehicle.getRotation());

        for (var i = 0; i < this.wheels.length; i++) {
            var graphicalWheel = this.wheels[i];
            var physicalWheel = this.physicsVehicle.script.vehicle.wheels[i];

            if (graphicalWheel && physicalWheel) {
                graphicalWheel.setPosition(physicalWheel.getPosition());
                graphicalWheel.setRotation(physicalWheel.getRotation());
                graphicalWheel.rotateLocal(0, 180, 0);
            }
        }
    }
};
