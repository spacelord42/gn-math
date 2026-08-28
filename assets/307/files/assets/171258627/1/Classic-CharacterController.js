/*ClassicCharacterController script that handles local player movement controls by Emre Şahin - emolingo games */
var ClassicCharacterController = pc.createScript('classicCharacterController');

ClassicCharacterController.attributes.add("username", { type: "entity" });
ClassicCharacterController.attributes.add("body", { type: "entity" });
ClassicCharacterController.attributes.add("moveSpeed", { type: "number", default: 6 });
ClassicCharacterController.attributes.add("jumpHeight", { type: "number", default: 13 });
ClassicCharacterController.attributes.add("rotateSpeed", { type: "number", default: 5 });
ClassicCharacterController.attributes.add('deadPlayer', { type: 'asset', assetType: 'template' });
ClassicCharacterController.attributes.add('chestRewarded', { type: "entity" });
ClassicCharacterController.attributes.add('handCarpet', { type: "entity" });

ClassicCharacterController.prototype.initialize = function () {
    this.timer = this.app.root.findByName("Timer");
    this.entity.isLocal = true;
    this.isDied = false;
    this.networkManager = this.app.root.findByName("NetworkManager").script.classicNetworkManager;
    this.inventoryController = this.entity.script.inventoryController;
    this.playerRendererEntity = this.body.findByName("N00b7.001");
    this.faceSprite = this.body.findByName("FaceSprite");
    this.hats = this.body.findByName("hats");
    this.setCamera();
    this._direction = new pc.Vec3();
    this._contactNormal = new pc.Vec3();
    this._quatLerp = new pc.Quat();
    this._desiredVelocity = new pc.Vec3();
    this._carpetVelocity = new pc.Vec3();
    this._desiredAngle = 0;
    this._requestedJump = false;
    this._timeSinceLastJump = 0;
    this._timeSinceLastGrounded = 0;
    this.isSliding = false;
    this._animComponent = this.body.anim;
    this.sendPositionInterval = setInterval(this.sendPosition.bind(this), 100);
    this.respawn(true);
    this.app.shiftLock = true;

    this.carpetButton = this.app.root.findByName("Touch Button2");

    this.firstInput = false;


    if (this.app.touch)
        this.app.isMobile = true;
    else
        this.app.isMobile = false

    /*
        this.app.on('EnterFPS', function () {
            this.playerRendererEntity.enabled = true;
            this.username.enabled = false;
            this.faceSprite.enabled = false;
            this.hats.enabled = false;
        }, this);
    
        this.app.on('ExitFPS', function () {
            this.playerRendererEntity.enabled = true;
            this.username.enabled = true;
            //this.faceSprite.enabled = true;
            //this.hats.enabled = true;
        }, this);
    
        const isFPSLocalStorage = Utils.getItem("isFPS");
        if (isFPSLocalStorage == "true") {
            this.app.fire("EnterFPS");
        }
        else if (isFPSLocalStorage == null) {
            this.app.fire("EnterFPS");
        } else {
            this.app.fire("ExitFPS");
        }
    */
    this.carpetButton.enabled = false;
    this.soundComponent = this.entity.findByName("Sound").sound;

    this.app.on("SkipStage", this.skipStage, this);

    this.app.on("lockCamera", this.lockCamera, this);

    this.app.on("RespawnButton", this.respawn, this)

    this.app.on("OnPortal", this.onPortal, this)


    this._animComponent.on("step1", () => {
        const rand = Math.floor(Math.random() * 3) + 1;

        this.soundComponent.play("Walking " + rand);
    });
    this._animComponent.on("step2", () => {
        const rand = Math.floor(Math.random() * 3) + 1;

        this.soundComponent.play("Walking " + rand);
    });


    this.entity.collision.on('collisionstart', function (otherEntity) {
        if (otherEntity.other.tags.has("ladder") || otherEntity.other.tags.has("lLadder")) {
            this.isClimbingLadder = true;
            this.isOnLadder = true;
            this._animComponent.setBoolean("isClimbing", true);
            this.app.isOnLadder = true;
            this.app.fire("OnUseLadder", true);
        }
    }, this);
    this.entity.collision.on('collisionend', function (otherEntity) {
        if (otherEntity.tags.has("ladder") || otherEntity.tags.has("lLadder")) {
            this.isClimbingLadder = false;
            this.isOnLadder = false;
            this._animComponent.setBoolean("isClimbing", false);
            this._animComponent.setBoolean("isOnLadder", false);
            this.app.isOnLadder = false;
            this.app.fire("OnUseLadder", false);
        }
    }, this);
    this.playerHealt = 100;
    this.app.on("PlayerTakeDamage", this.takeDamage, this);
    this.app.on("Classic-ChestRewarded", this.onChest, this);
    this.app.on("Classic-disebledCarpet", this.disebledCarpet, this);
    this.app.on("SetUsername", this.setUsername, this);
    this.on('destroy', function () {
        this.app.off('EnterFPS');
        this.app.off('ExitFPS');
        clearInterval(this.sendPositionInterval);
        this.app.off("lockCamera", this.lockCamera, this);
        this.app.off("PlayerTakeDamage", this.takeDamage, this);
        this.app.off("Classic-ChestRewarded", this.onChest, this);
        this.app.off("Classic-disebledCarpet", this.disebledCarpet, this);
        this.app.off("SetUsername", this.setUsername, this);


        this.app.off("SkipStage", this.skipStage, this);
        this.app.off("RespawnButton", this.respawn, this)
        this.app.off("OnPortal", this.onPortal, this)
    }, this);
};
ClassicCharacterController.prototype.setUsername = function (text) {
    this.username.element.text = text;
};

