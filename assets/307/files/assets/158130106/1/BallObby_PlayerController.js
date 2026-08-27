/*BallObbyPlayerController script that handles local player controls by Emre Şahin - emolingo games */
var BallObbyPlayerController = pc.createScript('ballObbyPlayerController');
BallObbyPlayerController.attributes.add('bikeRotateSpeed', { type: 'number', default: 10 });
BallObbyPlayerController.attributes.add('deadPlayer', { type: 'asset', assetType: 'template' });
BallObbyPlayerController.attributes.add('playerMaterials', { type: 'asset', assetType: 'material', array: true });
// initialize code called once per entity
BallObbyPlayerController.prototype.initialize = function () {
    this.ballObbyNetworkManager = this.app.root.findByName("NetworkManager").script.ballObbyNetworkManager;
    this.setCamera();
    this.tempForward = new pc.Vec3();
    this.tempNewSpeed = new pc.Vec3();
    this._targetAngularVelocity = new pc.Vec3();
    this.ball = this.entity.children[0];
    this.bike = this.entity.children[1];
    this.playerModel = this.bike.children[0];
    this.bikeModel = this.bike.children[3];
    this.refPointForRotation = this.entity.children[2];
    this.speed = 60;
    this.jumpPower = 45;
    this.rotateSpeed = 0;
    this.force = new pc.Vec3();
    this.isRidingMotor = false;
    this.isUsingJetpack = false;

    this.moveDirection = null;
    this.moveDirectionOrginal = new pc.Quat();
    this.moveDirectionFinal = new pc.Quat();
    this.isMoving = false;
    this.jumpRayLength = new pc.Vec3(0, -4, 0);
    this.grounded = false;
    this.canJump = false;
    this.canPressJump = true;
    this.jumpBoost = 1;
    this.ball.rigidbody.applyImpulse(this.bike.forward.scale(10));

    this.jumpCoil = this.entity.findByName("JumpCoil");
    this.totem = this.entity.findByName("Totem");
    this.jetpack = this.entity.findByName("Jetpack");
    this.jetpackParticle = this.jetpack.children[1].particlesystem;
    this.username = this.entity.findByName("username").element;
    this.dust = this.bike.findByName("Dust").particlesystem;
    this.bikeDriveSlot = this.bikeModel.sound.slot("bikeDrive");
    this.bikeDriveSound = false;
    this.collectCoinSlot = this.playerModel.sound.slot("collectCoin");

    this.currentTurnRotation = 0.0;
    this.nextTurnRotation = 0.0;
    this.isDied = false;
    this.newlyStarted = true;
    //set pos
    this.respawn();
    this.sendPositionInterval = setInterval(this.sendPosition.bind(this), 50);
    setInterval(() => {
        this.newlyStarted = false;
    }, 1000);

    this.app.on("lockCamera", this.lockCamera, this);

    this.on('destroy', function () {
        clearInterval(this.sendPositionInterval);
        this.app.off("lockCamera", this.lockCamera, this);
    }, this);
};

// update code called every frame
BallObbyPlayerController.prototype.update = function (dt) {
    if (this.isDied == false && this.app.isWatchingAd == false) {
        this.applyForceToBall(dt);
        //this.leanBike(dt);
        if (this.ball.rigidbody.linearVelocity.y < -85) {
            this.died();
        } else {
            if (this.ball.getPosition().y < -170) {
                this.died();
            }
        }
    } else {
        const v = this.ball.rigidbody.linearVelocity;
        v.set(0, 0, 0);
        this.ball.rigidbody.linearVelocity = v;
        return;
    }
    this.setRefRotation(dt);
    this.lerpBikeToBall(dt);
    this.checkGround();
    // Fall gravity
    if (this.grounded == false && this.ball.rigidbody.linearVelocity.y != 0) {
        const v = this.ball.rigidbody.linearVelocity;
        v.set(v.x, v.y - 30 * dt, v.z);
        this.ball.rigidbody.linearVelocity = v;
    }
};

