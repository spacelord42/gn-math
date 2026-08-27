/*CoCameraController script that handles camera by Emre Şahin - emolingo games */
var CoCameraController = pc.createScript('coCameraController');
CoCameraController.attributes.add("raycastEndPoint", { type: "entity" });
CoCameraController.attributes.add("vehicleParentEntity", { type: "entity" });
// Called once after all resources are loaded and before the first update

CoCameraController.prototype.initialize = function () {
    this.entity.camera.nearClip = 0.1;
    if (this.app.touch)
        this.entity.camera.farClip = 300;
    else
        this.entity.camera.farClip = 400;

    this.mouseSpeed = 4;
    this.entity.setLocalPosition(new pc.Vec3(0, 0, (CoSaveSystem.getItem("CAROBBY_zoom") * 2) + 5));
    this.raycastEndPoint.setLocalPosition(this.entity.getLocalPosition());

    this.vehiclePhysicsEntity = this.app.root.findByName("Car Physics");
    this.uiManager = this.app.root.findByName("UI Manager").script.coUiManager;

    this.carSpeed = 0;
    this.maxCarSpeed = this.vehiclePhysicsEntity.script.vehicle.maxCarSpeed;
    this.minFOV = 50;
    this.maxFOV = 60;

    if (this.app.touch) {
        this.entity.script.coMobileCameraController.enabled = true;
        this.enabled = false;
        return;
    }
    else {
    }

    this.eulers = new pc.Vec3(180, 10, 0);
    this.touchCoords = new pc.Vec2();
    this.app.firstTouch = true;
    this.app.mouse.disableContextMenu();
    this.app.mouseScroll = CoSaveSystem.getItem("CAROBBY_zoom") * 1;
    this.app.mouse.on("mousemove", this.onMouseMove, this);
    this.app.mouse.on("mouseup", this.onMouseUp, this);
    this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

    this.rayEnd = this.entity.parent.findByName('RaycastEndPoint');
    this.originEntity = this.entity.parent;
    this.isHoldingRightMouse = false;

    this.isDie = false;

    this.app.on("listen:isDie", this.isDie, this);

    this.on('destroy', function () {
        this.app.mouse.off("mousemove", this.onMouseMove, this);
        this.app.mouse.off("mouseup", this.onMouseUp, this);
        this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
        this.app.off("listen:isDie", this.die, this);

    }, this);

    window.addEventListener('keydown', ev => {
        if (['ArrowDown', 'ArrowUp', ' '].includes(ev.key)) {
            ev.preventDefault();
        }
    });
    window.addEventListener('wheel', ev => ev.preventDefault(), { passive: false });
    this.app.on("onChangedCarSpeed", this.onChangedCarSpeed, this);
};
CoCameraController.prototype.die = function (e) {
    this.isDie = e;
};
CoCameraController.prototype.reset = function () {
    if (this.app.currentStage >= 50)
        this.eulers.x = 0;
    else
        this.eulers.x = 180;
};

CoCameraController.prototype.setMouseZoom = function () {
    /*
    let zoom = Number.parseFloat(Utils.getItem("mouseZoom"));
    if (zoom != null && isNaN(zoom) == false) {
        const pos = this.entity.getLocalPosition();
        this.app.mouseZoom = zoom;
        zoom = zoom * 25 / 100 + 7;
        this.entity.setLocalPosition(pos.x, pos.y, zoom);
    }
    */
};

CoCameraController.prototype.onMouseWheel = function (event) {
    this.app.mouseScroll += event.wheelDelta;
    if (this.app.mouseScroll < 0)
        this.app.mouseScroll = 0;
    if (this.app.mouseScroll > 16)
        this.app.mouseScroll = 16;

    CoSaveSystem.setItem("CAROBBY_zoom", parseInt(this.app.mouseScroll));
};

CoCameraController.prototype.setSensitivity = function () {
    /*
    const data = parseInt(Utils.getItem("mouseSensitivity"));
    if (data != null && isNaN(data) == false) {
        this.mouseSpeed = data / 3;
    } else {
        this.mouseSpeed = 10;
    }
    */
};

CoCameraController.prototype.removeEventCallbacks = function () {
    this.app.mouse.off("mousemove", this.onMouseMove, this);
    this.app.mouse.off("mouseup", this.onMouseUp, this);
    this.app.mouse.off("mousedown", this.onMouseDown, this);
};

CoCameraController.prototype.addEventCallbacks = function () {
    this.app.mouse.on("mousemove", this.onMouseMove, this);
    this.app.mouse.on("mouseup", this.onMouseUp, this);
    this.app.mouse.on("mousedown", this.onMouseDown, this);
};


CoCameraController.prototype.postUpdate = function (dt) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (w > h) {
        // Landscape
        const tempPos = this.rayEnd.getLocalPosition();
        tempPos.z = parseInt(CoSaveSystem.getItem("CAROBBY_zoom")) + 12;
        this.entity.setLocalPosition(tempPos);
        this.raycastEndPoint.setLocalPosition(tempPos);
    }
    else {
        // Portrait
        const tempPos = this.rayEnd.getLocalPosition();
        tempPos.z = parseInt(CoSaveSystem.getItem("CAROBBY_zoom")) + 20;
        this.entity.setLocalPosition(tempPos);
        this.raycastEndPoint.setLocalPosition(tempPos);
    }

    this.entity.setLocalPosition(new pc.Vec3(0, 0, (CoSaveSystem.getItem("CAROBBY_zoom") * 2) + 5));
    this.raycastEndPoint.setLocalPosition(this.entity.getLocalPosition());

    var mappedFOV = this.minFOV + (this.maxFOV - this.minFOV) * ((this.carSpeed - 0) / (this.maxCarSpeed - 0));
    if (mappedFOV > this.maxFOV)
        mappedFOV = this.maxFOV;
    if (mappedFOV < this.minFOV)
        mappedFOV = this.minFOV;
    this.entity.camera.fov = pc.math.lerp(this.entity.camera.fov, mappedFOV, 0.1);

    const targetY = this.eulers.x + 180;
    const targetX = this.eulers.y;
    const targetAng = new pc.Vec3(-targetX, targetY, 0);

    this.originEntity.setEulerAngles(targetAng);
    const pos = this.getWorldPoint();

    this.entity.setPosition(pos);
    this.entity.lookAt(this.originEntity.getPosition());
};

CoCameraController.prototype.onMouseMove = function (e) {
    if (this.isDie) return;
    if (this.uiManager.gameScreen.enabled != true) return;
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

CoCameraController.prototype.getWorldPoint = function () {
    var from = this.entity.parent.getPosition();
    var to = this.rayEnd.getPosition();

    var hit = this.app.systems.rigidbody.raycastFirst(from, to);
    if (hit && (hit.entity.tags.has('Ground') || hit.entity.tags.has('Dead'))) {
        return hit.point;
    }

    return to;
};

CoCameraController.prototype.onChangedCarSpeed = function (carSpeed) {
    this.carSpeed = carSpeed;
};
