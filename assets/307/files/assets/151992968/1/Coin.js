/*BikeObby_Coin script that is for coins and coin collect mechanics by Emre Şahin - emolingo games */
var BikeObby_Coin = pc.createScript('coin');

// initialize code called once per entity
BikeObby_Coin.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.networkManager;
    this.tween();

    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.collect();
        }
    }, this);
};

BikeObby_Coin.prototype.collect = function () {
    this.networkManager.collectCoin();
    const pos = this.entity.getLocalPosition().clone();
    pos.y += 15;
    this.startY = pos.y;
    this.entity.tween(this.entity.getLocalPosition()).to(pos, 1, pc.SineInOut)
        .onUpdate((dt) => {
            this.entity.setLocalScale(this.entity.getLocalScale().mulScalar(0.95));
        })
        .onComplete(() => {
            this.entity.destroy();
        })
        .start();
};

BikeObby_Coin.prototype.tween = function () {
    if (this.app.isMobile) return;
    var time = Math.random() * 180;
    const pos = this.entity.getLocalPosition().clone();
    pos.y -= 1;
    this.startY = pos.y;
    const rotTween = new pc.Quat();
    this.entity.tween(this.entity.getLocalPosition()).to(pos, 0.5, pc.SineInOut)
        .onUpdate((dt) => {
            time += dt;
            rotTween.setFromEulerAngles(0, time * 200, 0);
            this.entity.setRotation(rotTween);
        })
        .yoyo(true)
        .loop(true)
        .start();
};