BallObbyPlayerController.prototype.enableJumpCoil = function () {
    if (this.jumpCoilEnabled) {
        clearInterval(this.jumpCoilInterval);
    }
    this.ballObbyNetworkManager.jumpCoilUI.enabled = true;
    this.jumpBoost = 2;
    this.jumpCoilEnabled = true;
    this.jumpCoil.enabled = true;
    if (this.ballObbyNetworkManager.room != null && this.ballObbyNetworkManager.room.connection.isOpen === true)
        this.ballObbyNetworkManager.room.send("Client:GetPowerup", { type: 0 });
    let jumpCoilCounter = 60;
    this.ballObbyNetworkManager.jumpCoilAmountText.text = jumpCoilCounter;
    this.jumpCoilInterval = setInterval(() => {
        this.ballObbyNetworkManager.jumpCoilAmountText.text = jumpCoilCounter;
        if (jumpCoilCounter > 0) {
            jumpCoilCounter -= 1;
        } else {
            this.disableJumpCoil();
            clearInterval(this.jumpCoilInterval);
        }
    }, 1000);
};

BallObbyPlayerController.prototype.disableJumpCoil = function () {
    this.ballObbyNetworkManager.jumpCoilUI.enabled = false;
    this.jumpCoilEnabled = false;
    this.jumpBoost = 1;
    this.jumpCoil.enabled = false;
    if (this.ballObbyNetworkManager.room != null && this.ballObbyNetworkManager.room.connection.isOpen === true)
        this.ballObbyNetworkManager.room.send("Client:RemovePowerup", { type: 0 });
};

BallObbyPlayerController.prototype.enableTotem = function () {
    this.totemEnabled = true;
    this.totem.enabled = true;
    if (this.ballObbyNetworkManager.room != null && this.ballObbyNetworkManager.room.connection.isOpen === true)
        this.ballObbyNetworkManager.room.send("Client:GetPowerup", { type: 1 });
};

BallObbyPlayerController.prototype.removeTotem = function () {
    this.totemEnabled = false;
    this.totem.enabled = false;
    if (this.ballObbyNetworkManager.room != null && this.ballObbyNetworkManager.room.connection.isOpen === true)
        this.ballObbyNetworkManager.room.send("Client:RemovePowerup", { type: 1 });
};

BallObbyPlayerController.prototype.enableJetpack = function () {
    //if (this.jetpackEnabled) return;
    this.ballObbyNetworkManager.jetpackUI.enabled = true;
    this.jetpackEnabled = true;
    this.jetpack.enabled = true;
    this.jetpackFuel = 100;
    this.ballObbyNetworkManager.jetpackAmountText.text = this.jetpackFuel + "%";
    if (this.ballObbyNetworkManager.room != null && this.ballObbyNetworkManager.room.connection.isOpen === true)
        this.ballObbyNetworkManager.room.send("Client:GetPowerup", { type: 2 });
};

BallObbyPlayerController.prototype.disableJetpack = function () {
    this.ballObbyNetworkManager.jetpackUI.enabled = false;
    this.jetpackEnabled = false;
    this.jetpack.enabled = false;
    this.jetpackFuel = 0;
    if (this.ballObbyNetworkManager.room != null && this.ballObbyNetworkManager.room.connection.isOpen === true)
        this.ballObbyNetworkManager.room.send("Client:RemovePowerup", { type: 2 });
};

BallObbyPlayerController.prototype.sendPosition = function () {
    if (this.ballObbyNetworkManager.room == null || this.ballObbyNetworkManager.room.connection.isOpen === false) return;
    const euler = this.ball.getEulerAngles();
    this.ballObbyNetworkManager.room.send("Client:Movement", {
        x: this.ball.getPosition().x,
        y: this.ball.getPosition().y,
        z: this.ball.getPosition().z,
        rotationX: euler.x,
        rotationY: euler.y,
        rotationZ: euler.z,
        grounded: this.grounded
    });
};

BallObbyPlayerController.prototype.lockCamera = function (state = false) {
    if (state) {
        this.cameraScript.removeEventCallbacks();
    } else {
        this.cameraScript.addEventCallbacks();
    }
}

BallObbyPlayerController.prototype.died = function () {
    if (this.isDied || this.newlyStarted) return;

    if (this.app.gameplayStarted === true) {
        PokiSDK.gameplayStop();
        this.app.gameplayStarted = false;
    }
    this.playerModel.sound.play("oof");
    this.speed = 60;
    this.isDied = true;
    this.ballObbyNetworkManager.diedEffect();
    this.lockCamera(true);
    //setTimeout(this.respawn.bind(this), 2000);
    if (this.ballObbyNetworkManager.room) {
        this.ballObbyNetworkManager.room.send("Client:Died");
    }
};

