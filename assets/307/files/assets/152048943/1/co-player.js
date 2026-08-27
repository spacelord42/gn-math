/*CoPlayer script that handles local player controls by Burak Ersin - emolingo games */
var CoPlayer = pc.createScript('coPlayer');
CoPlayer.attributes.add('physicsEntity', { type: 'entity' });
CoPlayer.attributes.add('graphicsEntity', { type: 'entity' });
CoPlayer.attributes.add('camera', { type: 'entity' });
CoPlayer.attributes.add('playerText', { type: 'entity' });
CoPlayer.attributes.add('totemSphereEntity', { type: 'entity' });

CoPlayer.prototype.initialize = function () {
    if (this.app.touch) {
        this.camera.script.coMobileCameraController.enabled = true;
    }
    else {
        this.camera.script.coCameraController.enabled = true;
    }

    this.networkManager = this.app.root.findByName("Network Manager").script.coNetworkManager;
    this.uiManager = this.app.root.findByName("UI Manager").script.coUiManager;

    this.isDead = false;

    let foundCheckPoint = this.physicsEntity.script.coPlayerFlagFounder.findCheckPointEntity();
    let quat;
    if (CoSaveSystem.getItem("CAROBBY_stage") != null || CoSaveSystem.getItem("CAROBBY_stage") != "1" || CoSaveSystem.getItem("CAROBBY_stage") != "0") {
        if (CoSaveSystem.getItem("CAROBBY_stage") > 100)
            CoSaveSystem.setItem("CAROBBY_stage", 100);
        quat = new pc.Quat().setFromEulerAngles(foundCheckPoint.getEulerAngles().x,
            this.getYaw(foundCheckPoint.getRotation()) - 90, foundCheckPoint.getEulerAngles().z);
    }
    else {
        quat = new pc.Quat().setFromEulerAngles(foundCheckPoint.getEulerAngles().x,
            90,
            foundCheckPoint.getEulerAngles().z);
    }

    this.physicsEntity.rigidbody.teleport(this.physicsEntity.script.coPlayerFlagFounder.findCheckPointEntity().getPosition(), quat);
    this.isTotem = false;

    this.app.on("playerRespawned", this.onReset, this);
    this.app.on("playerDied", this.onPlayerDeath, this);
    this.app.on("skill:getTotem", this.getTotem, this);
    this.app.on("skill:TotemEnd", () => {
        this.isTotem = false;
    }, this);

    this.on("destroy", () => {
        this.app.off("playerDied", this.onPlayerDeath, this);
        this.app.off("playerRespawned", this.onReset, this);
        this.app.off("skill:getTotem", this.getTotem, this);
    }, this);
};
CoPlayer.prototype.getTotem = function (quat) {
    this.isTotem = true;

};
CoPlayer.prototype.initPosition = function (quat) {
    this.physicsEntity.rigidbody.teleport(this.physicsEntity.script.coPlayerFlagFounder.findCheckPointEntity().getPosition(), quat);
};

CoPlayer.prototype.getYaw = function (quat) {
    let transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);
    return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
};

CoPlayer.prototype.onPlayerDeath = function () {
    if (this.isTotem == true) {
        this.app.fire("skill:TotemEnd");
        this.isTotem = false;
        return;
    }
    this.app.fire("sound:carSoundDie");
    this.playerText.enabled = false;
    this.physicsEntity.script.vehicle.enabled = false;
    this.physicsEntity.rigidbody.enabled = false;
    let vehicleParent = this.physicsEntity.parent;
    let vehicleGraphic = vehicleParent._children[1];
    vehicleGraphic.enabled = false;

};

CoPlayer.prototype.onReset = function () {
    this.playerText.enabled = true;
    let vehicleParent = this.physicsEntity.parent;
    let vehicleGraphic = vehicleParent.children[1];
    vehicleGraphic.enabled = true;
    let foundCheckPoint = this.physicsEntity.script.coPlayerFlagFounder.findCheckPointEntity();

    this.app.fire("sound:carSoundStart");

    const quat = new pc.Quat().setFromEulerAngles(foundCheckPoint.getEulerAngles().x,
        this.getYaw(foundCheckPoint.getRotation()) + -90, foundCheckPoint.getEulerAngles().z);

    this.physicsEntity.rigidbody.teleport(
        new pc.Vec3(foundCheckPoint.getPosition().x, foundCheckPoint.getPosition().y + 1, foundCheckPoint.getPosition().z), quat);

    this.physicsEntity.script.vehicle.enabled = true;
    this.physicsEntity.rigidbody.linearVelocity = pc.Vec3.ZERO;
    this.physicsEntity.rigidbody.angularVelocity = pc.Vec3.ZERO;
    this.physicsEntity.rigidbody.enabled = true;
    setTimeout(() => { this.isDead = false; }, 100);
};

CoPlayer.prototype.postUpdate = function (dt) {
    this.totemSphereEntity.enabled = this.uiManager.totemParent.enabled;
};