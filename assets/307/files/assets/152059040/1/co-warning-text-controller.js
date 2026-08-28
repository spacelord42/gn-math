/*CoWarningTextController script that instantiates warning template to UI panel by Emre Şahin - emolingo games */
var CoWarningTextController = pc.createScript('coWarningTextController');
// initialize code called once per entity
CoWarningTextController.prototype.initialize = function () {
    this.title = this.entity.children[0];
    this.app.on('WarningTextController:setWarning', this.setWarning, this);

    this.on('destroy', function () {
        clearTimeout(this.hideTimeout);
        this.app.off('WarningTextController:setWarning', this.setWarning, this);
    }, this);
};

CoWarningTextController.prototype.setWarning = function (title, lifetime, titleColor) {
    const titleClone = this.title.clone();
    this.entity.addChild(titleClone);
    titleClone.element.opacity = 1;
    titleClone.element.outlineThickness = 1;
    titleClone.element.text = title;
    if (titleColor == null)
        titleColor = new pc.Color(1, 0, 0, 1);
    titleClone.element.color = titleColor;
    titleClone.setLocalPosition(0, 0, 0);
    titleClone.setLocalScale(0, 0, 0);
    titleClone.enabled = true;

    if (lifetime == null)
        lifetime = 5;

    titleClone
        .tween(titleClone.getLocalPosition()).to(new pc.Vec3(0, 200, 0), lifetime, pc.SineOut)
        .start();
    titleClone
        .tween(titleClone.getLocalScale()).to(new pc.Vec3(1, 1, 1), 0.3, pc.SineOut)
        .start();

    this.hideTimeout = setTimeout(() => {
        const data = { value: 1 };
        titleClone
            .tween(data).to({ value: 0 }, lifetime / 2, pc.SineOut)
            .onUpdate((dt) => {
                titleClone.element.opacity = data.value;
                titleClone.element.outlineThickness = data.value - 0.2;
            })
            .onComplete(() => {
                titleClone.destroy();
            })
            .start();
    }, lifetime * 500);
};