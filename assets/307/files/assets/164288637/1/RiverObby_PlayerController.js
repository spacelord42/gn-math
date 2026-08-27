var RiverObbyPlayerController = pc.createScript('riverObbyPlayerController');

RiverObbyPlayerController.attributes.add("username", { type: "entity" });
RiverObbyPlayerController.attributes.add("body", { type: "entity" });
RiverObbyPlayerController.attributes.add("moveSpeed", { type: "number", default: 6 });
RiverObbyPlayerController.attributes.add("moveSpeedBoat", { type: "number", default: 6 });
RiverObbyPlayerController.attributes.add("jumpHeight", { type: "number", default: 13 });
RiverObbyPlayerController.attributes.add("rotateSpeed", { type: "number", default: 5 });
RiverObbyPlayerController.attributes.add('deadPlayer', { type: 'asset', assetType: 'template' });

RiverObbyPlayerController.prototype.initialize = function () {
    this.entity.isLocal = true;
    this.boatSpeedAdjustments = [
        { scalar: 1 / 10, delay: 200 },
        { scalar: 1 / 8, delay: 400 },
        { scalar: 1 / 5, delay: 600 }
    ];
    this.isDied = false;
    this.networkManager = this.app.root.findByName("NetworkManager").script.riverObbyNetworkManager;
    this.inventoryController = this.entity.script.riverObbyPlayerInventoryController;
    this.playerRendererEntity = this.body.findByName("N00b7.001");
    this.faceSprite = this.body.findByName("FaceSprite");
    this.hats = this.body.findByName("hats");
    this.setCamera();
    this._direction = new pc.Vec3();
    this._contactNormal = new pc.Vec3();
    this._quatLerp = new pc.Quat();
    this._desiredVelocity = new pc.Vec3();
    this._desiredAngle = 0;
    this.maxLinearVelocity = this.moveSpeedBoat;
    this._requestedJump = false;
    this._timeSinceLastJump = 0;
    this._timeSinceLastGrounded = 0;
    this.boatRayNormalRot = new pc.Quat();
    this.isInWater = false;
    this._animComponent = this.body.anim;
    this.sendPositionInterval = setInterval(this.sendPosition.bind(this), 100);
    this.follower = this.entity.findByName("Follower");
    this.waterDust = this.follower.findByName("Dust").particlesystem;
    this.waterDustR = this.follower.findByName("DustR").particlesystem;
    this.waterDustL = this.follower.findByName("DustL").particlesystem;
    this.waterTail = this.follower.findByName("DustTail").particlesystem;
    this.boat = this.entity.findByName("Boat");
    this.kurekL = this.entity.findByName("KurekL");
    this.kurekR = this.entity.findByName("KurekR");
    this.boatWaterSprite = this.follower.findByName("BoatWaterSprite");
    this.boatsInHandParent = this.body.findByName("BoatsInHand");
    this.rayPoint = this.entity.findByName("RayPoint");
    this.respawn();

    this.app.on("lockCamera", this.lockCamera, this);

    this.app.on("Motion:RowPush", this.applyRowForce, this);

    this.entity.collision.on('collisionstart', function (otherEntity) {
        if (otherEntity.other.tags.has("Ladder")) {
            this.isClimbingLadder = true;
            this.isOnLadder = true;
            this._animComponent.setBoolean("isOnLadder", true);
        }
    }, this);
    this.entity.collision.on('collisionend', function (otherEntity) {
        if (otherEntity.tags.has("Ladder")) {
            this.isClimbingLadder = false;
            this.isOnLadder = false;
            this._animComponent.setBoolean("isClimbing", false);
            this._animComponent.setBoolean("isOnLadder", false);
        }
    }, this);

    this.on('destroy', function () {
        clearInterval(this.sendPositionInterval);
        this.app.off("Motion:RowPush", this.applyRowForce, this);
        this.app.off("lockCamera", this.lockCamera, this);
    }, this);
};


var setMat4Forward = (function () {
    var x, y, z;

    x = new pc.Vec3();
    y = new pc.Vec3();
    z = new pc.Vec3();

    return function (mat4, forward, up) {
        // Inverse the forward direction as +z is pointing backwards due to the coordinate system
        z.copy(forward).scale(-1);
        y.copy(up).normalize();
        x.cross(y, z).normalize();
        y.cross(z, x);

        var r = mat4.data;

        r[0] = x.x;
        r[1] = x.y;
        r[2] = x.z;
        r[3] = 0;
        r[4] = y.x;
        r[5] = y.y;
        r[6] = y.z;
        r[7] = 0;
        r[8] = z.x;
        r[9] = z.y;
        r[10] = z.z;
        r[11] = 0;
        r[15] = 1;

        return mat4;
    };
}());

