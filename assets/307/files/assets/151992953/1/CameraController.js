/*BikeObby_CameraController script that handles camera by Emre Şahin - emolingo games */
var BikeObby_CameraController = pc.createScript('cameraController');

BikeObby_CameraController.attributes.add('mouseSpeed', { type: 'number', default: 1.4, description: 'Mouse Sensitivity' });

// Called once after all resources are loaded and before the first update
BikeObby_CameraController.prototype.initialize = function () {
    this.eulers = new pc.Vec3(180, 10, 0);
    this.touchCoords = new pc.Vec2();
    this.app.firstTouch = false;
    this.app.mouse.disableContextMenu();


    this.app.mouse.on("mousemove", this.onMouseMove, this);
    this.app.mouse.on("mouseup", this.onMouseUp, this);
    this.app.mouse.on("mousedown", this.onMouseDown, this);
    this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

    this.rayEnd = this.app.root.findByName('RaycastEndPoint');
    this.originEntity = this.entity.parent;
    this.isHoldingRightMouse = false;

    this.on('destroy', function () {
        this.app.mouse.off("mousemove", this.onMouseMove, this);
        this.app.mouse.off("mouseup", this.onMouseUp, this);
        this.app.mouse.off("mousedown", this.onMouseDown, this);
        this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
    }, this);

    window.addEventListener('keydown', ev => {
        if (['ArrowDown', 'ArrowUp', ' '].includes(ev.key)) {
            ev.preventDefault();
        }
    });
    window.addEventListener('wheel', ev => ev.preventDefault(), { passive: false });
};

BikeObby_CameraController.prototype.reset = function () {
    if ((this.app.currentStage >= 50 && this.app.currentStage < 100) || (this.app.currentStage >= 146))
        this.eulers.x = 0;
    else
        this.eulers.x = 180;
};

BikeObby_CameraController.prototype.setMouseZoom = function () {
    /*
    let zoom = Number.parseFloat(BikeObby_Utils.getItem("mouseZoom"));
    if (zoom != null && isNaN(zoom) == false) {
        const pos = this.entity.getLocalPosition();
        this.app.mouseZoom = zoom;
        zoom = zoom * 25 / 100 + 7;
        this.entity.setLocalPosition(pos.x, pos.y, zoom);
    }
    */
};

BikeObby_CameraController.prototype.onMouseWheel = function (event) {
    this.app.mouseScroll += event.wheelDelta;
    if (this.app.mouseScroll < 0)
        this.app.mouseScroll = 0;
    if (this.app.mouseScroll > 16)
        this.app.mouseScroll = 16;
    BikeObby_Utils.setItem("mouseScroll", this.app.mouseScroll);

    const w = window.innerWidth;
    const h = window.innerHeight;

    if (w > h) {
        // Landscape
        const tempPos = this.rayEnd.getLocalPosition();
        tempPos.z = this.app.mouseScroll + 16;
        this.rayEnd.setLocalPosition(tempPos);
    }
    else {
        // Portrait
        const tempPos = this.rayEnd.getLocalPosition();
        tempPos.z = this.app.mouseScroll + 24;
        this.rayEnd.setLocalPosition(tempPos);
    }

    /*
    if (this.app.cameraStateLocked == false) return;
    const pos = this.entity.getLocalPosition();
    this.entity.setLocalPosition(pos.x, pos.y, pos.z + event.wheelDelta);
    this.app.mouseZoom = (pos.z + event.wheelDelta - 7) * 100 / 25;
    */
    // BikeObby_Utils.setItem("mouseZoom", this.app.mouseZoom);
};

BikeObby_CameraController.prototype.setSensitivity = function () {
    /*
    const data = parseInt(BikeObby_Utils.getItem("mouseSensitivity"));
    if (data != null && isNaN(data) == false) {
        this.mouseSpeed = data / 3;
    } else {
        this.mouseSpeed = 10;
    }
    */
};

BikeObby_CameraController.prototype.removeEventCallbacks = function () {
    this.app.mouse.off("mousemove", this.onMouseMove, this);
    this.app.mouse.off("mouseup", this.onMouseUp, this);
    this.app.mouse.off("mousedown", this.onMouseDown, this);
};

BikeObby_CameraController.prototype.addEventCallbacks = function () {
    this.app.mouse.on("mousemove", this.onMouseMove, this);
    this.app.mouse.on("mouseup", this.onMouseUp, this);
    this.app.mouse.on("mousedown", this.onMouseDown, this);
};


BikeObby_CameraController.prototype.postUpdate = function (dt) {
    const targetY = this.eulers.x + 180;
    const targetX = this.eulers.y;
    const targetAng = new pc.Vec3(-targetX, targetY, 0);

    this.originEntity.setEulerAngles(targetAng);
    const pos = this.getWorldPoint();

    this.entity.setPosition(pos);

    this.entity.lookAt(this.originEntity.getPosition());
};

BikeObby_CameraController.prototype.onMouseMove = function (e) {
    var dx = Math.min(Math.max(e.dx, -50), 50);
    var dy = Math.min(Math.max(e.dy, -50), 50);

    this.eulers.x -= ((this.mouseSpeed * dx) / 60) % 360;
    this.eulers.y += ((this.mouseSpeed * dy) / 60) % 360;

    if (this.eulers.x < 0) this.eulers.x += 360;
    if (this.eulers.y < 0) this.eulers.y += 360;

    this.eulers.y %= 360;
    if (this.eulers.y > 85 && this.eulers.y < 180)
        this.eulers.y = 85;
    else if (this.eulers.y < 350 && this.eulers.y > 300)
        this.eulers.y = 350;
};

BikeObby_CameraController.prototype.onMouseDown = function (e) {
    this.app.firstTouch = true;
};

BikeObby_CameraController.prototype.getWorldPoint = function () {
    var from = this.entity.parent.getPosition();
    var to = this.rayEnd.getPosition();
    var hit = this.app.systems.rigidbody.raycastFirst(from, to);

    if (hit && (hit.entity.tags.has('Ground') || hit.entity.tags.has('Dead'))) {
        return hit.point;
    }

    return to;
};