BallObbyPlayerController.prototype.respawn = function () {
    this.app.isWatchingAd = true;
    let commercialBreakCounter = Date.now();
    PokiSDK.commercialBreak(() => {
        // you can pause any background music or other audio here
        this.app.systems.sound.volume = 0;
    }).then(() => {
        console.log("Commercial break finished, proceeding to game");
        // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
        // continue your game here
        this.app.systems.sound.volume = 1;
        this.app.isWatchingAd = false;

        if (Date.now() - commercialBreakCounter > 1000) {
            gameanalytics.GameAnalytics.addAdEvent(
                gameanalytics.EGAAdAction.Show,
                gameanalytics.EGAAdType.Interstitial,
                "poki",
                "BallObby"
            );
        }

        const targetStage = this.ballObbyNetworkManager.stagesParent.children[(this.app.ballCurrentStage - (this.ballObbyNetworkManager.worldNumber - 1) * 100)];
        this.app.ballObbyTargetStage = targetStage;
        this.ball.rigidbody.teleport(targetStage.getPosition().clone().add(targetStage.up));
        this.ball.rigidbody.linearVelocity = pc.Vec3.ZERO;
        this.cameraScript.reset();
        this.isDied = false;
        this.newlyStarted = true;
        setTimeout(() => {
            this.newlyStarted = false;
        }, 1000);
        if (this.ballObbyNetworkManager.room) {
            this.ballObbyNetworkManager.room.send("Client:Respawn");
        }
    });
};

