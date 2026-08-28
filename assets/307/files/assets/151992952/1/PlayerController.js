/*BikeObby_PlayerController script that handles local player controls by Emre Şahin - emolingo games */
var BikeObby_PlayerController = pc.createScript('playerController');
BikeObby_PlayerController.attributes.add('bikeRotateSpeed', { type: 'number', default: 10 });
BikeObby_PlayerController.attributes.add('deadPlayer', { type: 'asset', assetType: 'template' });
// initialize code called once per entity
BikeObby_PlayerController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.networkManager;
    this.setCamera();
    this.tempForward = new pc.Vec3();
    this.tempNewSpeed = new pc.Vec3();
    this._targetAngularVelocity = new pc.Vec3();
    this.ball = this.entity.children[0];
    this.bike = this.entity.children[1];
    this.playerModel = this.bike.children[0];
    this.bikeModel = this.bike.children[3];
    this.wheels = this.bikeModel.children;
    this.refPointForRotation = this.entity.children[2];
    this.speed = 60;
    this.bikeSpeed = bikeData[0].speed;
    this.jumpPower = bikeData[0].jumpPower;
    this.rotateSpeed = 0;
    this.force = new pc.Vec3();
    this.isRidingMotor = false;
    this.isUsingJetpack = false;

    this.moveDirection = null;
    this.moveDirectionOrginal = new pc.Quat();
    this.moveDirectionFinal = new pc.Quat();
    this.isMoving = false;
    this.jumpRayLength = new pc.Vec3(0, -2, 0);
    this.grounded = false;
    this.canJump = false;
    this.canPressJump = true;
    this.jumpBoost = 1;
    this.ball.rigidbody.applyImpulse(this.bike.forward.scale(this.bikeSpeed / 10));

    this.jumpCoil = this.entity.findByName("JumpCoil");
    this.totem = this.entity.findByName("Totem");
    this.jetpack = this.entity.findByName("Jetpack");
    this.jetpackParticle = this.jetpack.children[1].particlesystem;
    this.username = this.entity.findByName("username").element;
    this.dust = this.bike.findByName("Dust").particlesystem;
    this.playerRendererEntity = this.bike.findByName("Noob");
    this.bikeDriveSlot = this.bikeModel.sound.slot("bikeDrive");
    this.bikeDriveSound = false;
    this.collectCoinSlot = this.playerModel.sound.slot("collectCoin");

    this.currentTurnRotation = 0.0;
    this.nextTurnRotation = 0.0;
    this.isDied = false;
    this.newlyStarted = true;
    //set pos
    this.respawn();
    this.sendPositionInterval = setInterval(this.sendPosition.bind(this), 100);
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
BikeObby_PlayerController.prototype.update = function (dt) {
    /*
        for (let i = 0; i < 1; i++) {
            let a = Math.random();
            let b = Math.random();
            let c = a * b * b * Math.random();
            this.d = c;
        }
    */
    if (this.isDied == false) {
        this.applyForceToBall(dt);
        this.leanBike(dt);
        if (this.app.currentStage > 45 && this.app.currentStage < 81) {
            if (this.ball.getPosition().y < 100) {
                this.died();
            }
        } else if (this.app.currentStage >= 81 && this.app.currentStage < 99) {
            if (this.ball.getPosition().y < 50) {
                this.died();
            }
        } else if (this.app.currentStage === 12) {
            if (this.ball.getPosition().y < -30) {
                this.died();
            }
        } else {
            if (this.ball.getPosition().y < -20) {
                this.died();
            }
        }
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

BikeObby_PlayerController.prototype.enableJumpCoil = function () {
    if (this.jumpCoilEnabled) {
        clearInterval(this.jumpCoilInterval);
    }
    this.networkManager.jumpCoilUI.enabled = true;
    this.jumpBoost = 2;
    this.jumpCoilEnabled = true;
    this.jumpCoil.enabled = true;
    if (this.networkManager.room != null && this.networkManager.room.connection.isOpen === true)
        this.networkManager.room.send("Client:GetPowerup", { type: 0 });
    let jumpCoilCounter = 60;
    this.networkManager.jumpCoilAmountText.text = jumpCoilCounter;
    this.jumpCoilInterval = setInterval(() => {
        this.networkManager.jumpCoilAmountText.text = jumpCoilCounter;
        if (jumpCoilCounter > 0) {
            jumpCoilCounter -= 1;
        } else {
            this.disableJumpCoil();
            clearInterval(this.jumpCoilInterval);
        }
    }, 1000);
};

BikeObby_PlayerController.prototype.disableJumpCoil = function () {
    this.networkManager.jumpCoilUI.enabled = false;
    this.jumpCoilEnabled = false;
    this.jumpBoost = 1;
    this.jumpCoil.enabled = false;
    if (this.networkManager.room != null && this.networkManager.room.connection.isOpen === true)
        this.networkManager.room.send("Client:RemovePowerup", { type: 0 });
};

BikeObby_PlayerController.prototype.enableTotem = function () {
    this.totemEnabled = true;
    this.totem.enabled = true;
    if (this.networkManager.room != null && this.networkManager.room.connection.isOpen === true)
        this.networkManager.room.send("Client:GetPowerup", { type: 1 });
};

BikeObby_PlayerController.prototype.removeTotem = function () {
    this.totemEnabled = false;
    this.totem.enabled = false;
    if (this.networkManager.room != null && this.networkManager.room.connection.isOpen === true)
        this.networkManager.room.send("Client:RemovePowerup", { type: 1 });
};

BikeObby_PlayerController.prototype.enableJetpack = function () {
    //if (this.jetpackEnabled) return;
    this.networkManager.jetpackUI.enabled = true;
    this.jetpackEnabled = true;
    this.jetpack.enabled = true;
    this.jetpackFuel = 100;
    this.networkManager.jetpackAmountText.text = this.jetpackFuel + "%";
    if (this.networkManager.room != null && this.networkManager.room.connection.isOpen === true)
        this.networkManager.room.send("Client:GetPowerup", { type: 2 });
};

BikeObby_PlayerController.prototype.disableJetpack = function () {
    this.networkManager.jetpackUI.enabled = false;
    this.jetpackEnabled = false;
    this.jetpack.enabled = false;
    this.jetpackFuel = 0;
    if (this.networkManager.room != null && this.networkManager.room.connection.isOpen === true)
        this.networkManager.room.send("Client:RemovePowerup", { type: 2 });
};

BikeObby_PlayerController.prototype.sendPosition = function () {
    if (this.networkManager.room == null || this.networkManager.room.connection.isOpen === false) return;
    const euler = this.bikeModel.getEulerAngles();
    this.networkManager.room.send("Client:Movement", {
        x: this.bikeModel.getPosition().x,
        y: this.bikeModel.getPosition().y,
        z: this.bikeModel.getPosition().z,
        rotationX: euler.x,
        rotationY: euler.y,
        rotationZ: euler.z,
        grounded: this.grounded
    });
};

BikeObby_PlayerController.prototype.lockCamera = function (state = false) {
    if (state) {
        this.cameraScript.removeEventCallbacks();
    } else {
        this.cameraScript.addEventCallbacks();
    }
}

BikeObby_PlayerController.prototype.died = function () {
    if (this.isDied || this.newlyStarted) return;

    if (this.app.gameplayStarted === true) {
        PokiSDK.gameplayStop();
        this.app.gameplayStarted = false;
    }
    this.bikeModel.sound.stop("bikeDrive");
    this.playerModel.sound.play("oof");
    this.bikeDriveSound = false;
    const deadPlayerEntity = this.deadPlayer.resource.instantiate();
    const playerPos = this.ball.getPosition().clone();
    this.app.root.addChild(deadPlayerEntity);
    deadPlayerEntity.setPosition(playerPos.x, playerPos.y, playerPos.z);
    deadPlayerEntity.setRotation(this.refPointForRotation.getRotation().clone());
    const deadPlayerEntityBody = deadPlayerEntity.children[0];

    for (let i = 0; i < deadPlayerEntityBody.children.length; i++) {
        deadPlayerEntityBody.children[i].rigidbody.applyImpulse(this.bike.forward.scale(this.bikeSpeed / 50));
    }
    this.playerRendererEntity.enabled = false;
    deadPlayerEntityBody.enabled = true;
    this.spawnedDeadBody = deadPlayerEntity;
    this.speed = 60;
    this.isDied = true;
    this.networkManager.diedEffect();
    this.lockCamera(true);
    //setTimeout(this.respawn.bind(this), 2000);
    if (this.networkManager.room) {
        this.networkManager.room.send("Client:Died");
    }
};

BikeObby_PlayerController.prototype.respawn = function () {
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
                "BikeObby"
            );
        }

        this.playerRendererEntity.enabled = true;
        if (this.spawnedDeadBody)
            this.spawnedDeadBody.destroy();
        const targetStage = this.networkManager.stagesParent.children[this.app.currentStage - (this.networkManager.worldNumber - 1) * 100];
        if (this.app.currentStage === 0) {
            randomXOffset = (Math.random() * 4 - 2);
            randomZOffset = (Math.random() * 4 - 2);
            const currentPosition = targetStage.getPosition().clone();
            currentPosition.x += randomXOffset;
            currentPosition.z += randomZOffset;
            this.ball.rigidbody.teleport(currentPosition);
        } else {
            this.ball.rigidbody.teleport(targetStage.getPosition().clone().add(targetStage.up));
        }
        this.ball.rigidbody.linearVelocity = pc.Vec3.ZERO;
        this.ball.rigidbody.applyImpulse(this.networkManager.stagesParent.children[this.app.currentStage - (this.networkManager.worldNumber - 1) * 100].forward.scale(3));
        this.cameraScript.reset();
        this.isDied = false;
        this.newlyStarted = true;
        setTimeout(() => {
            this.newlyStarted = false;
        }, 1000);
        if (this.networkManager.room) {
            this.networkManager.room.send("Client:Respawn");
        }
    });
};

