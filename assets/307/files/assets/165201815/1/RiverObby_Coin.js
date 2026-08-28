var RiverObbyCoin = pc.createScript('riverObbyCoin');

// initialize code called once per entity
RiverObbyCoin.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.riverObbyNetworkManager;
    this.tween();

    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.collect();
        }
    }, this);
};

RiverObbyCoin.prototype.collect = function () {
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

RiverObbyCoin.prototype.tween = function () {
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