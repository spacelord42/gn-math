/*BikeObby_MobileCameraController script that handles mobile camera by Emre Şahin - emolingo games */
var BikeObby_MobileCameraController = pc.createScript('mobileCameraController');

// Script attributes to control the sensitivity of the camera look with touch
BikeObby_MobileCameraController.attributes.add("touchLookSensitivity", { type: "number", default: 0, title: "Touch Look Sensitivity" });

// 'Snappiness' factor (how fast does the camera reach the target rotation and distance)
BikeObby_MobileCameraController.attributes.add("snappinessFactor", { type: "number", default: 0.1, title: "Snappiness Factor", description: "Lower is faster" });


BikeObby_MobileCameraController.prototype.initialize = function () {
    this.eulers = new pc.Vec3(180, 10, 0);
    this.joystickBaseEntity = this.app.root.findByName('Left Half Touch Joystick').children[0];
    // Cache some temp variables for use later
    this._tempQuat1 = new pc.Quat();
    this._tempQuat2 = new pc.Quat();
    this._tempVec3_1 = new pc.Vec3();

    // Calculate the camera euler angle rotation around x and y axes
    // This allows us to place the camera at a particular rotation to begin with in the scene
    var quat = this.entity.getLocalRotation();
    this.ey = this.getYaw(quat) * pc.math.RAD_TO_DEG;
    this.ex = this.getPitch(quat, this.ey) * pc.math.RAD_TO_DEG;

    // The target rotation for the camera to rotate to
    this.targetEx = this.ex;
    this.targetEy = this.ey;

    this.rayEnd = this.app.root.findByName('RaycastEndPoint');
    this.originEntity = this.entity.parent;

    // Store the position of the touch so we can calculate the distance moved
    this.lastTouchPosition = new pc.Vec2();

    this.addEventCallbacks();

    this.app.on('Slider:mouseSensitivity', this.setSensitivity, this);
    this.setSensitivity();

    // Remove callbacks if the script instance is destroyed
    this.on('destroy', function () {
        this.app.off('Slider:mouseSensitivity');
        this.removeEventCallbacks();
    }, this);
};

BikeObby_MobileCameraController.prototype.reset = function () {
    if (this.app.currentStage >= 50)
        this.eulers.x = 0;
    else
        this.eulers.x = 180;
};

BikeObby_MobileCameraController.prototype.setSensitivity = function () {
    const data = parseInt(BikeObby_Utils.getItem("mouseSensitivity"));
    if (data != null && isNaN(data) == false) {
        this.mouseSpeed = data / 100;
    } else {
        this.mouseSpeed = 0.5;
    }
};

BikeObby_MobileCameraController.prototype.addEventCallbacks = function () {
    if (this.app.isMobile) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    }
};


BikeObby_MobileCameraController.prototype.removeEventCallbacks = function () {
    if (this.app.isMobile) {
        this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    }
};


BikeObby_MobileCameraController.prototype.moveCamera = function (edx, edy, sensitivity) {
    var dx = Math.min(Math.max(edx, -50), 50);
    var dy = Math.min(Math.max(edy, -50), 50);

    this.eulers.x -= ((this.touchLookSensitivity * dx) / 60) % 360;
    this.eulers.y += ((this.touchLookSensitivity * dy) / 60) % 360;

    if (this.eulers.x < 0) this.eulers.x += 360;
    if (this.eulers.y < 0) this.eulers.y += 360;

    this.eulers.y %= 360;
    if (this.eulers.y > 85 && this.eulers.y < 180)
        this.eulers.y = 85;
    else if (this.eulers.y < 350 && this.eulers.y > 300)
        this.eulers.y = 350;
};

BikeObby_MobileCameraController.prototype.postUpdate = function (dt) {
    const targetY = this.eulers.x + 180;
    const targetX = this.eulers.y;
    const targetAng = new pc.Vec3(-targetX, targetY, 0);

    this.originEntity.setEulerAngles(targetAng);
    const pos = this.getWorldPoint();

    this.entity.setPosition(pos);

    this.entity.lookAt(this.originEntity.getPosition());
};


BikeObby_MobileCameraController.prototype.onTouchStart = function (event) {
    // We only care about the first touch. As the user touches the screen, 
    // we stored the current touch position

    var touch;
    if (event.touches.length === 1 || event.touches[0].x > event.touches[1].x) {
        touch = event.touches[0];
    } else {
        touch = event.touches[1];
    }
    this.lastTouchPosition.set(touch.x, touch.y);
    this.app.firstTouch = true;
};


BikeObby_MobileCameraController.prototype.onTouchMove = function (event) {
    // We only care about the first touch. Work out the difference moved since the last event
    // and use that to update the camera target position 
    var touch;
    if (event.touches.length === 1) {
        if (this.joystickBaseEntity.enabled) {
            return;
        } else {
            touch = event.touches[0];
        }
    } else {
        if (event.touches[0].x > event.touches[1].x) {
            touch = event.touches[0];
        } else {
            touch = event.touches[1];
        }
    }

    this.moveCamera((touch.x - this.lastTouchPosition.x), (touch.y - this.lastTouchPosition.y), this.touchLookSensitivity);
    this.lastTouchPosition.set(touch.x, touch.y);
};


BikeObby_MobileCameraController.prototype.getYaw = function () {
    var forward = this.entity.forward.clone();
    return Math.atan2(-forward.x, -forward.z);
};


BikeObby_MobileCameraController.prototype.getPitch = function (quaternion, yaw) {
    var quatWithoutYaw = this._tempQuat1;
    var yawOffset = this._tempQuat2;

    yawOffset.setFromEulerAngles(0, -yaw, 0);
    quatWithoutYaw.mul2(yawOffset, quaternion);

    var transformedForward = this._tempVec3_1;

    quatWithoutYaw.transformVector(pc.Vec3.FORWARD, transformedForward);

    return Math.atan2(transformedForward.y, -transformedForward.z);
};

BikeObby_MobileCameraController.prototype.getWorldPoint = function () {
    var from = this.entity.parent.getPosition();
    var to = this.rayEnd.getPosition();

    var hit = this.app.systems.rigidbody.raycastFirst(from, to);

    if (hit && (hit.entity.tags.has('Ground') || hit.entity.tags.has('Dead'))) {
        return hit.point;
    }

    return to;
};
