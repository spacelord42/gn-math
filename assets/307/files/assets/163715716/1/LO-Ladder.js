var LoLadder = pc.createScript('loLadder');
LoLadder.attributes.add("redMaterial", { type: "asset", assetType: "material" })


// initialize code called once per entity
LoLadder.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.loNetworkManager;
    this.isUseLadder = false;
    this.nLadder = true;
    this.player = this.app.root.findByName("Player");
    this.meshInstance = this.entity.children[0].render.meshInstances[0];
    this.defaultMaterial = this.meshInstance.material;
    this.outline = this.entity.findByName("Outline");
    this.entity.findByName("triggerEntity").collision.on("triggerenter", this.usingLadder, this);
    this.entity.findByName("triggerEntity").collision.on("triggerleave", this.triggerLeave, this);

    this.tempDefauldHalfExtent = this.entity.collision.halfExtents.clone();
    this.tempUpgardedHalfExtent = new pc.Vec3(0.706, 0.287, 3.669);
    this.defauldHalfExtent = this.entity.collision.halfExtents.clone();

    this.tempDefauldPositionOffset = this.entity.collision.linearOffset.clone();
    this.tempUpgardedPositionOffset = new pc.Vec3(0.02, 0.125, 2.725);
    //his.app.on("OnUseLadder", this.usingLadder, this);
    this.isFall = false;
    this.entity.rigidbody.angularDamping = 1;
    this.entity.specialLadder = true;
    this.sendPositionInterval = setInterval(this.sendLadderTransform.bind(this), 100);


    this.app.ladderDistace = 5;


    this.app.on("PowerUpTallLadder", this.upgradedTallLadder, this);
    this.app.on("NanTallLadder", this.nanTallLadder, this);

    this.on('destroy', function () {
        this.app.off("PowerUpTallLadder", this.upgradedTallLadder, this);
        this.app.off("NanTallLadder", this.nanTallLadder, this);

        //clearInterval(this.sendPositionInterval);
    }, this);
};
LoLadder.prototype.upgradedTallLadder = function () {
    if (this.entity.tags.has("Ladder")) {
        this.entity.collision.halfExtents = this.tempUpgardedHalfExtent;
    }
    this.app.ladderDistace = 8;

    this.outline = this.entity.findByName("OutlineA");

    this.entity.collision.linearOffset = this.tempUpgardedPositionOffset;

    this.defauldHalfExtent = this.tempUpgardedHalfExtent;
    this.entity.findByName("UpgradeLadder").enabled = true;
};
LoLadder.prototype.nanTallLadder = function () {
    if (this.entity.tags.has("Ladder")) {
        this.entity.collision.halfExtents = this.tempDefauldHalfExtent;
    }
    this.app.ladderDistace = 5;
    this.outline.enabled = false;
    this.outline = this.entity.findByName("Outline");

    this.defauldHalfExtent = this.tempDefauldHalfExtent;

    this.entity.collision.linearOffset = this.tempDefauldPositionOffset;

    this.entity.findByName("UpgradeLadder").enabled = false;
    //this.entity.collision.halfExtents = new pc.Vec3(0, 0, 0);
};
LoLadder.prototype.update = function () {
    //this.usingLadder(true);
    if (this.player.getPosition().clone().distance(this.entity.getPosition().clone()) > 7) {
        this.app.isRewardedLadder = true;
    }
    else {
        this.app.isRewardedLadder = false;
    }
};
// update code called every frame
LoLadder.prototype.usingLadder = function (result) {
    if (result.tags.has("Player"))
        if (!this.player.script.loPlayerController._animComponent.getBoolean("isClimbing")) {
            this.entity.rigidbody.angularFactor = new pc.Vec3(1, 1, 1);
            this.entity.rigidbody.linearFactor = new pc.Vec3(1, 1, 1);
            this.entity.rigidbody.angularDamping = 0.2;

        }
        else {
            this.entity.rigidbody.angularFactor = new pc.Vec3(0, 0, 0);
            this.entity.rigidbody.linearFactor = new pc.Vec3(0, 0, 0);
            this.entity.rigidbody.angularDamping = 1;
        }

    //this.isFall = this.hasFalling();
};
LoLadder.prototype.triggerLeave = function (result) {
    if (result.tags.has("Player")) {
        this.entity.rigidbody.angularDamping = 0.2;
        this.entity.rigidbody.angularFactor = new pc.Vec3(1, 1, 1);
        this.entity.rigidbody.linearFactor = new pc.Vec3(1, 1, 1);
    }

};

