/*ClientWheelParent script that sets the wheels tempPosition by Burak Ersin - emolingo games */
var ClientWheelParent = pc.createScript('clientWheelParent');
ClientWheelParent.attributes.add("wheels", { type: "entity" });
ClientWheelParent.attributes.add("nameText", { type: "entity" });

ClientWheelParent.prototype.initialize = function () {
    this.timer = 0;
    this.tempPosition = this.entity.getPosition().clone();
    this.alpha = 0;
    this.steering = 0;
};

ClientWheelParent.prototype.update = function (dt) {
    this.timer += dt;
    if (this.timer > 0.2) {
        this.timer = 0;
        this.tempPosition = this.entity.getPosition().clone();
    }

    var position = this.entity.getPosition().clone();

    var magnitude = (position.sub(this.tempPosition));
    this.alpha = magnitude.x + magnitude.z;
};