BallObbyPlayerController.prototype.applyForceToBall = function (dt) {
    if (this.app.isWatchingAd) return;
    // bakış yönünü al
    const forwardDir = this.refPointForRotation.forward;
    let x = 0;
    let z = 0;
    let isJumped = false;

    if (this.app.isMobile) { // Mobile
        const joystick = window.touchJoypad.sticks['joystick0'];
        x = -joystick.x;
        z = -joystick.y;

        if (window.touchJoypad.buttons.wasPressed('jumpButton') && this.canJump && this.canPressJump) {
            this.canPressJump = false;
            this.ball.rigidbody.applyImpulse(this.bike.forward.scale(2));
            this.ball.rigidbody.applyImpulse(new pc.Vec3(0, 45 * this.jumpBoost, 0));
            isJumped = true;
            this.playerModel.sound.play("jump");
        }

        //jetpack
        if (window.touchJoypad.buttons.isPressed('jumpButton') && this.jetpackEnabled) {
            this.ball.rigidbody.applyImpulse(new pc.Vec3(0, 140 * dt, 0));
            this.jetpackParticle.play();
            if (this.isUsingJetpack == false) {
                this.playerModel.sound.play("jetpack");
            }
            if (this.ballObbyNetworkManager.room != null && this.ballObbyNetworkManager.room.connection.isOpen === true && this.isUsingJetpack == false) {
                this.ballObbyNetworkManager.room.send("Client:UseJetpack", { isUsing: true });
            }
            this.isUsingJetpack = true;
            if (this.jetpackTimeout == null) {
                this.jetpackTimeout = setTimeout(() => {
                    this.ballObbyNetworkManager.jetpackAmountText.text = this.jetpackFuel + "%";
                    this.jetpackFuel -= 1;
                    this.jetpackTimeout = null;
                    if (this.jetpackFuel === 0) {
                        this.disableJetpack();
                    }
                }, 25);
            }
        } else {
            this.jetpackParticle.stop();
            if (this.isUsingJetpack == true) {
                this.playerModel.sound.stop("jetpack");
            }
            if (this.ballObbyNetworkManager.room != null && this.ballObbyNetworkManager.room.connection.isOpen === true && this.isUsingJetpack == true) {
                this.ballObbyNetworkManager.room.send("Client:UseJetpack", { isUsing: false });
            }
            this.isUsingJetpack = false;
        }
    } else { // PC
        if (this.app.keyboard.isPressed(pc.KEY_A) || this.app.keyboard.isPressed(pc.KEY_LEFT)) {
            x = 1;
        }
        else if (this.app.keyboard.isPressed(pc.KEY_D) || this.app.keyboard.isPressed(pc.KEY_RIGHT)) {
            x = -1;
        }

        if (this.app.keyboard.isPressed(pc.KEY_W) || this.app.keyboard.isPressed(pc.KEY_UP)) {
            z = -1;
        }
        else if (this.app.keyboard.isPressed(pc.KEY_S) || this.app.keyboard.isPressed(pc.KEY_DOWN)) {
            z = 1;
        }
        if (this.app.keyboard.wasPressed(pc.KEY_SPACE) && this.canJump && this.canPressJump) {
            this.canPressJump = false;
            let tempVel = this.ball.rigidbody.linearVelocity;
            tempVel.y = 0;
            this.ball.rigidbody.linearVelocity = tempVel;
            this.ball.rigidbody.applyImpulse(this.bike.forward.scale(2));
            this.ball.rigidbody.applyImpulse(new pc.Vec3(0, 45 * this.jumpBoost, 0));
            isJumped = true;
            this.playerModel.sound.play("jump");
        }

        //jetpack
        if (this.app.keyboard.isPressed(pc.KEY_SPACE) && this.jetpackEnabled) {
            this.ball.rigidbody.applyImpulse(new pc.Vec3(0, 140 * dt, 0));
            this.jetpackParticle.play();
            if (this.isUsingJetpack == false) {
                this.playerModel.sound.play("jetpack");
            }
            if (this.ballObbyNetworkManager.room != null && this.ballObbyNetworkManager.room.connection.isOpen === true && this.isUsingJetpack == false)
                this.ballObbyNetworkManager.room.send("Client:UseJetpack", { isUsing: true });
            this.isUsingJetpack = true;
            if (this.jetpackTimeout == null) {
                this.jetpackTimeout = setTimeout(() => {
                    this.ballObbyNetworkManager.jetpackAmountText.text = this.jetpackFuel + "%";
                    this.jetpackFuel -= 1;
                    this.jetpackTimeout = null;
                    if (this.jetpackFuel === 0) {
                        this.disableJetpack();
                    }
                }, 50);
            }
        } else {
            this.jetpackParticle.stop();
            if (this.isUsingJetpack == true) {
                this.playerModel.sound.stop("jetpack");
            }
            if (this.ballObbyNetworkManager.room != null && this.ballObbyNetworkManager.room.connection.isOpen === true && this.isUsingJetpack == true)
                this.ballObbyNetworkManager.room.send("Client:UseJetpack", { isUsing: false });
            this.isUsingJetpack = false;
        }
    }
    // Hareket kuvvetini uygula
    if ((x != 0 || z != 0) && isJumped == false) {
        if (z < 0)
            this.speed = pc.math.lerp(this.speed, 100, dt / 2);
        else
            this.speed = pc.math.lerp(this.speed, 60, dt / 2);
        this.ball.rigidbody.applyForce(forwardDir.scale(this.speed));
        if (this.app.gameplayStarted === false) {
            PokiSDK.gameplayStart();
            this.app.gameplayStarted = true;
        }
    } else {
        this.speed = pc.math.lerp(this.speed, 60, dt / 2);
    }
    this.camera.camera.fov = Math.max(this.speed * 5 / 12, 50);
};