LoLadder.prototype.hasFalling = function () {
    if (this.entity.rigidbody.angularVelocity.distance(new pc.Vec3(0, 0, 0) > 0))
        return true;

    return false;
};
LoLadder.prototype.triggerEnter = function (result) {
    this.triggered = true;
    /*
    if (result)
        if (result.tags.has("Player"))
            if (result.script.loPlayerController._animComponent.getBoolean("isInAir")) {
                console.log("sa");
                //this.entity.rigidbody.applyForce(this.entity.forward.clone().scale(50000));
                this.entity.rigidbody.angularDamping = 0;
                this.entity.rigidbody.linearDamping = 1;

            }*/
};

LoLadder.prototype.stop = function () {
    this.isUseLadder = false;
};
LoLadder.prototype.materialHalfOpacity = function () {
    this.player.collision.fire("collisionend", this.entity);
    this.defaultMaterial = this.meshInstance.material;
    this.meshInstance.material = this.redMaterial.resource;
    this.entity.tags.remove("Ladder")
    this.entity.rigidbody.type = "kinematic";
    this.entity.collision.halfExtents = new pc.Vec3(0, 0, 0);
    this.app.ladderUsing = false;
    this.nLadder = false;
};
LoLadder.prototype.materialDefauld = function () {
    this.meshInstance.material = this.defaultMaterial;
    this.app.ladderUsing = true;
    this.nLadder = true;
    this.entity.tags.add("Ladder");
    this.entity.tags.add("LGround");
    //this.entity.rigidbody.enabled = true;
    this.entity.rigidbody.type = "dynamic";
    this.entity.collision.halfExtents = this.defauldHalfExtent;
    this.entity.rigidbody.angularDamping = 1;
    this.entity.rigidbody.angularVelocity = new pc.Vec3(0, 0, 0);
    this.entity.rigidbody.linearVelocity = new pc.Vec3(0, 0, 0);
    //this.entity.rigidbody.angularDamping = 1;

};
LoLadder.prototype.setOutline = function (value) {
    this.outline.enabled = value;
};
LoLadder.prototype.sendLadderTransform = function () {
    if (this.networkManager.room == null || this.networkManager.room.connection.isOpen === false) return;
    let enabled;
    if (this.nLadder)
        enabled = true;
    else
        enabled = false;
    this.networkManager.room.send("SendLadderPosition", {
        x: this.entity.getPosition().x,
        y: this.entity.getPosition().y,
        z: this.entity.getPosition().z,
        rx: this.entity.getRotation().x,
        ry: this.entity.getRotation().y,
        rz: this.entity.getRotation().z,
        rw: this.entity.getRotation().w,
        enabled: enabled
        /*
        grounded: this.grounded,
        isWalking: this._animComponent.getBoolean("walk"),
        isClimbing: this._animComponent.getBoolean("isClimbing"),
        isOnLadder: this._animComponent.getBoolean("isOnLadder"),*/
    });
};
LoLadder.prototype.getXaw = function (quat) {
    let transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);
    return Math.atan2(-transformedForward.y, -transformedForward.z) * pc.math.RAD_TO_DEG;
};
LoLadder.prototype.getYaw = function (quat) {
    let transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);
    return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
};
LoLadder.prototype.getZaw = function (quat) {
    let transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);
    return Math.atan2(-transformedForward.x, -transformedForward.y) * pc.math.RAD_TO_DEG;
};