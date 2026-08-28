/*VehicleWheel script just contains paramters for the wheel by Burak Ersin - emolingo games */
var VehicleWheel = pc.createScript('vehicleWheel');

VehicleWheel.attributes.add('isFront', {
    type: 'boolean',
    default: true,
    title: 'Front Wheel'
});
VehicleWheel.attributes.add('radius', {
    type: 'number',
    default: 0.4,
    title: 'Radius'
});
VehicleWheel.attributes.add('width', {
    type: 'number',
    default: 0.4,
    title: 'Width'
});
VehicleWheel.attributes.add('suspensionStiffness', {
    type: 'number',
    default: 10,
    title: 'Suspension Stiffness'
});
VehicleWheel.attributes.add('suspensionDamping', {
    type: 'number',
    default: 2.3,
    title: 'Suspension Damping'
});
VehicleWheel.attributes.add('suspensionCompression', {
    type: 'number',
    default: 4.4,
    title: 'Suspension Compression'
});
VehicleWheel.attributes.add('suspensionRestLength', {
    type: 'number',
    default: 0.2,
    title: 'Suspension Rest Length'
});
VehicleWheel.attributes.add('rollInfluence', {
    type: 'number',
    default: 0.2,
    title: 'Roll Influence'
});
VehicleWheel.attributes.add('frictionSlip', {
    type: 'number',
    default: 1000,
    title: 'Friction Slip'
});
VehicleWheel.attributes.add('debugRender', {
    type: 'boolean',
    default: false,
    title: 'Debug Render'
});

VehicleWheel.prototype.initialize = function () {
    var createDebugWheel = function (radius, width) {
        var debugWheel = new pc.Entity();
        debugWheel.addComponent('model', {
            type: 'cylinder',
            castShadows: true
        });
        debugWheel.setLocalEulerAngles(0, 0, 90);
        debugWheel.setLocalScale(radius * 2, width, radius * 2);
        return debugWheel;
    };

    if (this.debugRender) {
        this.debugWheel = createDebugWheel(this.radius, this.width);
        this.entity.addChild(this.debugWheel);
    }

    this.on('attr:debugRender', function (value, prev) {
        if (value) {
            this.debugWheel = createDebugWheel(this.radius, this.width);
            this.entity.addChild(this.debugWheel);
        } else {
            if (this.debugWheel) {
                this.debugWheel.destroy();
                this.debugWheel = null;
            }
        }
    });
};