RiverObbyPlayerController.prototype.adjustLinearVelocity = function (scalar, delay) {
    setTimeout(() => {
        this.entity.rigidbody.linearVelocity = this.entity.rigidbody.linearVelocity.add(this._desiredVelocity.clone().mulScalar(scalar));

        // Check and limit the linear velocity
        if (this.entity.rigidbody.linearVelocity.length() > this.maxLinearVelocity) {
            this.entity.rigidbody.linearVelocity = this.entity.rigidbody.linearVelocity.normalize().scale(this.maxLinearVelocity);
        }
    }, delay);
};

RiverObbyPlayerController.prototype.applyRowForce = function () {
    // boat apply force
    this.adjustLinearVelocity(1 / 12, 0);
    this.boatSpeedAdjustments.forEach(adjustment => {
        this.adjustLinearVelocity(adjustment.scalar, adjustment.delay);
    });

    let boatWaterSpriteClone = this.boatWaterSprite.clone();
    this.app.root.addChild(boatWaterSpriteClone);
    boatWaterSpriteClone.enabled = true;
    boatWaterSpriteClone.setPosition(this.boatWaterSprite.getPosition());
    boatWaterSpriteClone.script.riverObbyWaveEffect.destroy = true;
    boatWaterSpriteClone.script.riverObbyWaveEffect.startEffect();

    setTimeout(() => {
        boatWaterSpriteClone = this.boatWaterSprite.clone();
        this.app.root.addChild(boatWaterSpriteClone);
        boatWaterSpriteClone.enabled = true;
        boatWaterSpriteClone.setPosition(this.boatWaterSprite.getPosition());
        boatWaterSpriteClone.script.riverObbyWaveEffect.destroy = true;
        boatWaterSpriteClone.script.riverObbyWaveEffect.startEffect();
    }, 500);

    this.waterDust.reset();
    this.waterDust.play();
    this.waterDustL.reset();
    this.waterDustL.play();
    this.waterDustR.reset();
    this.waterDustR.play();
};

