/*ClassicCameraController script that handles camera by Emre Şahin - emolingo games */
var ClassicCameraController = pc.createScript('classicCameraController');


ClassicCameraController.attributes.add('mouseSpeed', { type: 'number', default: 1.4, description: 'Mouse Sensitivity' });
ClassicCameraController.attributes.add('fpsCamera', { type: 'entity' });

// Called once after all resources are loaded and before the first update
ClassicCameraController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.networkManager;
    this.eventsAdded = false;
    this.eulers = new pc.Vec3(180, 10, 0);
    this.touchCoords = new pc.Vec2();
    this.app.firstTouch = false;
    this.rayEnd = this.entity.parent.findByName('RaycastEndPoint');
    this.player = this.app.root.findByName('RaycastEndPointpL');
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




    this.app.on('EnterFPS', function () {
        this.app.isFPS = false;
        this.app.mouseScroll = 1;
        Utils.setItem("mouseScroll", this.app.mouseScroll);
        Utils.setItem("isFPS", false);
    }, this);

    this.app.on('ExitFPS', function () {
        this.app.isFPS = false;
        Utils.setItem("isFPS", false);
    }, this);

    this.on('destroy', function () {
        this.app.off('EnterFPS');
        this.app.off('ExitFPS');
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
    if (Utils.getItem("mouseScroll")) {
        if (Number.parseInt(Utils.getItem("mouseScroll")) <= 0) {
            Utils.setItem("mouseScroll", 1)
        }
    }
    else
        Utils.setItem("mouseScroll", 1)
    this.app.mouseScroll = Number.parseInt(Utils.getItem("mouseScroll"))
};

ClassicCameraController.prototype.resetCamera = function () {
    this.rayEnd = this.entity.parent.findByName('RaycastEndPoint');
    this.originEntity = this.entity.parent;
}

ClassicCameraController.prototype.onOrientationChange = function () {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w > h) {
        this.horizontal = true;
    }
    else {
        this.vertical = true;
    }
}

ClassicCameraController.prototype.reset = function () {
    //this.eulers.x = this.getYaw(this.networkManager.savePoints.children[this.app.currentStage].children[0].getRotation());
    if (this.app.allStage[this.app.currentCheckPoint + 1])
        this.eulers.x = LookAt(this.app.allStage[this.app.currentCheckPoint + 1], this.entity);
    else
        this.eulers.x = 90;
    this.eulers.y = 10
};

ClassicCameraController.prototype.getYaw = function (quat) {
    let transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);
    return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
};

ClassicCameraController.prototype.getMouseZoomFromStorage = function () {
    let zoom = Number.parseFloat(Utils.getItem("mouseScroll"));
    if (zoom != null && isNaN(zoom) == false) {
        this.app.mouseScroll = zoom;
    } else {
        this.app.mouseScroll = 4;
    }
};

ClassicCameraController.prototype.setMouseZoom = function (dt) {
    if (this.app.isFPS) {
        const tempPos = this.rayEnd.getLocalPosition();
        this.oldTempPos = pc.math.lerp(tempPos.z, 0.1, 20 * dt);
        if (this.oldTempPos != tempPos.z) {
            if (this.app.isMilk)
                this.rayEnd.parent.getLocalPosition().y = 1.6;
            else
                this.rayEnd.parent.getLocalPosition().y = 0.8;
            tempPos.z = this.oldTempPos;
            //this.rayEnd.setLocalPosition();
        }
    } else {
        if (this.horizontal) {
            // Landscape
            const tempPos = this.rayEnd.getLocalPosition();
            this.oldTempPos = pc.math.lerp(tempPos.z, this.app.mouseScroll + 4, 20 * dt);
            if (this.oldTempPos != tempPos.z) {
                tempPos.z = this.oldTempPos;
                if (this.app.isMilk)
                    this.rayEnd.parent.getLocalPosition().y = 1.167;
                else
                    this.rayEnd.parent.getLocalPosition().y = 0.367;
                this.rayEnd.setLocalPosition(tempPos);
            }
        }
        else {
            // Portrait
            const tempPos = this.rayEnd.getLocalPosition();
            tempPos.z = this.app.mouseScroll + 8;
            this.rayEnd.setLocalPosition(tempPos);
        }
    }
};

