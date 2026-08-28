var RiverObbyWaveEffect = pc.createScript('riverObbyWaveEffect');
RiverObbyWaveEffect.attributes.add("destroy", { type: "boolean" });
RiverObbyWaveEffect.attributes.add("autoStart", { type: "boolean", default: false });
RiverObbyWaveEffect.attributes.add("startScale", { type: "number", default: 0.5 });
RiverObbyWaveEffect.attributes.add("endScale", { type: "number", default: 2 });
RiverObbyWaveEffect.attributes.add("time", { type: "number", default: 1 });
// initialize code called once per entity
RiverObbyWaveEffect.prototype.initialize = function () {
    this.tween = null;
    if (this.autoStart)
        this.startEffect();
};

RiverObbyWaveEffect.prototype.startEffect = function () {
    if (this.tween) return;
    this.entity.setLocalScale(this.startScale, this.startScale, this.startScale)
    this.entity.sprite.opacity = 1;
    this.tween = this.entity.tween(this.entity.getLocalScale()).to(new pc.Vec3(this.endScale, this.endScale, this.endScale), this.time, pc.SineOut)
        .onUpdate((dt) => {
            this.entity.sprite.opacity -= dt / this.time;
        })
        .onComplete(() => {
            if (this.destroy) {
                this.entity.destroy();
            } else {
                this.entity.setLocalScale(this.startScale, this.startScale, this.startScale)
                this.entity.sprite.opacity = 1;
                this.tween = null;
                if (this.autoStart)
                    this.startEffect();
            }
        })
        .start();
};