RiverObbyPlayerController.prototype.boatController = function (dt) {
    this._direction.set(0, 0, 0);
    if (this.isDied == false) {
        joystick = window.touchJoypad.sticks['joystick0'];
        if (this.app.isMobile) {
            if (joystick.y > 0) {
                this._direction.add(this.camera.forward);
            } else if (joystick.y < 0) {
                this._direction.add(this.camera.forward.mulScalar(-1));
            }
            if (joystick.x > 0) {
                this._direction.add(this.camera.right);
            } else if (joystick.x < 0) {
                this._direction.add(this.camera.right.mulScalar(-1));
            }
            if (window.touchJoypad.buttons.wasPressed('jumpButton')) {
                this._requestedJump = true;
            }
        } else {
            if (this.app.keyboard.isPressed(pc.KEY_SPACE)) {
                this._requestedJump = true;
                this.sdkGamePlayStart();
            }
            if (this.app.keyboard.isPressed(pc.KEY_W) || this.app.keyboard.isPressed(pc.KEY_UP)) {
                this._direction.add(this.camera.forward);
                this.sdkGamePlayStart();
            }
            else if (this.app.keyboard.isPressed(pc.KEY_S) || this.app.keyboard.isPressed(pc.KEY_DOWN)) {
                this._direction.sub(this.camera.forward);
                this.sdkGamePlayStart();
            }
            if (this.app.keyboard.isPressed(pc.KEY_A) || this.app.keyboard.isPressed(pc.KEY_LEFT)) {
                this._direction.sub(this.camera.right);
                this.sdkGamePlayStart();

            } if (this.app.keyboard.isPressed(pc.KEY_D) || this.app.keyboard.isPressed(pc.KEY_RIGHT)) {
                this._direction.add(this.camera.right);
                this.sdkGamePlayStart();
            }
        }
    }

    this._direction.y = 0;

    const rayStart = this.entity.getPosition().clone();
    const rayEnd = rayStart.clone().sub(new pc.Vec3(0, 1.25, 0));

    let result = this.app.systems.rigidbody.raycastFirst(rayStart, rayEnd);
    this.grounded = false;
    if (result) {
        if (result.entity.tags.has("Ground")) {
            this.grounded = true;
            this.exitBoat();
            return;
        }

        let m = new pc.Mat4();
        this.boatRayNormalRot = new pc.Quat();
        //speed yerindeyken stabil dursun diye
        if (!result.entity.tags.has("Speed")) {
            // Make the boat entity point in the direction of the hit normal
            setMat4Forward(m, result.normal, pc.Vec3.UP);
        }
        this.boatRayNormalRot.setFromMat4(m);
    }

    const rayStart2 = this.entity.getPosition().clone();
    const rayEnd2 = rayStart2.clone().add(this.rayPoint.forward.mulScalar(-5));
    result = this.app.systems.rigidbody.raycastFirst(rayStart2, rayEnd2);
    this.app.renderLine(rayStart2, rayEnd2, new pc.Color(1, 1, 1));
    this.hitSomethingFront = false;
    if (result) {
        if (result.entity.tags.has("Water")) {
            this.hitSomethingFront = true;
        } else {
        }
    }

    //this._desiredVelocity = this._direction.normalize().clone().mulScalar(this.moveSpeedBoat);
    this._desiredVelocity = this.body.forward.normalize().clone().mulScalar(this.moveSpeedBoat).mulScalar(-this._direction.length());
    if (this._desiredVelocity.length() > 0) {
        this._animComponent.setBoolean("isRowing", true);
        this.kurekL.fire("Motion", "Row");
        this.kurekR.fire("Motion", "Row");

        this._desiredAngle = Math.atan2(this._direction.x, this._direction.z) * pc.math.RAD_TO_DEG;

    } else {
        this._animComponent.setBoolean("isRowing", false);
        this.boatWaterSprite.script.riverObbyWaveEffect.startEffect();
    }

    let targetQuat;
    if (this.boatRayNormalRot.getEulerAngles().x > 0) {
        if (this.hitSomethingFront) {
            targetQuat = new pc.Quat().setFromEulerAngles(this.boatRayNormalRot.getEulerAngles().x - 90, this._desiredAngle, 0);
        } else {
            targetQuat = new pc.Quat().setFromEulerAngles(90 - this.boatRayNormalRot.getEulerAngles().x, this._desiredAngle, 0);
        }
    } else if (this.boatRayNormalRot.getEulerAngles().x < 0) {
        targetQuat = new pc.Quat().setFromEulerAngles(this.boatRayNormalRot.getEulerAngles().x + 90, this._desiredAngle, 0);
    } else {
        targetQuat = new pc.Quat().setFromEulerAngles(this.boatRayNormalRot.getEulerAngles().x, this._desiredAngle, 0);
    }

    this._quatLerp = new pc.Quat().slerp(this._quatLerp, targetQuat, this.rotateSpeed * dt);
    this.body.setRotation(this._quatLerp);
    this.rayPoint.setRotation(new pc.Quat().setFromEulerAngles(0, this._desiredAngle, 0));

    this._desiredVelocity.y += this.entity.rigidbody.linearVelocity.y;
    const velocityDotNormal = this._desiredVelocity.clone().normalize().dot(this._contactNormal);
    if (velocityDotNormal > 0 && !this._jumped) {
        this._desiredVelocity.sub(this._contactNormal.clone().mulScalar(velocityDotNormal * this._desiredVelocity.length()));
    }

    if (this.entity.rigidbody.linearVelocity.length() > 0) {
        this.waterTail.play();
    } else {
        this.waterTail.stop();
    }

    //extra gravity
    this._desiredVelocity.set(this._desiredVelocity.x, this._desiredVelocity.y - 30 * dt, this._desiredVelocity.z);
};