ClassicCharacterController.prototype.onChest = function () {
    this.chestRewarded.enabled = true;
    this.isCarpet = true;
    this.ownCarpet = true;

    if (this.networkManager.room) {
        this.networkManager.room.send("flyingCarpetActive", true);
        this.networkManager.room.send("hasFlyingCarpet", false);
    }

    if (this.app.touch)
        this.carpetButton.enabled = true;
};
ClassicCharacterController.prototype.disebledCarpet = function () {
    this.chestRewarded.enabled = false;
    this.handCarpet.enabled = false;
    this.isCarpet = false;
    this.ownCarpet = false;
    this.carpetButton.enabled = false;
    if (this.networkManager.room) {
        this.networkManager.room.send("flyingCarpetActive", false);
        this.networkManager.room.send("hasFlyingCarpet", false);
    }

};
ClassicCharacterController.prototype.onPortal = function (value, to) {
    if (!to)
        this.entity.rigidbody.teleport(this.app.allStage[this.app.currentCheckPoint + value].getPosition().clone().add(new pc.Vec3(0, 5, 0)))
    else
        this.entity.rigidbody.teleport(this.app.allStage[value].getPosition().clone().add(new pc.Vec3(0, 5, 0)))
    this.app.fire("Classic-disebledCarpet");
};
ClassicCharacterController.prototype.takeDamage = function (fall = false) {
    this.died(fall);
};
ClassicCharacterController.prototype.update = function (dt) {
    if (this.app.keyboard.wasPressed(pc.KEY_R)) {
        this.died();
        return;
    }
    if (this.app.keyboard.wasPressed(pc.KEY_E)) {
        if (this.ownCarpet) {
            if (this.isCarpet) {
                this.chestRewarded.enabled = false;
                this.handCarpet.enabled = true;
                this.isCarpet = false;

                if (this.networkManager.room) {
                    this.networkManager.room.send("flyingCarpetActive", false);
                    this.networkManager.room.send("hasFlyingCarpet", true);
                }
            }
            else {
                this.chestRewarded.enabled = true;
                this.handCarpet.enabled = false;
                this.isCarpet = true;


                if (this.networkManager.room) {
                    this.networkManager.room.send("flyingCarpetActive", true);
                    this.networkManager.room.send("hasFlyingCarpet", false);
                }
            }
        }
    }
    if (window.touchJoypad.buttons.wasPressed('carpetButton')) {
        if (this.ownCarpet) {
            if (this.isCarpet) {
                this.chestRewarded.enabled = false;
                this.handCarpet.enabled = true;
                this.isCarpet = false;

                if (this.networkManager.room) {
                    this.networkManager.room.send("flyingCarpetActive", false);
                    this.networkManager.room.send("hasFlyingCarpet", true);
                }
            }
            else {
                this.chestRewarded.enabled = true;
                this.handCarpet.enabled = false;
                this.isCarpet = true;

                if (this.networkManager.room) {
                    this.networkManager.room.send("flyingCarpetActive", true);
                    this.networkManager.room.send("hasFlyingCarpet", false);
                }
            }
        }
    };
    if (!this.isDied && this.entity.getPosition().y < -10) {
        this.died(true);
        return;
    }
    if (this.app.keyboard.wasPressed(pc.KEY_SHIFT)) {/*
        if (this.app.shiftLock)
            this.app.shiftLock = false;
        else
            this.app.shiftLock = true;*/
    }
    if (this.isSliding == false)
        this._direction.set(0, 0, 0);

    this._carpetVelocity.set(0, 0, 0)
    this._requestedJump = false;
    this.isRocket = false;
    this._timeSinceLastJump += dt;
    this._timeSinceLastGrounded += dt;

    if (this.isDied == false && this.app.isWatchingAd == false) {
        if (this.isSliding == false) {
            joystick = window.touchJoypad.sticks['joystick0'];
            if (this.app.isMobile) {
                if (joystick.y > 0) {
                    this.sdkGamePlayStart();
                    this._direction.add(this.camera.forward);
                    this._carpetVelocity.add(this.camera.forward);

                } else if (joystick.y < 0) {
                    this.sdkGamePlayStart();
                    this._direction.add(this.camera.forward.mulScalar(-1));
                    this._carpetVelocity.add(this.camera.forward.mulScalar(-1));
                }
                if (joystick.x > 0) {
                    this.sdkGamePlayStart();
                    this._direction.add(this.camera.right);
                    this._carpetVelocity.add(this.camera.right);

                } else if (joystick.x < 0) {
                    this.sdkGamePlayStart();
                    this._direction.add(this.camera.right.mulScalar(-1));
                    this._carpetVelocity.add(this.camera.right.mulScalar(-1));

                }
                if (window.touchJoypad.buttons.isPressed('jumpButton')) {
                    this._requestedJump = true;
                    this._carpetVelocity.add(this.entity.up);
                    if (this.app.rocket) {
                        this.isRocket = true;

                    }
                }
            } else {
                //if (!this.app.isPause) {
                if (this.app.keyboard.isPressed(pc.KEY_SPACE)) {
                    if (!this.app.rocket) {
                        this._requestedJump = true;
                    }
                    else {
                        this.isRocket = true;
                    }
                    this.sdkGamePlayStart();
                }
                if (this.app.keyboard.isPressed(pc.KEY_W) || this.app.keyboard.isPressed(pc.KEY_UP)) {
                    this._direction.add(this.camera.forward);
                    this._carpetVelocity.add(this.camera.forward);
                    this.sdkGamePlayStart();
                }
                else if (this.app.keyboard.isPressed(pc.KEY_S) || this.app.keyboard.isPressed(pc.KEY_DOWN)) {
                    this._direction.sub(this.camera.forward);
                    this._carpetVelocity.sub(this.camera.forward);
                    this.sdkGamePlayStart();
                }
                if (this.app.keyboard.isPressed(pc.KEY_A) || this.app.keyboard.isPressed(pc.KEY_LEFT)) {
                    this._direction.sub(this.camera.right);
                    this._carpetVelocity.sub(this.camera.right);
                    this.sdkGamePlayStart();

                } if (this.app.keyboard.isPressed(pc.KEY_D) || this.app.keyboard.isPressed(pc.KEY_RIGHT)) {
                    this._direction.add(this.camera.right);
                    this._carpetVelocity.add(this.camera.right);
                    this.sdkGamePlayStart();
                } if (this._requestedJump) {
                    this._carpetVelocity.add(this.entity.up);
                }
                //}

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
            if (result && (result.entity.tags.has("Ground") || result.entity.tags.has("LGround"))) {
                this._contactNormal = result.normal.clone();
                this._timeSinceLastGrounded = 0;
                this.grounded = true;
                if (this._timeSinceLastJump >= 0.3) {
                    this._jumped = false;
                    this._animComponent.setBoolean("falling", false);
                }
                break; // Exit the loop if grounded
            }
        }

        if (!this.grounded || this.isSliding) {
            this._contactNormal = new pc.Vec3(0, 1, 0);
            this._animComponent.setBoolean("falling", true);
        }
    }

    this._desiredVelocity = this._direction.normalize().clone().mulScalar(this.moveSpeed);
    if (this._desiredVelocity.length() > 0) {
        this._desiredAngle = Math.atan2(this._direction.x, this._direction.z) * pc.math.RAD_TO_DEG;
        const targetQuat = new pc.Quat().setFromEulerAngles(0, this._desiredAngle, 0);
        this._quatLerp = new pc.Quat().slerp(this._quatLerp, targetQuat, this.rotateSpeed * dt);
        this.body.setRotation(this._quatLerp);

    }

    this._desiredVelocity.y += this.entity.rigidbody.linearVelocity.y;
    const velocityDotNormal = this._desiredVelocity.clone().normalize().dot(this._contactNormal);
    if (velocityDotNormal > 0 && !this._jumped) {
        this._desiredVelocity.sub(this._contactNormal.clone().mulScalar(velocityDotNormal * this._desiredVelocity.length()));
    }
    if (!this.app.isPause)
        if (this.isClimbingLadder == true) {
            if (this.app.keyboard.isPressed(pc.KEY_W) || this.app.keyboard.isPressed(pc.KEY_UP) || (this.app.isMobile && joystick.y > 0)) {
                const temp = this.body.up.mulScalar(15);
                this._desiredVelocity.set(this._desiredVelocity.x, 0, this._desiredVelocity.z);
                this._desiredVelocity.add(temp);
                this._desiredVelocity = this._desiredVelocity.normalize().mulScalar(6);
                this._animComponent.setBoolean("isClimbing", true);
                this._animComponent.speed = 1
            } else {
                this._desiredVelocity.set(this._desiredVelocity.x, 0, this._desiredVelocity.z);
                this._animComponent.setBoolean("isClimbing", true);
                this._animComponent.speed = 0;

            }

            if (this._requestedJump && !this.isRocket) {
                //this._carpetVelocity.y = 5;
                const temp = this.body.up.clone().add(this.body.forward.mulScalar(4));
                this._desiredVelocity.add(temp.normalize().mulScalar(this.jumpHeight));
            }

        } else {
            this._armatureTargetAngle = 0;
            this._animComponent.speed = 1
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
            if (this.isRocket) {
                this.app.usingRocket = true;
                this._requestedJump = false;
                this._desiredVelocity.set(this._desiredVelocity.x, 500 * dt, this._desiredVelocity.z);
                this.entity.findByName("Particle System").parent.enabled = true;
                //this.entity.findByName("Particle System").particlesystem.play()
                //this.entity.rigidbody.applyImpulse(new pc.Vec3(0, 500, 0));
            }
            else {
                this.app.usingRocket = false;
                this.entity.findByName("Particle System").parent.enabled = false;

            }
            //extra gravity
            if (!this.isCarpet)
                if (!this.app.isBallon)
                    this._desiredVelocity.set(this._desiredVelocity.x, this._desiredVelocity.y - 30 * dt, this._desiredVelocity.z);
        }

    if (this.app.isPause) {
        this._desiredVelocity.set(0, this._desiredVelocity.y - 30 * dt, 0)
    }
    if (!this.isCarpet) {
        if (!this.entity.isRope)
            this.entity.rigidbody.linearVelocity = this._desiredVelocity;
    }
    else {
        this.entity.rigidbody.linearVelocity = this._carpetVelocity.scale(this.moveSpeed * 2);
    }



    if (this._direction.x != 0 || this._direction.y != 0 || this._direction.z != 0) {
        this._animComponent.setBoolean("walking", true);
    } else {
        this._animComponent.setBoolean("walking", false);
    }
    if (this.isCarpet) {
        this._animComponent.setBoolean("jumping", false);
        this._animComponent.setBoolean("walking", false);
        this._animComponent.setBoolean("isClimbing", false);
        this._animComponent.setBoolean("falling", false);
    }
};
ClassicCharacterController.prototype.sdkGamePlayStart = function () {
    if (this.networkManager.inviteLinkPanel.enabled == false && this.app.rewardedPanelEnabled == false && this.app.isWatchingAd == false && this.networkManager.joinRoomPanel.enabled == false && this.app.menuPanelEnabled == false && this.app.marketPanel == false && this.app.deadMenuEnabled == false) {
        this.app.fire("SdkGamePlay", true);
        this.timer.start = true;
    }

    //PokiSDK.gameplayStart();
};
//Only gets y euler angle between -180, 180
ClassicCharacterController.prototype.getYaw = function (quat) {
    let transformedForward = new pc.Vec3();
    quat.transformVector(pc.Vec3.FORWARD, transformedForward);
    return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
};

ClassicCharacterController.prototype.sendPosition = function () {
    if (this.networkManager.room == null || this.networkManager.room.connection.isOpen === false) return;
    this.networkManager.room.send("location", {
        x: this.entity.getPosition().x,
        y: this.entity.getPosition().y,
        z: this.entity.getPosition().z,
        angle: this._desiredAngle,
    });
    this.networkManager.room.send("isClimbing", this._animComponent.getBoolean("isClimbing"));
    this.networkManager.room.send("isInAir", !this.grounded);
    this.networkManager.room.send("isWalking", this._animComponent.getBoolean("walking"));///
};

ClassicCharacterController.prototype.setCamera = function () {
    this.camera = this.app.root.findByName('Camera');
    this.cameraPosEntity = this.entity.findByName('CameraPosition');
    this.cameraParent = this.entity.findByName('Camera Axis');
    this.cameraParent.addChild(this.camera);
    this.camera.setLocalPosition(this.cameraPosEntity.getLocalPosition());
    if (this.app.touch) {
        this.cameraScript = this.camera.script.classicMobileCamera;
    } else {
        this.cameraScript = this.camera.script.classicCameraController
    }
    this.cameraScript.enabled = true;
    this.cameraScript.resetCamera();
    this._frameMovementRight = new pc.Vec3();
    this._frameMovementForward = new pc.Vec3();
    this._frameMovementTotal = new pc.Vec3();
};

ClassicCharacterController.prototype.died = function (fall) {
    if (this.isDied || this.delay) return;
    if (this.app.totem && !fall) {
        this.app.fire("UseTotem");
        return;
    }

    this.app.fire("SdkGamePlay", false);

    this.app.fire("ClassicMusic", "death");


    this.app.uiManager.script.classicUimanager.openDeathPanel(true);
    this.lockCamera(true);
    this.app.fire("Classic-disebledCarpet");


    let deadPlayerEntity = this.deadPlayer.resource.instantiate();
    const playerPos = this.body.getPosition().clone();
    this.app.root.addChild(deadPlayerEntity);
    deadPlayerEntity.setPosition(playerPos);
    deadPlayerEntity.setRotation(this.body.getRotation().clone());

    deadPlayerEntity.children.forEach((item) => {
        if (item.rigidbody) {

            if (item.render.meshInstances.length > 0) {
                item.render.meshInstances[0].material = this.app.currentBodyMaterial.resource
            }

            item.rigidbody.enabled = true;


            item.rigidbody.applyImpulse(this.body.forward.scale(-pc.math.random(0.5, 2)));

        }
    });

    const deadPlayerEntityBody = deadPlayerEntity.children[0];
    this.playerRendererEntity.enabled = false;
    deadPlayerEntityBody.enabled = true;
    /*
    for (let i = 0; i < deadPlayerEntityBody.children.length; i++) {
        deadPlayerEntityBody.children[i].rigidbody.applyImpulse(this.body.forward.scale(-pc.math.random(0, 1)));
    }*/
    this.spawnedDeadBody = deadPlayerEntity;
    this.isDied = true;
    this.app.isDied = true;



    //this.networkManager.diedEffect();
    this.entity.collision.enabled = false;
    this.entity.rigidbody.type = "kinematic";

    if (this.networkManager.room)
        this.networkManager.room.send("isAlive", false);

};

ClassicCharacterController.prototype.respawn = function (ads = false) {
    //this.sdkGamePlayStart();
    this.cameraScript.reset();
    this.playerHealt = 100;

    this.app.fire("WorldControl");

    if (!ads) {
        let commercialBreakCounter = Date.now();
        PokiSDK.commercialBreak(() => {
            // you can pause any background music or other audio here
            this.app.systems.sound.volume = 0;
        }).then(async () => {
            this.app.systems.sound.volume = 1;
            this.app.isWatchingAd = false;

            if (this.networkManager.room)
                this.networkManager.room.send("isAlive", true);

            this.delay = true;
            setTimeout(() => {
                this.delay = false;
            }, 1000)

            this.app.uiManager.script.classicUimanager.openDeathPanel(false);
            this.app.isDied = false;
            if (!this.app.isFPS)
                this.playerRendererEntity.enabled = true;
            if (this.spawnedDeadBody)
                this.spawnedDeadBody.destroy();
            //const targetStage = this.networkManager.stagesParent.children[this.app.currentStage];
            this.entity.collision.enabled = true;
            this.entity.rigidbody.type = "dynamic"

            let currentStageIndex;
            if (Utils.getItem("RainbowObby_currentCheckpoint"))
                currentStageIndex = Utils.getItem("RainbowObby_currentCheckpoint")
            else
                currentStageIndex = 0
            let currentStage = this.app.allStage[currentStageIndex].getPosition();

            this.entity.rigidbody.teleport(currentStage.x, currentStage.y + 3, currentStage.z);

            //this.lastSavePoint = this.networkManager.savePoints.children[this.app.currentStage].children[0];
            //this.entity.rigidbody.teleport(this.lastSavePoint.getPosition());

            this.isDied = false;


            this.lockCamera(false);



            if (Date.now() - commercialBreakCounter > 1000) {
                gameanalytics.GameAnalytics.addAdEvent(
                    gameanalytics.EGAAdAction.Show,
                    gameanalytics.EGAAdType.Interstitial,
                    "poki",
                    "ClassicObby"
                );
            }
        });
    }
    else {
        if (this.networkManager.room)
            this.networkManager.room.send("isAlive", true);

        this.delay = true;
        setTimeout(() => {
            this.delay = false;
        }, 1000)

        this.app.uiManager.script.classicUimanager.openDeathPanel(false);
        this.app.isDied = false;
        if (!this.app.isFPS)
            this.playerRendererEntity.enabled = true;
        if (this.spawnedDeadBody)
            this.spawnedDeadBody.destroy();
        //const targetStage = this.networkManager.stagesParent.children[this.app.currentStage];
        this.entity.collision.enabled = true;
        this.entity.rigidbody.type = "dynamic"

        let currentStageIndex;
        if (Utils.getItem("RainbowObby_currentCheckpoint"))
            currentStageIndex = Utils.getItem("RainbowObby_currentCheckpoint")
        else
            currentStageIndex = 0
        let currentStage = this.app.allStage[currentStageIndex].getPosition();

        this.entity.rigidbody.teleport(currentStage.x, currentStage.y + 3, currentStage.z);

        //this.lastSavePoint = this.networkManager.savePoints.children[this.app.currentStage].children[0];
        //this.entity.rigidbody.teleport(this.lastSavePoint.getPosition());

        this.isDied = false;


        this.lockCamera(false);
    }
};

ClassicCharacterController.prototype.lockCamera = function (state = false) {
    if (state) {
        this.cameraScript.removeEventCallbacks();
        this.app.mouse.disablePointerLock();
    } else {
        this.cameraScript.addEventCallbacks();
        this.app.mouse.enablePointerLock();
    }
}
ClassicCharacterController.prototype.skipStage = function () {
    PokiSDK.rewardedBreak({
        size: "small",
        onStart: () => {
            this.app.systems.sound.volume = 0;
        }
    }).then((success) => {
        this.app.systems.sound.volume = 1;

        if (success) {
            gameanalytics.GameAnalytics.addAdEvent(
                gameanalytics.EGAAdAction.Show,
                gameanalytics.EGAAdType.Interstitial,
                "poki",
                "ClassicObby"
            );
            this.respawn(true);
            if (this.app.allStage[this.app.currentCheckPoint + 1])
                this.entity.rigidbody.teleport(this.app.allStage[this.app.currentCheckPoint + 1].getPosition().add(new pc.Vec3(0, 5, 0)));
        } else {
            this.respawn(true);

        }
    });
};