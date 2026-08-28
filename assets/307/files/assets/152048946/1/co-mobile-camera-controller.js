/*CoMobileCameraController script that handles mobile camera by Emre Şahin - emolingo games */
var CoMobileCameraController = pc.createScript('coMobileCameraController');
CoMobileCameraController.attributes.add("raycastEndPoint", { type: "entity" });

// 'Snappiness' factor (how fast does the camera reach the target rotation and distance)
CoMobileCameraController.attributes.add("snappinessFactor", { type: "number", default: 0.1, title: "Snappiness Factor", description: "Lower is faster" });

CoMobileCameraController.prototype.initialize = function () {
    this.entity.camera.nearClip = 0.1;
    if (this.app.touch)
        this.entity.camera.farClip = 300;
    else
        this.entity.camera.farClip = 400;
    this.touchLookSensitivity = 16;
    this.entity.setLocalPosition(new pc.Vec3(0, 0, (CoSaveSystem.getItem("CAROBBY_zoom") * 2) + 5));
    this.raycastEndPoint.setLocalPosition(this.entity.getLocalPosition());
    this.eulers = new pc.Vec3(180, 10, 0);
    //this.joystickBaseEntity = this.app.root.findByName('Left Half Touch Joystick').children[0];
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

    this.rayEnd = this.entity.parent.findByName('RaycastEndPoint');
    this.originEntity = this.entity.parent;

    // Store the position of the touch so we can calculate the distance moved
    this.lastTouchPosition = new pc.Vec2();

    this.addEventCallbacks();

    //this.app.on('Slider:mouseSensitivity', this.setSensitivity, this);
    //this.setSensitivity();

    // Remove callbacks if the script instance is destroyed
    this.on('destroy', function () {
        this.app.off('Slider:mouseSensitivity');
        this.removeEventCallbacks();
    }, this);

    this.uiManager = this.app.root.findByName("UI Manager").script.coUiManager;
};

CoMobileCameraController.prototype.reset = function () {
    if (this.app.currentStage >= 50)
        this.eulers.x = 0;
    else
        this.eulers.x = 180;
};

CoMobileCameraController.prototype.setSensitivity = function () {
    const data = parseInt(CoSaveSystem.getItem("CAROBBY_mouseSensitivity"));
    if (data != null && isNaN(data) == false) {
        this.mouseSpeed = data / 100;
    } else {
        this.mouseSpeed = 0.5;
    }
};

CoMobileCameraController.prototype.addEventCallbacks = function () {
    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    }
};


CoMobileCameraController.prototype.removeEventCallbacks = function () {
    if (this.app.touch) {
        this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    }
};


CoMobileCameraController.prototype.moveCamera = function (edx, edy, sensitivity) {
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

CoMobileCameraController.prototype.postUpdate = function (dt) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (w > h) {
        this.entity.setLocalPosition(new pc.Vec3(0, 0, 15));
        this.raycastEndPoint.setLocalPosition(this.entity.getLocalPosition());
    }
    else {
        this.entity.setLocalPosition(new pc.Vec3(0, 0, 25));
        this.raycastEndPoint.setLocalPosition(this.entity.getLocalPosition());
    }

    const targetY = this.eulers.x + 180;
    const targetX = this.eulers.y;
    const targetAng = new pc.Vec3(-targetX, targetY, 0);

    this.originEntity.setEulerAngles(targetAng);
    const pos = this.getWorldPoint();

    this.entity.setPosition(pos);

    this.entity.lookAt(this.originEntity.getPosition());
};


CoMobileCameraController.prototype.onTouchStart = function (event) {
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


CoMobileCameraController.prototype.onTouchMove = function (event) {
    // We only care about the first touch. Work out the difference moved since the last event
    // and use that to update the camera target position 
    if (this.uiManager.gameScreen.enabled != true) return;
    if (window.touchJoypad.buttons.isPressed('buttonF')) return;
    if (window.touchJoypad.buttons.isPressed('buttonB')) return;
    var touch;
    if (event.touches.length === 1 && event.touches[0].x > window.screen.width / 3) {
        touch = event.touches[0];
    } else if (event.touches.length === 2) {
        if (event.touches[0].x > event.touches[1].x && event.touches[0].x > window.screen.width / 3) {
            touch = event.touches[0];
        } else if (event.touches[1].x > window.screen.width / 2) {
            touch = event.touches[1];
        } else {
            return;
        }
    } else {
        return;
    }

    this.moveCamera((touch.x - this.lastTouchPosition.x), (touch.y - this.lastTouchPosition.y), this.touchLookSensitivity);
    this.lastTouchPosition.set(touch.x, touch.y);
};


CoMobileCameraController.prototype.getYaw = function () {
    var forward = this.entity.forward.clone();
    return Math.atan2(-forward.x, -forward.z);
};


CoMobileCameraController.prototype.getPitch = function (quaternion, yaw) {
    var quatWithoutYaw = this._tempQuat1;
    var yawOffset = this._tempQuat2;

    yawOffset.setFromEulerAngles(0, -yaw, 0);
    quatWithoutYaw.mul2(yawOffset, quaternion);

    var transformedForward = this._tempVec3_1;

    quatWithoutYaw.transformVector(pc.Vec3.FORWARD, transformedForward);

    return Math.atan2(transformedForward.y, -transformedForward.z);
};

CoMobileCameraController.prototype.getWorldPoint = function () {
    var from = this.entity.parent.getPosition();
    var to = this.rayEnd.getPosition();

    var hit = this.app.systems.rigidbody.raycastFirst(from, to);

    if (hit && (hit.entity.tags.has('Ground') || hit.entity.tags.has('Dead'))) {
        return hit.point;
    }

    return to;
};