RiverObbyPlayerController.prototype.playerController = function (dt) {
    this._direction.set(0, 0, 0);
    this._requestedJump = false;

    this._timeSinceLastJump += dt;
    this._timeSinceLastGrounded += dt;

    if (this.isDied == false) {
        joystick = window.touchJoypad.sticks['joystick0'];
        if (this.app.isMobile) {
            if (joystick.y > 0) {
                this._direction.add(this.camera.forward);
            } else if (joystick.y < 0) {
                this._direction.add(this.camera.forward.mulScalar(-1));
            }
            if (joystick.x > 0) {
                this._direction.add(this.camera.right);
            } else if (joystick.x < 0) {
                this._direction.add(this.camera.right.mulScalar(-1));
            }
            if (window.touchJoypad.buttons.wasPressed('jumpButton')) {
                this._requestedJump = true;
            }
        } else {
            if (this.app.keyboard.isPressed(pc.KEY_SPACE)) {
                this._requestedJump = true;
                this.sdkGamePlayStart();
            }
            if (this.app.keyboard.isPressed(pc.KEY_W) || this.app.keyboard.isPressed(pc.KEY_UP)) {
                this._direction.add(this.camera.forward);
                this.sdkGamePlayStart();

            }
            else if (this.app.keyboard.isPressed(pc.KEY_S) || this.app.keyboard.isPressed(pc.KEY_DOWN)) {
                this._direction.sub(this.camera.forward);
                this.sdkGamePlayStart();
            }
            if (this.app.keyboard.isPressed(pc.KEY_A) || this.app.keyboard.isPressed(pc.KEY_LEFT)) {
                this._direction.sub(this.camera.right);
                this.sdkGamePlayStart();

            } if (this.app.keyboard.isPressed(pc.KEY_D) || this.app.keyboard.isPressed(pc.KEY_RIGHT)) {
                this._direction.add(this.camera.right);
                this.sdkGamePlayStart();
            }
        }

        this._direction.y = 0;

        const rayStart = this.entity.getPosition().clone();
        const rayEnd = rayStart.clone().sub(new pc.Vec3(0, 1.25, 0));

        const _rayResults = [
            this.app.systems.rigidbody.raycastFirst(rayStart, rayEnd),
            this.app.systems.rigidbody.raycastFirst(rayStart, rayEnd.clone().add(new pc.Vec3(0.5, 0, 0.5))),
            this.app.systems.rigidbody.raycastFirst(rayStart, rayEnd.clone().add(new pc.Vec3(0.5, 0, -0.5))),
            this.app.systems.rigidbody.raycastFirst(rayStart, rayEnd.clone().add(new pc.Vec3(-0.5, 0, 0.5))),
            this.app.systems.rigidbody.raycastFirst(rayStart, rayEnd.clone().add(new pc.Vec3(-0.5, 0, -0.5)))
        ];

        this.grounded = false;

        for (const result of _rayResults) {
            if (result) {
                if (result.entity.tags.has("Ground")) {
                    this._contactNormal = result.normal.clone();
                    this._timeSinceLastGrounded = 0;
                    this.grounded = true;
                    if (this._timeSinceLastJump >= 0.3) {
                        this._jumped = false;
                        this._animComponent.setBoolean("isInAir", false);
                    }
                    this._animComponent.setBoolean("isInWater", false);
                    this.boat.enabled = false;
                    break; // Exit the loop if grounded
                } else if (result.entity.tags.has("Water")) {
                    this.enterBoat();
                    this._desiredVelocity = this.boat.forward.clone().mulScalar(-10);
                    this.applyRowForce();
                    return;
                }
            }
        }

        if (!this.grounded) {
            this._contactNormal = new pc.Vec3(0, 1, 0);
            this._animComponent.setBoolean("isInAir", true);
        }
    }

    this._desiredVelocity = this._direction.normalize().clone().mulScalar(this.moveSpeed);
    if (this._desiredVelocity.length() > 0) {
        this._desiredAngle = Math.atan2(this._direction.x, this._direction.z) * pc.math.RAD_TO_DEG;
        const targetQuat = new pc.Quat().setFromEulerAngles(0, this._desiredAngle, 0);
        this._quatLerp = new pc.Quat().slerp(this._quatLerp, targetQuat, this.rotateSpeed * dt);
        this.body.setRotation(this._quatLerp);
        this.rayPoint.setRotation(new pc.Quat().setFromEulerAngles(0, this._desiredAngle, 0));
    }

    this._desiredVelocity.y += this.entity.rigidbody.linearVelocity.y;
    const velocityDotNormal = this._desiredVelocity.clone().normalize().dot(this._contactNormal);
    if (velocityDotNormal > 0 && !this._jumped) {
        this._desiredVelocity.sub(this._contactNormal.clone().mulScalar(velocityDotNormal * this._desiredVelocity.length()));
    }

    if (this.isClimbingLadder == true) {
        if (this.app.keyboard.isPressed(pc.KEY_W) || this.app.keyboard.isPressed(pc.KEY_UP) || (this.app.isMobile && joystick.y > 0)) {
            const temp = this.body.up.mulScalar(15);
            this._desiredVelocity.set(this._desiredVelocity.x, 0, this._desiredVelocity.z);
            this._desiredVelocity.add(temp);
            this._desiredVelocity = this._desiredVelocity.normalize().mulScalar(6);
            this._animComponent.setBoolean("isClimbing", true);
        } else {
            this._desiredVelocity.set(this._desiredVelocity.x, 0, this._desiredVelocity.z);
            this._animComponent.setBoolean("isClimbing", false);
        }

        if (this._requestedJump) {
            const temp = this.body.up.clone().add(this.body.forward.mulScalar(4));
            this._desiredVelocity.add(temp.normalize().mulScalar(this.jumpHeight));
        }
    } else {
        //jump
        if (this.entity.jumpPlatform || (this._requestedJump && this._timeSinceLastGrounded <= 0.3 && !this._jumped)) {
            this._jumped = true;
            this.entity.jumpPlatform = false;
            this._timeSinceLastJump = 0;
            this._desiredVelocity.add(this._contactNormal.clone().mulScalar(this.jumpHeight));
            if (this._requestedJump) {
                this.entity.fire('jump');
            }
        }
        //extra gravity
        if (!this.entity.isBallon)
            this._desiredVelocity.set(this._desiredVelocity.x, this._desiredVelocity.y - 30 * dt, this._desiredVelocity.z);
    }

    this.entity.rigidbody.linearVelocity = this._desiredVelocity;

    if (this._direction.x != 0 || this._direction.y != 0 || this._direction.z != 0) {
        this._animComponent.setBoolean("walk", true);
    } else {
        this._animComponent.setBoolean("walk", false);
    }
};

