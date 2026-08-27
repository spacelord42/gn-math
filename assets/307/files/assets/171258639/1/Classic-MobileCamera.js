/*ClassicMobileCamera script that handles mobile camera by Emre Şahin - emolingo games */
var ClassicMobileCamera = pc.createScript('classicMobileCamera');


// Script attributes to control the sensitivity of the camera look with touch
ClassicMobileCamera.attributes.add("touchLookSensitivity", { type: "number", default: 0, title: "Touch Look Sensitivity" });

// 'Snappiness' factor (how fast does the camera reach the target rotation and distance)
ClassicMobileCamera.attributes.add("snappinessFactor", { type: "number", default: 0.1, title: "Snappiness Factor", description: "Lower is faster" });



ClassicMobileCamera.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.networkManager;
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
    this.getMouseZoomFromStorage();
    this.onOrientationChange();
    window.addEventListener("resize", this.onOrientationChange.bind(this), false);
    window.addEventListener("orientationchange", this.onOrientationChange.bind(this), false);

    this.app.on('EnterFPS', this.enterFPS, this);

    this.app.on('ExitFPS', this.exitFPS, this);

    this.on('destroy', function () {
        this.app.off('EnterFPS');
        this.app.off('ExitFPS');
        this.removeEventCallbacks();
        window.removeEventListener("orientationchange", this);
        window.removeEventListener("resize", this);
    }, this);
};
ClassicMobileCamera.prototype.enterFPS = function () {
    this.app.isFPS = true;
    this.app.mouseScroll = 0;
    Utils.setItem("mouseScroll", this.app.mouseScroll);
    Utils.setItem("isFPS", true);
};
ClassicMobileCamera.prototype.exitFPS = function () {
    this.app.isFPS = false;
    this.app.mouseScroll = 4;
    Utils.setItem("isFPS", false);
};



ClassicMobileCamera.prototype.getMouseZoomFromStorage = function () {
    let zoom = Number.parseFloat(Utils.getItem("mouseScroll"));
    if (zoom != null && isNaN(zoom) == false) {
        this.app.mouseScroll = zoom;
    } else {
        this.app.mouseScroll = 2;
    }
};

ClassicMobileCamera.prototype.resetCamera = function () {
    this.rayEnd = this.entity.parent.findByName('RaycastEndPoint');
    this.originEntity = this.entity.parent;
};

ClassicMobileCamera.prototype.reset = function () {
    if (this.app.allStage[this.app.currentCheckPoint + 1])
        this.eulers.x = LookAt(this.app.allStage[this.app.currentCheckPoint + 1], this.entity);
    else
        this.eulers.x = 90;
    this.eulers.y = 10
};

ClassicMobileCamera.prototype.onOrientationChange = function () {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w > h) {
        this.horizontal = true;
    }
    else {
        this.vertical = true;
    }
}

ClassicMobileCamera.prototype.setMouseZoom = function (dt) {
    if (this.horizontal) {
        // Landscape
        const tempPos = this.rayEnd.getLocalPosition();
        this.rayEnd.parent.getLocalPosition().y = 0.3;
        tempPos.z = this.app.mouseScroll + 5;
        this.rayEnd.setLocalPosition(tempPos);
    }
    else {
        // Portrait
        const tempPos = this.rayEnd.getLocalPosition();
        this.rayEnd.parent.getLocalPosition().y = 0.3;
        tempPos.z = this.app.mouseScroll + 8;
        this.rayEnd.setLocalPosition(tempPos);
    }
};

ClassicMobileCamera.prototype.addEventCallbacks = function () {
    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    }
};


ClassicMobileCamera.prototype.removeEventCallbacks = function () {
    if (this.app.touch) {
        this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
        this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    }
};


ClassicMobileCamera.prototype.moveCamera = function (edx, edy, sensitivity) {
    var dx = Math.min(Math.max(edx, -50), 50);
    var dy = Math.min(Math.max(edy, -50), 50);

    this.eulers.x -= (((this.touchLookSensitivity * 2) * dx) / 60) % 360;
    this.eulers.y += (((this.touchLookSensitivity * 2) * dy) / 60) % 360;

    if (this.eulers.x < 0) this.eulers.x += 360;
    if (this.eulers.y < 0) this.eulers.y += 360;

    this.eulers.y %= 360;
    if (this.app.isFPS) {
        if (this.eulers.y > 85 && this.eulers.y < 180)
            this.eulers.y = 85;
        else if (this.eulers.y < 280 && this.eulers.y > 250)
            this.eulers.y = 280;
    } else {
        if (this.eulers.y > 85 && this.eulers.y < 180)
            this.eulers.y = 85;
        else if (this.eulers.y < 300 && this.eulers.y > 250)
            this.eulers.y = 300;
    }
};

ClassicMobileCamera.prototype.postUpdate = function (dt) {
    this.setMouseZoom(dt);
    const targetY = this.eulers.x + 180;
    const targetX = this.eulers.y;
    const targetAng = new pc.Vec3(-targetX, targetY, 0);

    this.originEntity.setEulerAngles(targetAng);
    const pos = this.getWorldPoint();

    this.entity.setPosition(pos);

    this.entity.lookAt(this.originEntity.getPosition());
};


ClassicMobileCamera.prototype.onTouchStart = function (event) {
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


ClassicMobileCamera.prototype.onTouchMove = function (event) {
    // We only care about the first touch. Work out the difference moved since the last event
    // and use that to update the camera target position 
    var touch;
    if (event.touches.length === 1) {
        if (this.joystickBaseEntity.isEnabled) {
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


ClassicMobileCamera.prototype.getYaw = function () {
    var forward = this.entity.forward.clone();
    return Math.atan2(-forward.x, -forward.z);
};

ClassicMobileCamera.prototype.getYaw2 = function (quat) {
    let transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);
    return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
};

ClassicMobileCamera.prototype.getPitch = function (quaternion, yaw) {
    var quatWithoutYaw = this._tempQuat1;
    var yawOffset = this._tempQuat2;

    yawOffset.setFromEulerAngles(0, -yaw, 0);
    quatWithoutYaw.mul2(yawOffset, quaternion);

    var transformedForward = this._tempVec3_1;

    quatWithoutYaw.transformVector(pc.Vec3.FORWARD, transformedForward);

    return Math.atan2(transformedForward.y, -transformedForward.z);
};

ClassicMobileCamera.prototype.getWorldPoint = function () {
    var from = this.entity.parent.getPosition();
    var to = this.rayEnd.getPosition();

    var hit = this.app.systems.rigidbody.raycastFirstByTag(from, to, "Ground");
    if (hit)
        return hit.point.clone().add(this.entity.forward.scale(0.2));
    return to
    /*
        var hit = this.app.systems.rigidbody.raycastFirst(from, to);
    
        if (hit && (hit.entity.tags.has('Ground') || hit.entity.tags.has('Dead'))) {
            return hit.point;
        }
    
        return to;*/
};
