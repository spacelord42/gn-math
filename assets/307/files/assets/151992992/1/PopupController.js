/*BikeObby_PopupController script that handles rewarded popup panels by Emre Şahin - emolingo games */
var BikeObby_PopupController = pc.createScript('popupController');

// initialize code called once per entity
BikeObby_PopupController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName('NetworkManager').script.networkManager;
    this.popup = this.entity.children[0];
    this.closeButton = this.popup.children[0];
    this.title = this.popup.children[1].element;
    this.desc = this.popup.children[2].element;
    this.yesButton = this.popup.children[3].children[1];
    this.noButton = this.popup.children[3].children[0];

    this.app.on("popupController:showPopup", this.showPopup, this);
    this.app.on("popupController:hidePopup", this.hidePopup, this);

    this.on('destroy', function () {
        this.app.off("popupController:showPopup", this.showPopup, this);
        this.app.off("popupController:hidePopup", this.hidePopup, this);
        if (this.blackBackgroundTween)
            this.blackBackgroundTween.stop();
    }, this);
};

BikeObby_PopupController.prototype.hidePopup = function () {
    this.removeListeners();
    this.networkManager.playerController.playerModel.sound.play("close");
    this.popup.enabled = false;
    this.app.isPopupEnabled = false;
    this.networkManager.blackBackground.enabled = false;
};

//noEvent == closePopup gelirse popup'i kapat
BikeObby_PopupController.prototype.showPopup = function (title, desc, isYesNoQuestion, callerEntity, yesEvent, noEvent, data, isAd) {
    this.networkManager.playerController.playerModel.sound.play("popup");
    if (isYesNoQuestion) {
        this.yesButton.enabled = true;
        this.noButton.enabled = true;
    } else {
        this.noButton.enabled = false;
    }

    if (isAd === true) {
        this.yesButton.children[0].children[1].enabled = true;
    } else {
        this.yesButton.children[0].children[1].enabled = false;
    }

    if (data != null && data.yesButtonText != null) {
        this.yesButton.children[0].children[0].element.text = data.yesButtonText;
    } else {
        this.yesButton.children[0].children[0].element.text = "YES";
    }

    this.title.text = title;
    this.desc.text = desc;

    this.closeButton.button.on('click', function (event) {
        if (noEvent !== "closePopup") {
            if (this.oldNoEvent) {
                callerEntity.off(this.oldNoEvent);
            }
            callerEntity.fire(noEvent, data);
            this.oldNoEvent = noEvent;
        }
        this.setTween(false);
    }, this);

    this.yesButton.button.on('click', function (event) {
        if (this.oldYesEvent) {
            callerEntity.off(this.oldYesEvent);
        }

        callerEntity.fire(yesEvent, data);

        this.oldYesEvent = yesEvent;
        this.setTween(false);
    }, this);

    this.noButton.button.on('click', function (event) {
        this.closeButton.button.fire('click', event);
    }, this);

    this.setTween(true);
};

BikeObby_PopupController.prototype.setTween = function (state) {
    this.popup.enabled = true;
    if (state) {
        this.app.isPopupEnabled = true;
        this.networkManager.blackBackground.enabled = true;
        this.data = { value: 0 };
        this.blackBackgroundTween = this.networkManager.blackBackground
            .tween(this.data).to({ value: 0.5 }, 0.2, pc.SineOut)
            .onUpdate((dt) => {
                this.networkManager.blackBackground.element.opacity = this.data.value;
            })
            .start();

        this.popup.setLocalScale(new pc.Vec3(0.9, 0.9, 0.9));
        this.popup.tween(this.popup.getLocalScale()).to(new pc.Vec3(1, 1, 1), 0.2, pc.SineOut).start();
    } else {
        this.app.isPopupEnabled = false;
        this.removeListeners();
        this.popup.setLocalScale(new pc.Vec3(1, 1, 1));
        this.popup.tween(this.popup.getLocalScale()).to(new pc.Vec3(0.5, 0.5, 0.5), 0.1, pc.SineOut).start();

        this.data = { value: 0.5 };
        this.blackBackgroundTween = this.networkManager.blackBackground
            .tween(this.data).to({ value: 0 }, 0.1, pc.SineOut)
            .onUpdate((dt) => {
                if (this.networkManager.blackBackground.element)
                    this.networkManager.blackBackground.element.opacity = this.data.value;
            })
            .onComplete(() => {
                this.networkManager.blackBackground.enabled = false;
                this.popup.enabled = false;
                this.app.isPopupEnabled = false;
            })
            .start();
    }
};

BikeObby_PopupController.prototype.removeListeners = function () {
    if (this.closeButton.button)
        this.closeButton.button.off('click');
    if (this.yesButton.button)
        this.yesButton.button.off('click');
    if (this.noButton.button)
        this.noButton.button.off('click');
}