RiverObbyPlayerController.prototype.enterBoat = function () {
    this.networkManager.jumpButton.enabled = false;
    this.isInWater = true;
    this.boat.enabled = true;
    this._animComponent.setBoolean("isInWater", true);
    this.entity.rigidbody.linearVelocity = new pc.Vec3();
    this.rotateSpeed = 3;
    this.boatWaterSprite.enabled = true;
    this.boatsInHandParent.enabled = false;
};

RiverObbyPlayerController.prototype.exitBoat = function () {
    this.networkManager.jumpButton.enabled = true;
    this._animComponent.setBoolean("isInWater", false);
    this.waterTail.stop();
    this.isInWater = false;
    this.boat.enabled = false;
    this.rotateSpeed = 13;
    this.boatWaterSprite.enabled = false;
    this.boatsInHandParent.enabled = true;
};

RiverObbyPlayerController.prototype.update = function (dt) {
    if (this.app.keyboard.wasPressed(pc.KEY_R)) {
        this.died();
        return;
    }
    this._animComponent.setBoolean("isSitting", true);
    if (this.isInWater) {
        this.boatController(dt);
        //this.entity.rigidbody.applyForce(this.boat.forward.mulScalar(-3 * this.entity.rigidbody.linearVelocity.length()));
    } else {
        this.playerController(dt);
    }
    this.follower.setPosition(this.boat.getPosition());
    this.follower.setRotation(this.boat.getRotation());

    if (this.entity.getPosition().y < -5) {
        this.died();
    }
};
RiverObbyPlayerController.prototype.sdkGamePlayStart = function () {
    if (this.app.gamePlayStart || this.isDied || this.app.isWatchingAd) return;
    this.app.gamePlayStart = true;
    PokiSDK.gameplayStart();
};
//Only gets y euler angle between -180, 180
RiverObbyPlayerController.prototype.getYaw = function (quat) {
    let transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);
    return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
};

RiverObbyPlayerController.prototype.sendPosition = function () {
    if (this.networkManager.room == null || this.networkManager.room.connection.isOpen === false) return;
    this.networkManager.room.send("Client:Movement", {
        x: this.entity.getPosition().x,
        y: this.entity.getPosition().y,
        z: this.entity.getPosition().z,
        rotationY: this.getYaw(this.body.getRotation()),
        grounded: this.grounded,
        isWalking: this._animComponent.getBoolean("walk"),
        isClimbing: this._animComponent.getBoolean("isClimbing"),
        isOnLadder: this._animComponent.getBoolean("isOnLadder"),
    });
};