ClassicCameraController.prototype.onMouseWheel = function (event) {
    if (this.app.lockedFPS) return;
    this.app.mouseScroll += event.wheelDelta;
    if (this.app.mouseScroll < 1)
        this.app.mouseScroll = 1;
    if (this.app.mouseScroll > 16)
        this.app.mouseScroll = 16;

    if (this.app.mouseScroll === 0) {
        if (this.app.isFPS == false)
            this.app.fire("EnterFPS");
    } else {
        if (this.app.isFPS == true)
            this.app.fire("ExitFPS");
    }
    Utils.setItem("mouseScroll", this.app.mouseScroll);
};

ClassicCameraController.prototype.setSensitivity = function () {
    /*
    const data = parseInt(BikeObby_Utils.getItem("mouseSensitivity"));
    if (data != null && isNaN(data) == false) {
        this.mouseSpeed = data / 3;
    } else {
        this.mouseSpeed = 10;
    }
    */
};

ClassicCameraController.prototype.removeEventCallbacks = function () {
    if (this.eventsAdded == true) {
        this.eventsAdded = false;
        this.app.mouse.off("mousemove", this.onMouseMove, this);
        this.app.mouse.off("mousedown", this.onMouseDown, this);
    }
};

ClassicCameraController.prototype.addEventCallbacks = function () {
    if (this.eventsAdded == false) {
        this.eventsAdded = true;
        this.app.mouse.on("mousemove", this.onMouseMove, this);
        this.app.mouse.on("mousedown", this.onMouseDown, this);
    }
};


ClassicCameraController.prototype.postUpdate = function (dt) {
    this.setMouseZoom(dt);
    const targetY = this.eulers.x + 180;
    const targetX = this.eulers.y;
    const targetAng = new pc.Vec3(-targetX, targetY, 0);

    this.originEntity.setEulerAngles(targetAng);
    const pos = this.getWorldPoint();

    this.entity.setPosition(pos);

    this.entity.lookAt(this.originEntity.getPosition());
};

ClassicCameraController.prototype.onMouseMove = function (e) {
    if (this.app.isPause) return;
    var dx = Math.min(Math.max(e.dx, -50), 50);
    var dy = Math.min(Math.max(e.dy, -50), 50);

    this.eulers.x -= ((this.mouseSpeed * dx) / 60) % 360;
    this.eulers.y += ((this.mouseSpeed * dy) / 60) % 360;

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

ClassicCameraController.prototype.onMouseDown = function (e) {
    this.app.firstTouch = true;
};

ClassicCameraController.prototype.getWorldPoint = function () {
    var from = this.entity.parent.getPosition();
    var to = this.rayEnd.getPosition();

    var hit = this.app.systems.rigidbody.raycastFirstByTag(from, to, "Ground");
    if (hit)
        return hit.point.clone().add(this.entity.forward.scale(0.2));
    return to
    /*
    if (hit) {
        if (from.distance(hit.point) < 0.2) {
            return hit.point.clone()
        }
        this.tempPos = hit.point;
        return hit.point.clone().add(this.entity.forward.scale(0.1));
    }
    return this.rayEnd.getPosition();
    /*
    var hit = this.app.systems.rigidbody.raycastFirst(from, to);

    if (hit && (hit.entity.tags.has('Ground') || hit.entity.tags.has('Dead'))) {
        return hit.point;
    }

    return to;*/
};

function LookAt(target, entity) {
    let direction = target.getPosition().clone().add(entity.getPosition().clone().scale(-1))
    direction.y = 0;
    direction.normalize();
    let angle = Math.atan2(direction.x, direction.z) * (180 / Math.PI);
    return angle;
};