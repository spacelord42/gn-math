var RiverObby_CameraController = pc.createScript('riverObbyCameraController');

RiverObby_CameraController.attributes.add('mouseSpeed', { type: 'number', default: 1.4, description: 'Mouse Sensitivity' });

// Called once after all resources are loaded and before the first update
RiverObby_CameraController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.riverObbyNetworkManager;
    this.eventsAdded = false;
    this.eulers = new pc.Vec3(180, 10, 0);
    this.touchCoords = new pc.Vec2();
    this.app.firstTouch = false;
    this.rayEnd = this.entity.parent.findByName('RaycastEndPoint');
    this.originEntity = this.entity.parent;
    this.isHoldingRightMouse = false;
    this.app.mouse.disableContextMenu();
    this.getMouseZoomFromStorage();
    this.onOrientationChange();
    window.addEventListener("resize", this.onOrientationChange.bind(this), false);
    window.addEventListener("orientationchange", this.onOrientationChange.bind(this), false);
    this.app.mouse.on("mousemove", this.onMouseMove, this);
    this.app.mouse.on("mousedown", this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

    this.on('destroy', function () {
        this.app.mouse.off("mousemove", this.onMouseMove, this);
        this.app.mouse.off("mousedown", this.onMouseDown, this);
        this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
        window.removeEventListener("orientationchange", this);
        window.removeEventListener("resize", this);
    }, this);

    window.addEventListener('keydown', ev => {
        if (['ArrowDown', 'ArrowUp', ' '].includes(ev.key)) {
            ev.preventDefault();
        }
    });
    window.addEventListener('wheel', ev => ev.preventDefault(), { passive: false });
};

RiverObby_CameraController.prototype.resetCamera = function () {
    this.rayEnd = this.entity.parent.findByName('RaycastEndPoint');
    this.originEntity = this.entity.parent;
}

RiverObby_CameraController.prototype.onOrientationChange = function () {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w > h) {
        this.horizontal = true;
    }
    else {
        this.vertical = true;
    }
}

RiverObby_CameraController.prototype.reset = function () {
    this.eulers.x = this.getYaw(this.networkManager.savePoints.children[this.app.currentStage].children[1].getRotation());
};

RiverObby_CameraController.prototype.getYaw = function (quat) {
    let transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);
    return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
};

RiverObby_CameraController.prototype.getMouseZoomFromStorage = function () {
    let zoom = Number.parseFloat(RiverObby_Utils.getItem("RIVEROBBY_mouseScroll"));
    if (zoom != null && isNaN(zoom) == false) {
        this.app.mouseScroll = zoom;
    } else {
        this.app.mouseScroll = 4;
    }
};

RiverObby_CameraController.prototype.setMouseZoom = function (dt) {
    if (this.horizontal) {
        // Landscape
        const tempPos = this.rayEnd.getLocalPosition();
        this.oldTempPos = pc.math.lerp(tempPos.z, this.app.mouseScroll + 4, 20 * dt);
        if (this.oldTempPos != tempPos.z) {
            tempPos.z = this.oldTempPos;
            this.rayEnd.setLocalPosition(tempPos);
        }
    }
    else {
        // Portrait
        const tempPos = this.rayEnd.getLocalPosition();
        tempPos.z = this.app.mouseScroll + 8;
        this.rayEnd.setLocalPosition(tempPos);
    }
};

RiverObby_CameraController.prototype.onMouseWheel = function (event) {
    this.app.mouseScroll += event.wheelDelta;
    if (this.app.mouseScroll < 0)
        this.app.mouseScroll = 0;
    if (this.app.mouseScroll > 16)
        this.app.mouseScroll = 16;

    RiverObby_Utils.setItem("RIVEROBBY_mouseScroll", this.app.mouseScroll);
};

RiverObby_CameraController.prototype.setSensitivity = function () {
    /*
    const data = parseInt(BikeObby_RiverObby_Utils.getItem("mouseSensitivity"));
    if (data != null && isNaN(data) == false) {
        this.mouseSpeed = data / 3;
    } else {
        this.mouseSpeed = 10;
    }
    */
};

RiverObby_CameraController.prototype.removeEventCallbacks = function () {
    if (this.eventsAdded == true) {
        this.eventsAdded = false;
        this.app.mouse.off("mousemove", this.onMouseMove, this);
        this.app.mouse.off("mousedown", this.onMouseDown, this);
    }
};

RiverObby_CameraController.prototype.addEventCallbacks = function () {
    if (this.eventsAdded == false) {
        this.eventsAdded = true;
        this.app.mouse.on("mousemove", this.onMouseMove, this);
        this.app.mouse.on("mousedown", this.onMouseDown, this);
    }
};


RiverObby_CameraController.prototype.postUpdate = function (dt) {
    this.setMouseZoom(dt);
    const targetY = this.eulers.x + 180;
    const targetX = this.eulers.y;
    const targetAng = new pc.Vec3(-targetX, targetY, 0);

    this.originEntity.setEulerAngles(targetAng);
    const pos = this.getWorldPoint();

    this.entity.setPosition(pos);

    this.entity.lookAt(this.originEntity.getPosition());

    //set fov
    this.entity.camera.fov = pc.math.lerp(this.entity.camera.fov, this.app.targetFov, 3 * dt);
};

RiverObby_CameraController.prototype.onMouseMove = function (e) {
    var dx = Math.min(Math.max(e.dx, -50), 50);
    var dy = Math.min(Math.max(e.dy, -50), 50);

    this.eulers.x -= (((this.mouseSpeed) * dx) / 60) % 360;
    this.eulers.y += (((this.mouseSpeed) * dy) / 60) % 360;

    if (this.eulers.x < 0) this.eulers.x += 360;
    if (this.eulers.y < 0) this.eulers.y += 360;

    this.eulers.y %= 360;
    if (this.eulers.y > 85 && this.eulers.y < 180)
        this.eulers.y = 85;
    else if (this.eulers.y < 350 && this.eulers.y > 280)
        this.eulers.y = 350;
};

RiverObby_CameraController.prototype.onMouseDown = function (e) {
    this.app.firstTouch = true;
};

RiverObby_CameraController.prototype.getWorldPoint = function () {
    var from = this.entity.parent.getPosition();
    var to = this.rayEnd.getPosition();
    var hit = this.app.systems.rigidbody.raycastFirst(from, to);

    if (hit && (hit.entity.tags.has('Ground') || hit.entity.tags.has('Dead'))) {
        return hit.point;
    }

    return to;
};