BallObbyPlayerController.prototype.setRefRotation = function (dt) {
    let x = 0;
    let z = 0;

    if (this.app.isMobile) { // Mobile
        const joystick = window.touchJoypad.sticks['joystick0'];
        const joystickData = new pc.Vec2(joystick.x, joystick.y).normalize().mulScalar(this.bikeRotateSpeed);
        x = -joystick.x;
        z = -joystick.y;

        if (x === 0 && z === 0) {
            this.isMoving = false;
        } else { //moving
            this.isMoving = true;
            //const playerRot = this.refPointForRotation.getRotation().clone();
            let targetY = this.cameraScript.eulers.x;
            const newAngle = 90 - (Math.atan2(joystickData.y, -joystickData.x) * pc.math.RAD_TO_DEG);
            let playerRotQuat = new pc.Quat().setFromEulerAngles(0, targetY + 180 + newAngle, 0);
            //playerRot.slerp(this.refPointForRotation.getRotation(), playerRotQuat, dt * this.bikeRotateSpeed);
            this.refPointForRotation.setRotation(playerRotQuat);
        }
    } else { // PC
        if (this.app.keyboard.isPressed(pc.KEY_A) || this.app.keyboard.isPressed(pc.KEY_LEFT)) {
            x = 1;
        }
        else if (this.app.keyboard.isPressed(pc.KEY_D) || this.app.keyboard.isPressed(pc.KEY_RIGHT)) {
            x = -1;
        }

        if (this.app.keyboard.isPressed(pc.KEY_W) || this.app.keyboard.isPressed(pc.KEY_UP)) {
            z = -1;
        }
        else if (this.app.keyboard.isPressed(pc.KEY_S) || this.app.keyboard.isPressed(pc.KEY_DOWN)) {
            z = 1;
        }

        //not moving
        if (x === 0 && z === 0) {
            this.isMoving = false;
        } else { //moving
            this.isMoving = true;
            let targetY = this.cameraScript.eulers.x;
            let rot = new pc.Vec3(0, targetY, 0);

            if (z == 1 && x == 0) { //geri git
                rot = new pc.Vec3(0, rot.y + 180, 0);
            } else if (z == 0 && x == -1) { //sağ
                rot = new pc.Vec3(0, rot.y - 90, 0);
            } else if (z == 0 && x == 1) { //sol
                rot = new pc.Vec3(0, rot.y + 90, 0);
            } else if (z == -1 && x == 1) { //sol ileri
                rot = new pc.Vec3(0, rot.y + 45, 0);
            } else if (z == 1 && x == 1) { //sol geri
                rot = new pc.Vec3(0, rot.y + 135, 0);
            } else if (z == -1 && x == -1) { //sag ileri
                rot = new pc.Vec3(0, rot.y - 45, 0);
            } else if (z == 1 && x == -1) { //sag geri
                rot = new pc.Vec3(0, rot.y - 135, 0);
            }
            //const playerRot = this.refPointForRotation.getRotation().clone();
            const playerRotQuat = new pc.Quat().setFromEulerAngles(0, rot.y + 180, 0);
            //playerRot.slerp(this.refPointForRotation.getRotation(), playerRotQuat, dt * this.bikeRotateSpeed);
            this.refPointForRotation.setRotation(playerRotQuat);
        }
    }
};

BallObbyPlayerController.prototype.lerpBikeToBall = function (dt) {
    //lerp bike pos to ball pos
    const distance = this.bike.getPosition().distance(this.ball.getPosition());
    this.interpolatedPosition = this.bike.getPosition().clone();
    if (this.data && this.isDied == false) {
        if (this.data.isCar === true) {
            this.bikeDriveSlot.pitch = Math.min(Math.max(distance / 2, 0.5), 3); //((this.bikeDriveSlot.pitch + 0.1) % 2)
            if (this.bikeDriveSound == false) {
                this.bikeModel.sound.play("bikeDrive");
                this.bikeDriveSound = true;
            }
        } else if (this.data.isMotor === true) {
            this.bikeDriveSlot.pitch = Math.min(Math.max(distance / 2, 0.5), 2); //((this.bikeDriveSlot.pitch + 0.1) % 2)
            if (this.bikeDriveSound == false) {
                this.bikeModel.sound.play("bikeDrive");
                this.bikeDriveSound = true;
            }
        }
    }

    if (distance < 0.1) {
        this.dust.stop();
        if (this.data == null || (this.data.isCar != true && this.data.isMotor != true)) {
            this.bikeModel.sound.stop("bikeDrive");
            this.bikeDriveSound = false;
        }
    } else {
        /* if (this.grounded == false && this.bikeDriveSlot.pitch > 0) {
             this.bikeDriveSlot.pitch -= dt / 2;
         } else {*/
        if ((this.data == null || (this.data.isCar != true && this.data.isMotor != true)) && this.isDied == false) {
            this.bikeDriveSlot.pitch = Math.min(Math.max(distance / 2, 0.4), 2); //((this.bikeDriveSlot.pitch + 0.1) % 2)
            if (this.bikeDriveSound == false) {
                this.bikeModel.sound.play("bikeDrive");
                this.bikeDriveSound = true;
            }
        }

        //}

        if (this.grounded)
            this.dust.play();
        else
            this.dust.stop();
    }
    this.bike.setPosition(this.ball.getPosition().clone());
    /*
    this.interpolatedPosition.lerp(this.bike.getPosition(),
        this.ball.getPosition(), 0.5);
    this.bike.setPosition(this.interpolatedPosition);
    */
    //this.refPointForRotation.setPosition(this.ball.getPosition());

    //lerp bike rot to ball pos
    /*
    if (this.grounded === false && this.isMoving === false) return;
    this.moveDirection = this.ball.getPosition();
    this.moveDirectionOrginal.copy(this.bike.getRotation());
    this.bike.lookAt(this.moveDirection.x, this.moveDirection.y, this.moveDirection.z);
    this.moveDirectionFinal.copy(this.bike.getRotation());
    if (dt > 0.03) {
        this.bike.setRotation(new pc.Quat().slerp(this.moveDirectionOrginal, this.moveDirectionFinal, 0.5));
    } else {
        this.bike.setRotation(new pc.Quat().slerp(this.moveDirectionOrginal, this.moveDirectionFinal, dt * 5));
    }
    */

};

