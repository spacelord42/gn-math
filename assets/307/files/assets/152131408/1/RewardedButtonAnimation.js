var RewardedButtonAnimation = pc.createScript('rewardedButtonAnimation');

// initialize code called once per entity
RewardedButtonAnimation.prototype.initialize = function () {
    this.whiteCover2 = this.entity.findByName('WhiteCover');
    this.whiteCover2.element.opacity = 0;
    this.opacity = { value: 0 };

    this.line = this.entity.findByName('Line');
    this.line2 = this.entity.findByName('Line2');
    this.linePos = this.line.getLocalPosition().clone();
    this.line2Pos = this.line2.getLocalPosition().clone();

    this.timerTween = this.entity.tween(0)
        .to(1, 0.25, pc.Linear)
        .yoyo(false)
        .onComplete(this.FadeIn.bind(this), this);

    this.lineTween = this.line.tween(this.line.getLocalPosition()).to({ x: this.line.getLocalPosition().x + 600, y: 0, z: 0 }, 0.5, pc.SineInOut)
        .yoyo(true)
        .repeat(2)
        .onComplete((function () {
            this.line.setLocalPosition(this.linePos.x, this.linePos.y, this.linePos.z);
        }).bind(this));

    this.line2Tween = this.line2.tween(this.line2.getLocalPosition()).to({ x: this.line2.getLocalPosition().x + 600, y: 0, z: 0 }, 0.5, pc.SineInOut)
        .yoyo(true)
        .repeat(2)
        .onComplete((function () {
            this.line2.setLocalPosition(this.line2Pos.x, this.line2Pos.y, this.line2Pos.z);
        }).bind(this));

    this.animateTween = this.entity.tween(this.entity.getLocalScale()).to({ x: 1.2, y: 1.2, z: 1 }, 0.25, pc.SineInOut)
        .delay(0.25)
        .yoyo(true)
        .repeat(2);

    this.time = 0;
    this.tweenTime = 0;
};

RewardedButtonAnimation.prototype.update = function (dt) {
    this.time += dt;
    if (this.tweenTime < Date.now()) {
        this.tweenTime = Date.now() + 2000;
        this.lineTween.stop();
        this.line2Tween.stop();
        //this.animateTween.stop();
        this.timerTween.stop();

        this.entity.setLocalScale(1, 1, 1);
        this.line.setLocalPosition(this.linePos.x, this.linePos.y, this.linePos.z);
        this.line2.setLocalPosition(this.line2Pos.x, this.line2Pos.y, this.line2Pos.z);

        this.lineTween.start();
        this.line2Tween.start();
        //this.animateTween.start();
        this.timerTween.start();
    }
};

// White Cover Opacity
RewardedButtonAnimation.prototype.FadeIn = function () {
    this.opacity.value = this.whiteCover2.element.opacity;

    if (this.tween) {
        this.tween.stop();
    }

    this.tween = this.whiteCover2
        .tween(this.opacity)
        .onUpdate(this.onFadeIn.bind(this))
        .onComplete(this.FadeOut.bind(this))
        .to({ value: 0.6 }, 0.25, pc.SineOut).start();
};

RewardedButtonAnimation.prototype.onFadeIn = function () {
    this.whiteCover2.element.opacity = this.opacity.value;
};

RewardedButtonAnimation.prototype.onFadeOut = function () {
    this.whiteCover2.element.opacity = this.opacity.value;
};

RewardedButtonAnimation.prototype.FadeOut = function () {
    this.opacity.value = this.whiteCover2.element.opacity;

    if (this.tween) {
        this.tween.stop();
    }

    this.tween = this.whiteCover2
        .tween(this.opacity)
        .onUpdate(this.onFadeOut.bind(this))
        .to({ value: 0.0 }, 0.25, pc.SineOut).start();
};