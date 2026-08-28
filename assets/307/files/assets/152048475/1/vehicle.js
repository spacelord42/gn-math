/*Vehicle script controls physical ammojs car and applies forces to the wheels by Burak Ersin - emolingo games */
var Vehicle = pc.createScript('vehicle');

Vehicle.attributes.add('wheels', {
    type: 'entity',
    array: true,
    title: 'Wheels'
});
Vehicle.attributes.add('maxEngineForce', {
    type: 'number',
    default: 2000,
    title: 'Max Engine Force'
});
Vehicle.attributes.add('maxBrakingForce', {
    type: 'number',
    default: 100,
    title: 'Max Braking Force'
});

Vehicle.attributes.add('maxSteering', {
    type: 'number',
    default: 0.45,
    title: 'Max Steering'
});

Vehicle.attributes.add('minSteering', {
    type: 'number',
    default: 0.1,
    title: 'Min Steering'
});

Vehicle.attributes.add('maxCarSpeed', {
    type: 'number',
    default: 100,
    title: 'Max Car Speed'
});

Vehicle.attributes.add('maxCarBackSpeed', {
    type: 'number',
    default: 25,
    title: 'Max Car Back Speed'
});

Object.defineProperty(Vehicle.prototype, 'speed', {
    get: function () {
        return this.vehicle ? this.vehicle.getCurrentSpeedKmHour() : 0;
    }
});

// initialize code called once per entity

Vehicle.prototype.postInitialize = function () {
    this.app.fire("offAllTotems");
    //this.uiManager.closeBuyCarPanels();

    this.tempEngineForge = this.maxEngineForce;
    this.nitroForge = this.maxEngineForce * 2;
    this.nitroMaxCarSpeed = this.maxCarSpeed + (this.maxCarSpeed / 3)
    this.tempMaxCarSpeed = this.maxCarSpeed;
    this.nitro = false;
    var body = this.entity.rigidbody.body;
    var dynamicsWorld = this.app.systems.rigidbody.dynamicsWorld;

    // Create vehicle
    var tuning = new Ammo.btVehicleTuning();
    var vehicleRayCaster = new Ammo.btDefaultVehicleRaycaster(dynamicsWorld);
    var vehicle = new Ammo.btRaycastVehicle(tuning, body, vehicleRayCaster);
    vehicle.setCoordinateSystem(0, 1, 2);

    this.vehicle = vehicle;

    // Never deactivate the vehicle
    var DISABLE_DEACTIVATION = 4;
    body.setActivationState(DISABLE_DEACTIVATION);

    // Add wheels to the vehicle
    var wheelAxle = new Ammo.btVector3(-1, 0, 0);
    var wheelDirection = new Ammo.btVector3(0, -1, 0);
    var connectionPoint = new Ammo.btVector3(0, 0, 0);

    this.wheels.forEach(function (wheelEntity) {
        var wheelScript = wheelEntity.script.vehicleWheel;

        var frictionSlip = wheelScript.frictionSlip;
        var isFront = wheelScript.isFront;
        var radius = wheelScript.radius;
        var rollInfluence = wheelScript.rollInfluence;
        var suspensionCompression = wheelScript.suspensionCompression;
        var suspensionDamping = wheelScript.suspensionDamping;
        var suspensionRestLength = wheelScript.suspensionRestLength;
        var suspensionStiffness = wheelScript.suspensionStiffness;

        var wheelPos = wheelEntity.getLocalPosition();
        connectionPoint.setValue(wheelPos.x, wheelPos.y, wheelPos.z);
        var wheelInfo = vehicle.addWheel(connectionPoint, wheelDirection, wheelAxle, suspensionRestLength, radius, tuning, isFront);

        wheelInfo.set_m_suspensionStiffness(suspensionStiffness);
        wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping);
        wheelInfo.set_m_wheelsDampingCompression(suspensionCompression);
        wheelInfo.set_m_frictionSlip(frictionSlip);
        wheelInfo.set_m_rollInfluence(rollInfluence);
    }, this);

    Ammo.destroy(wheelAxle);
    Ammo.destroy(wheelDirection);
    Ammo.destroy(connectionPoint);

    // Add the vehicle to the dynamics world
    dynamicsWorld.addAction(vehicle);

    this.engineForce = 0;
    this.brakingForce = 0;
    this.steering = 0;

    this.nitroParticle = this.entity.findByName("nitro");//particlesystem.play();

    // Event handling
    this.on("enable", function () {
        dynamicsWorld.addAction(vehicle);
    });

    this.on("disable", function () {
        dynamicsWorld.removeAction(vehicle);
    });


    this.on('vehicle:controls', function (steering, throttle) {
        this.steering = pc.math.lerp(this.steering, steering * this.maxSteering, 0.3);
        if (this.nitro == true)
            this.maxEngineForce = this.nitroForge;
        else
            this.maxEngineForce = this.tempEngineForge;

        if (throttle > 0) {
            if (this.currentCarSpeed < this.maxCarSpeed) {
                this.brakingForce = 0;
                this.engineForce = this.maxEngineForce;
            } else {
                //this.brakingForce = this.maxBrakingForce / 4;
                this.engineForce = 0;
            }
        } else if (throttle < 0) {
            if (this.currentCarSpeed < this.maxCarBackSpeed) {
                this.brakingForce = 0;
                this.engineForce = -this.maxEngineForce;
            } else {
                //this.brakingForce = this.maxBrakingForce / 4;
                this.engineForce = 0;
            }
        } else {
            this.brakingForce = this.maxBrakingForce / 4;
            this.engineForce = 0;
        }
    });
    this.entity.collision.on("collisionenter", this.collisionEnter, this);
    this.defaultMaxSteering = this.maxSteering;
    this.defaultMinSteering = this.minSteering;
    this.currentCarSpeed = 0;
    this.app.on("onChangedCarSpeed", this.onChangedCarSpeed, this);
    this.app.on("skill:getNitro", this.getNitro, this);
    this.on("destroy", () => {
        dynamicsWorld.removeAction(vehicle);

        Ammo.destroy(vehicleRayCaster);
        Ammo.destroy(vehicle);
        this.app.off("onChangedCarSpeed", this.onChangedCarSpeed, this);
        this.app.off("skill:getNitro", this.getNitro, this);
    }, this);
};