BallObbyPlayerController.prototype.LerpVectors = function (a, b, speed) {
    let abx = pc.math.lerp(a.x, b.x, speed);
    let aby = pc.math.lerp(a.y, b.y, speed);
    let abz = pc.math.lerp(a.z, b.z, speed);
    return new pc.Vec3(abx, aby, abz);
}

BallObbyPlayerController.prototype.leanBike = function (dt) {
    //lean bike body
    if (this.isDied == false) {
        var delta = (this.bike.getPosition().clone().add(this.refPointForRotation.forward.clone()).sub(this.bike.getPosition().clone())).normalize();
        var cross = delta.cross(delta, this.bike.forward.clone());
        if (this.isMoving) {
            if (this.data && this.data.isCar)
                this.currentTurnRotation = pc.math.lerpAngle(this.currentTurnRotation, 10 * cross.y, dt * 5);
            else
                this.currentTurnRotation = pc.math.lerpAngle(this.currentTurnRotation, 25 * cross.y, dt * 5);
        } else {
            this.currentTurnRotation = pc.math.lerpAngle(this.currentTurnRotation, 0, dt * 5);
        }
        this.playerModel.setLocalEulerAngles(180, 0, 180 - this.currentTurnRotation);
        this.bikeModel.setLocalEulerAngles(90, 0, 180 - this.currentTurnRotation);
    }
};

BallObbyPlayerController.prototype.checkGround = function () {
    // Raycast between the two points
    const rayEnd = this.ball.getPosition().clone().add(this.jumpRayLength);
    const results = this.app.systems.rigidbody.raycastAll(this.ball.getPosition(), rayEnd);
    // If there was a hit
    for (let i = 0; i < results.length; i++) {
        const hitEntity = results[i].entity;
        if (hitEntity.tags.has('Ground') === true) {
            this.canPressJump = true;
            this.grounded = true;
            this.canJump = true;
            if (this.jumpTimeout)
                clearTimeout(this.jumpTimeout);
            this.jumpTimeout = null;
            return;
        }
    }
    this.grounded = false;
    if (this.jumpTimeout == null)
        this.jumpTimeout = setTimeout(() => {
            this.canJump = false;
            this.jumpTimeout = null;
        }, 250);
};

BallObbyPlayerController.prototype.setCamera = function () {
    this.camera = this.app.root.findByName('Camera');
    if (this.app.isMobile)
        this.camera.camera.farClip = 600;
    this.cameraPosEntity = this.entity.findByName('CameraPosition');
    this.cameraParent = this.entity.findByName('Camera Axis');
    this.cameraParent.addChild(this.camera);
    this.camera.setLocalPosition(this.cameraPosEntity.getLocalPosition());
    if (this.app.isMobile) {
        this.cameraScript = this.camera.script.ballObbyMobileCameraController;
    } else {
        this.cameraScript = this.camera.script.ballObbyCameraController;
    }
    this.cameraScript.enabled = true;
    this._frameMovementRight = new pc.Vec3();
    this._frameMovementForward = new pc.Vec3();
    this._frameMovementTotal = new pc.Vec3();
};