var LoRewardedPowerUp = pc.createScript('loRewardedPowerUp');

// initialize code called once per entity
LoRewardedPowerUp.prototype.initialize = function () {
    this.app.on("LO_OpenPowerUp", this.openPowerUp, this);
    this.entity.button.on("click", this.rewarded, this)
    this.isTween = false;
    this.on("destroy", () => {
        this.app.off("LO_OpenPowerUp", this.openPowerUp, this);
    })
};
LoRewardedPowerUp.prototype.rewarded = function () {
    if (this.app.isRewardedLadder)
        this.app.fire("LO_RewardedLadder")
};
// update code called every frame
LoRewardedPowerUp.prototype.update = function (dt) {
    if (!this.isTween && this.app.isRewardedLadder) {
        this.isTween = true;
        this.entity
            .tween(this.entity.getLocalPosition())
            .to(new pc.Vec3(0.542, 49.223, 0), .5, pc.SineOut)
            .onComplete(() => {

            })
            .start();
    }
    if (this.isTween && !this.app.isRewardedLadder) {
        console.log("sa");
        this.isTween = false;
        this.entity
            .tween(this.entity.getLocalPosition())
            .to(new pc.Vec3(-356.88, 49.223, 0), .5, pc.SineOut)
            .onComplete(() => {

            })
            .start();
    }
};
