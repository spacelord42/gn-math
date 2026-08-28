/*ClassicCoin script that is for coins and coin collect mechanics by Emre Şahin - emolingo games */
var ClassicCoin = pc.createScript('classicCoin');

ClassicCoin.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.classicNetworkManager;
    this.tween();

    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.collect();
        }
    }, this);
};

ClassicCoin.prototype.collect = function () {
    this.app.coin += 1;
    this.app.fire("ClassicMusic", "coin")
    this.app.fire("UpdateProgresTexts");

    this.networkManager.collectCoin();
    const pos = this.entity.getLocalPosition().clone();
    pos.y += 15;
    this.startY = pos.y;
    this.entity.tween(this.entity.getLocalPosition()).to(pos, 2, pc.SineInOut)
        .onUpdate((dt) => {
            this.entity.setLocalScale(this.entity.getLocalScale().mulScalar(0.95));
        })
        .onComplete(() => {
            this.entity.destroy();
        })
        .start();
};

ClassicCoin.prototype.tween = function () {
    if (this.app.isMobile) return;
    var time = Math.random() * 180;
    const pos = this.entity.getLocalPosition().clone();
    pos.y -= 1;
    this.startY = pos.y;
    const rotTween = new pc.Quat();
    this.entity.tween(this.entity.getLocalPosition()).to(pos, 1, pc.SineInOut)
        .onUpdate((dt) => {
            time += dt;
            rotTween.setFromEulerAngles(0, time * 100, 0);
            this.entity.setRotation(rotTween);
        })
        .yoyo(true)
        .loop(true)
        .start();
};