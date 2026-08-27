/*BikeObby_OtherPlayerController script that handles non local player controls by Emre Şahin - emolingo games */
var BikeObby_OtherPlayerController = pc.createScript('otherPlayerController');
BikeObby_OtherPlayerController.attributes.add('deadPlayer', { type: 'asset', assetType: 'template' });
// initialize code called once per entity
BikeObby_OtherPlayerController.prototype.initialize = function () {
    this.body = this.entity.children[0];
    this.bike = this.body.children[2];
    this.playerModel = this.body.findByName("PlayerModel");
    this.dust = this.body.findByName("Dust").particlesystem;
    this.playerRendererEntity = this.playerModel.findByName("Noob");
    this.wheels = [this.bike.children[0], this.bike.children[1]];
    this.isRidingMotor = false;
    this.isDied = false;
    this.jumpCoil = this.entity.findByName("JumpCoil");
    this.totem = this.entity.findByName("Totem");
    this.jetpack = this.entity.findByName("Jetpack");
    this.jetpackParticle = this.jetpack.children[1].particlesystem;
    this.username = this.entity.findByName("username").element;
};

// update code called every frame
BikeObby_OtherPlayerController.prototype.update = function (dt) {
    this.checkMovementDelta(dt);
};


BikeObby_OtherPlayerController.prototype.enableJumpCoil = function () {
    this.jumpCoil.enabled = true;
};

BikeObby_OtherPlayerController.prototype.disableJumpCoil = function () {
    this.jumpCoil.enabled = false;
};

BikeObby_OtherPlayerController.prototype.enableTotem = function () {
    this.totem.enabled = true;
};

BikeObby_OtherPlayerController.prototype.disableTotem = function () {
    this.totem.enabled = false;
};

BikeObby_OtherPlayerController.prototype.enableJetpack = function () {
    this.jetpack.enabled = true;
};

BikeObby_OtherPlayerController.prototype.disableJetpack = function () {
    this.jetpack.enabled = false;
};

BikeObby_OtherPlayerController.prototype.useJetpack = function () {
    this.jetpackParticle.play();
};

BikeObby_OtherPlayerController.prototype.dontUseJetpack = function () {
    this.jetpackParticle.stop();
};

BikeObby_OtherPlayerController.prototype.died = function () {
    if (this.isDied) return;
    this.isDied = true;
    const deadPlayerEntity = this.deadPlayer.resource.instantiate();
    const playerPos = this.body.getPosition().clone();
    this.app.root.addChild(deadPlayerEntity);
    deadPlayerEntity.setPosition(playerPos.x, playerPos.y, playerPos.z);
    deadPlayerEntity.setRotation(this.playerModel.getRotation().clone());
    deadPlayerEntity.children[0].setLocalEulerAngles(0, 0, 0);
    const deadPlayerEntityBody = deadPlayerEntity.children[0];
    for (let i = 0; i < deadPlayerEntityBody.children.length; i++) {
        deadPlayerEntityBody.children[i].rigidbody.applyImpulse(this.body.up.scale(-5));
    }
    this.playerRendererEntity.enabled = false;
    deadPlayerEntityBody.enabled = true;
    this.entity.spawnedDeadBody = deadPlayerEntity;
};

BikeObby_OtherPlayerController.prototype.respawn = function () {
    this.playerRendererEntity.enabled = true;
    if (this.entity.spawnedDeadBody)
        this.entity.spawnedDeadBody.destroy();
    this.isDied = false;
};

BikeObby_OtherPlayerController.prototype.checkMovementDelta = function (dt) {
    //lerp bike pos to ball pos
    const distance = this.body.getPosition().distance(this.entity.networkPosition);
    if (distance < 0.1) {
        this.dust.stop();
        if (this.isRidingMotor == false) {
            this.playerModel.anim.setBoolean('isRiding', false);
        }
    } else {
        if (this.entity.grounded)
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
    //wheels
    this.wheels.forEach(wheel => {
        wheel.rotateLocal(1000 * distance * dt, 0, 0);
    });
};