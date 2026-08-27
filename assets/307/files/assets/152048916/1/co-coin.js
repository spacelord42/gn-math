/*CoCoin script that is for coins and coin collect mechanics by Emre Şahin - emolingo games */
var CoCoin = pc.createScript('coCoin');

CoCoin.prototype.initialize = function () {
    const collectedCoins = JSON.parse(CoSaveSystem.getItem("CAROBBY_collectedCoins"));
    if (collectedCoins[this.entity.name] != null) {
        this.entity.destroy();
    } else {
        this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    }
};

CoCoin.prototype.onTriggerEnter = function (entity) {
    if (entity.tags.has("player") == false) return;

    this.app.fire("openSound:coin");
    let collectedCoins = JSON.parse(CoSaveSystem.getItem("CAROBBY_collectedCoins"));
    this.entity
        .tween(this.entity.getLocalScale())
        .to(new pc.Vec3(0, 0, 0), 0.25, pc.SineInOut)
        .onComplete(() => {
            CoSaveSystem.setItem("CAROBBY_coin", (CoSaveSystem.getItem("CAROBBY_coin") * 1) + 1);
            collectedCoins[this.entity.name] = true;
            CoSaveSystem.setItem("CAROBBY_collectedCoins", JSON.stringify(collectedCoins));
            this.app.fire("changedCoin");
            this.entity.destroy();
        }).start();
};