RiverObbyPlayerController.prototype.setCamera = function () {
    this.camera = this.app.root.findByName('Camera');
    this.cameraPosEntity = this.entity.findByName('CameraPosition');
    this.cameraParent = this.entity.findByName('Camera Axis');
    this.cameraParent.addChild(this.camera);
    this.camera.setLocalPosition(this.cameraPosEntity.getLocalPosition());
    if (this.app.isMobile) {
        this.cameraScript = this.camera.script.riverObbyMobileCameraController;
    } else {
        this.cameraScript = this.camera.script.riverObbyCameraController;
    }
    this.cameraScript.enabled = true;
    this.cameraScript.resetCamera();
    this._frameMovementRight = new pc.Vec3();
    this._frameMovementForward = new pc.Vec3();
    this._frameMovementTotal = new pc.Vec3();
};

RiverObbyPlayerController.prototype.died = function () {
    if (this.isDied || this.canDie == false) return;
    if (this.app.gameplayStart) {
        this.app.gameplayStart = false
        PokiSDK.gameplayStop();
    }
    let commercialBreakCounter = Date.now();
    PokiSDK.commercialBreak(() => {
        // you can pause any background music or other audio here
        this.app.systems.sound.volume = 0;
    }).then(async () => {
        this.app.systems.sound.volume = 1;
        this.app.isWatchingAd = false;

        if (Date.now() - commercialBreakCounter > 1000) {
            gameanalytics.GameAnalytics.addAdEvent(
                gameanalytics.EGAAdAction.Show,
                gameanalytics.EGAAdType.Interstitial,
                "EscapeFromSchool",
                "Died"
            );
        }

        this.app.systems.sound.volume = 1;
    });
    this.app.fire("MarketClose");

    const deadPlayerEntity = this.deadPlayer.resource.instantiate();
    const playerPos = this.entity.getPosition().clone();
    this.app.root.addChild(deadPlayerEntity);
    deadPlayerEntity.setPosition(playerPos.x, playerPos.y, playerPos.z);
    deadPlayerEntity.setRotation(this.body.getRotation().clone());
    const deadPlayerEntityBody = deadPlayerEntity.children[0];
    this.playerRendererEntity.enabled = false;
    deadPlayerEntityBody.enabled = true;
    for (let i = 0; i < deadPlayerEntityBody.children.length; i++) {
        deadPlayerEntityBody.children[i].rigidbody.applyImpulse(this.body.forward.scale(-pc.math.random(0, 1)));
    }
    this.spawnedDeadBody = deadPlayerEntity;
    this.isDied = true;
    this.app.isDied = true;

    this.faceSprite.enabled = false;
    this.hats.enabled = false;
    this.networkManager.diedEffect();
    this.entity.collision.enabled = false;
    this.entity.rigidbody.type = "kinematic";
    if (this.networkManager.room)
        this.networkManager.room.send("Client:Died");
    this.lockCamera(true);
};

RiverObbyPlayerController.prototype.respawn = function () {
    this.canDie = false;
    setTimeout(() => { this.canDie = true; }, 1000);
    this.body.setRotation(new pc.Quat());
    this.sdkGamePlayStart();

    this.exitBoat();
    this.playerRendererEntity.enabled = true;
    this.faceSprite.enabled = true;
    this.hats.enabled = true;
    this.isDied = false;
    this.app.isDied = false;
    if (this.spawnedDeadBody)
        this.spawnedDeadBody.destroy();
    //const targetStage = this.networkManager.stagesParent.children[this.app.currentStage];
    this.entity.collision.enabled = true;
    this.entity.rigidbody.type = "dynamic"
    this.teleport();

    setTimeout(() => { this.cameraScript.reset(); }, 100);
    if (this.networkManager.room) {
        this.networkManager.room.send("Client:Respawn");
    }
    this.lockCamera(false);
};

RiverObbyPlayerController.prototype.teleport = function () {
    this.lastSavePoint = this.networkManager.savePoints.children[this.app.currentStage].children[1];
    this.entity.rigidbody.teleport(this.lastSavePoint.getPosition());
    this._desiredAngle = this.getYaw(this.lastSavePoint.getRotation());
};

RiverObbyPlayerController.prototype.lockCamera = function (state = false) {
    if (state) {
        this.cameraScript.removeEventCallbacks();
        this.app.mouse.disablePointerLock();
    } else {
        this.cameraScript.addEventCallbacks();
        this.app.mouse.enablePointerLock();
    }
}