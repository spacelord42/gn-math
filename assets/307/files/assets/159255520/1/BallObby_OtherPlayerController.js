/*BallObbyOtherPlayerController script that handles non local player controls by Emre Şahin - emolingo games */
var BallObbyOtherPlayerController = pc.createScript('ballObbyOtherPlayerController');

BallObbyOtherPlayerController.attributes.add('deadPlayer', { type: 'asset', assetType: 'template' });
// initialize code called once per entity
BallObbyOtherPlayerController.prototype.initialize = function () {
    this.body = this.entity.children[0];
    this.playerModel = this.body.children[0];
    this.ball = this.playerModel.children[0];
    this.dust = this.body.findByName("Dust").particlesystem;
    this.isDied = false;
    this.username = this.entity.findByName("username").element;
};

// update code called every frame
BallObbyOtherPlayerController.prototype.update = function (dt) {
    this.checkMovementDelta(dt);
};

BallObbyOtherPlayerController.prototype.died = function () {
    if (this.isDied) return;
    this.isDied = true;
    this.playerModel.enabled = false;
};

BallObbyOtherPlayerController.prototype.respawn = function () {
    this.playerModel.enabled = true;
    this.isDied = false;
};

BallObbyOtherPlayerController.prototype.checkMovementDelta = function (dt) {
    //lerp bike pos to ball pos
    const distance = this.body.getPosition().distance(this.entity.networkPosition);
    if (distance < 0.1) {
        this.dust.stop();
    } else {
        if (this.entity.grounded)
            this.dust.play();
        else
            this.dust.stop();
    }
};