Vehicle.prototype.getNitro = function (event) {
    this.app.fire("skill:nitroOn");
    this.nitro = true;
    this.nitroParticle.particlesystem.play();
    this.maxCarSpeed = this.nitroMaxCarSpeed;
    this.tempDt = 0
};

Vehicle.prototype.collisionEnter = function (event) {
    //event
};

// update code called every frame
Vehicle.prototype.update = function (dt) {
    var vehicle = this.vehicle;
    var i;

    // Apply steering to the front wheels
    vehicle.setSteeringValue(this.steering, 0);
    vehicle.setSteeringValue(this.steering, 1);

    // Apply engine and braking force to the back wheels
    vehicle.applyEngineForce(this.engineForce, 2);
    vehicle.setBrake(this.brakingForce, 2);
    vehicle.applyEngineForce(this.engineForce, 0);
    vehicle.setBrake(this.brakingForce, 0);
    vehicle.applyEngineForce(this.engineForce, 1);
    vehicle.setBrake(this.brakingForce, 1);
    vehicle.applyEngineForce(this.engineForce, 3);
    vehicle.setBrake(this.brakingForce, 3);
    if (this.engineForce != 0 && this.currentCarSpeed == 0) {
        let getPosition = this.entity.getPosition().clone();
        this.entity.rigidbody.teleport(new pc.Vec3(getPosition.x, getPosition.y + dt, getPosition.z));
    }
    var numWheels = vehicle.getNumWheels();
    for (i = 0; i < numWheels; i++) {
        // synchronize the wheels with the (interpolated) chassis worldtransform
        vehicle.updateWheelTransform(i, true);
        var t = this.vehicle.getWheelTransformWS(i);

        var p = t.getOrigin();
        var q = t.getRotation();

        var wheel = this.wheels[i];
        wheel.setPosition(p.x(), p.y(), p.z());
        wheel.setRotation(q.x(), q.y(), q.z(), q.w());
    }

    if (this.nitro) {
        if (this.tempDt == undefined)
            this.tempDt = 0
        else
            this.tempDt += dt
        let time = 30 - this.tempDt;
        this.app.fire("changedNitroTime", Number.parseInt(time));
        if (time <= 0) {
            //this.uiManager.nitroUI.enabled = false;
            this.nitro = false;
            this.maxCarSpeed = this.tempMaxCarSpeed;
            this.tempDt = 0
            this.app.fire("skill:nitroEnd");
            this.nitroParticle.particlesystem.stop();
        }
    }
};

Vehicle.prototype.onChangedCarSpeed = function (carSpeed) {
    this.currentCarSpeed = carSpeed;
    this.maxSteering = this.defaultMaxSteering - (this.defaultMaxSteering - this.minSteering) * ((carSpeed - 0) / (this.maxCarSpeed - 0));
    if (this.maxSteering > this.defaultMaxSteering)
        this.maxSteering = this.defaultMaxSteering;
    if (this.maxSteering < this.defaultMinSteering)
        this.maxSteering = this.defaultMinSteering;
};