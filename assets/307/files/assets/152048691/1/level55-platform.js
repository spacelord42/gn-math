/*Level55Platform script that tweens section 55 platform by Burak Ersin - emolingo games */
var Level55Platform = pc.createScript('level55Platform');
Level55Platform.attributes.add("time", { type: "number" });

Level55Platform.attributes.add("delay", { type: "number" });


Level55Platform.prototype.initialize = function () {
    this.firstPosition = this.entity.parent.getLocalPosition().clone();
    this.activity = true;
    this.entity.collision.on('triggerenter', this.tween, this);

};
Level55Platform.prototype.tween = function (event) {
    if (event.tags.has("player") == false) return;
    if (this.activity == false) return;

    let localPosition = this.entity.parent.getLocalPosition()
    const pos = new pc.Vec3(localPosition.x, localPosition.y - 10000, localPosition.z);

    this.activity = false;

    this.entity.parent
        .tween(this.entity.parent.getLocalPosition())
        .to(pos, this.time, pc.Linear)
        .delay(this.delay)
        .onComplete(() => {/*
            this.entity.parent.enabled = false;
            setTimeout(
                () => {
                    this.entity.parent.enabled = true;
                }, 1000
            );*/
            this.activity = true;
            this.entity.parent.setLocalPosition(this.firstPosition);

        })
        .start();
};

Level55Platform.prototype.tween2 = function (dt) {

};