BikeObby_PlayerController.prototype.applyForceToBall = function (dt) {
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
            this.ball.rigidbody.applyImpulse(this.bike.forward.scale(this.bikeSpeed / 50));
            this.ball.rigidbody.applyImpulse(new pc.Vec3(0, this.jumpPower * this.jumpBoost, 0));
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
            if (this.networkManager.room != null && this.networkManager.room.connection.isOpen === true && this.isUsingJetpack == false) {
                this.networkManager.room.send("Client:UseJetpack", { isUsing: true });
            }
            this.isUsingJetpack = true;
            if (this.jetpackTimeout == null) {
                this.jetpackTimeout = setTimeout(() => {
                    this.networkManager.jetpackAmountText.text = this.jetpackFuel + "%";
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
            if (this.networkManager.room != null && this.networkManager.room.connection.isOpen === true && this.isUsingJetpack == true) {
                this.networkManager.room.send("Client:UseJetpack", { isUsing: false });
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
            this.ball.rigidbody.applyImpulse(this.bike.forward.scale(this.bikeSpeed / 50));
            this.ball.rigidbody.applyImpulse(new pc.Vec3(0, this.jumpPower * this.jumpBoost, 0));
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
            if (this.networkManager.room != null && this.networkManager.room.connection.isOpen === true && this.isUsingJetpack == false)
                this.networkManager.room.send("Client:UseJetpack", { isUsing: true });
            this.isUsingJetpack = true;
            if (this.jetpackTimeout == null) {
                this.jetpackTimeout = setTimeout(() => {
                    this.networkManager.jetpackAmountText.text = this.jetpackFuel + "%";
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
            if (this.networkManager.room != null && this.networkManager.room.connection.isOpen === true && this.isUsingJetpack == true)
                this.networkManager.room.send("Client:UseJetpack", { isUsing: false });
            this.isUsingJetpack = false;
        }
    }
    // Hareket kuvvetini uygula
    if ((x != 0 || z != 0) && isJumped == false) {
        if (z < 0)
            this.speed = pc.math.lerp(this.speed, this.bikeSpeed, dt / 2);
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

BikeObby_PlayerController.prototype.setRefRotation = function (dt) {
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

BikeObby_PlayerController.prototype.lerpBikeToBall = function (dt) {
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
        if (this.isRidingMotor == false) {
            this.playerModel.anim.setBoolean('isRiding', false);
        }
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
        if (this.isRidingMotor) {
            this.playerModel.anim.setBoolean('isRidingMotor', true);
            this.playerModel.anim.setBoolean('isRiding', false);
        } else {
            this.playerModel.anim.setBoolean('isRiding', true);
            this.playerModel.anim.setBoolean('isRidingMotor', false);
        }
    }
    this.interpolatedPosition.lerp(this.bike.getPosition(),
        this.ball.getPosition(), 0.2);
    this.bike.setPosition(this.interpolatedPosition);
    //this.refPointForRotation.setPosition(this.ball.getPosition());

    //wheels
    this.wheels.forEach(wheel => {
        wheel.rotateLocal(1000 * distance * dt, 0, 0);
    });

    //lerp bike rot to ball pos
    if (this.grounded === false && this.isMoving === false) return;
    this.moveDirection = this.ball.getPosition();
    this.moveDirectionOrginal.copy(this.bike.getRotation());
    this.bike.lookAt(this.moveDirection.x, this.moveDirection.y, this.moveDirection.z);
    this.moveDirectionFinal.copy(this.bike.getRotation());
    //this.bike.setRotation(this.moveDirectionFinal);
    if (dt > 0.03) {
        this.bike.setRotation(new pc.Quat().slerp(this.moveDirectionOrginal, this.moveDirectionFinal, 0.5));
    } else {
        this.bike.setRotation(new pc.Quat().slerp(this.moveDirectionOrginal, this.moveDirectionFinal, dt * 5));
    }

};

BikeObby_PlayerController.prototype.LerpVectors = function (a, b, speed) {
    let abx = pc.math.lerp(a.x, b.x, speed);
    let aby = pc.math.lerp(a.y, b.y, speed);
    let abz = pc.math.lerp(a.z, b.z, speed);
    return new pc.Vec3(abx, aby, abz);
}

BikeObby_PlayerController.prototype.leanBike = function (dt) {
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

BikeObby_PlayerController.prototype.checkGround = function () {
    // Raycast between the two points
    const rayEnd = this.ball.getPosition().clone().add(this.jumpRayLength);
    const results = this.app.systems.rigidbody.raycastAll(this.ball.getPosition().add(pc.Vec3.UP), rayEnd);
    // If there was a hit
    for (let i = 0; i < results.length; i++) {
        const hitEntity = results[i].entity;
        if (hitEntity.tags.has('Ground') === true) {
            if (this.grounded === false) {
                this.canPressJump = true;
            }
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

BikeObby_PlayerController.prototype.setCamera = function () {
    this.camera = this.app.root.findByName('Camera');
    if (this.app.isMobile)
        this.camera.camera.farClip = 300;
    this.cameraPosEntity = this.entity.findByName('CameraPosition');
    this.cameraParent = this.entity.findByName('Camera Axis');
    this.cameraParent.addChild(this.camera);
    this.camera.setLocalPosition(this.cameraPosEntity.getLocalPosition());
    if (this.app.isMobile) {
        this.cameraScript = this.camera.script.mobileCameraController;
    } else {
        this.cameraScript = this.camera.script.cameraController;
    }
    this.cameraScript.enabled = true;
    this._frameMovementRight = new pc.Vec3();
    this._frameMovementForward = new pc.Vec3();
    this._frameMovementTotal = new pc.Vec3();
};