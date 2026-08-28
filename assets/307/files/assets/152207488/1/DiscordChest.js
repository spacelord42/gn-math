/*BikeObby_DiscordChest script that opens emolingo games discord by Emre Şahin - emolingo games */
var BikeObby_DiscordChest = pc.createScript('discordChest');

// initialize code called once per entity
BikeObby_DiscordChest.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.networkManager;
    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.app.fire("popupController:showPopup",
                "Discord", "Would you like to join our discord to open?", true, this.entity, "openDiscord", "closePopup");
        }
    }, this);
    this.entity.collision.on('triggerleave', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.app.fire("popupController:hidePopup");
        }
    }, this);

    this.entity.on("openDiscord", () => {
        this.networkManager.increaseCoin(50);
        this.app.isPopupEnabled = false;
        if (this.networkManager.menuPanel.enabled == false)
            this.networkManager.menuButton.button.fire('click');
        window.open("https://discord.gg/QnZx3pMwHU", "_blank");
        this.app.fire('WarningTextController:setWarning', "Won +50 coin!", 10, new pc.Color(0, 1, 0, 1));
        this.networkManager.playerController.playerModel.sound.play("prize");
        this.entity.enabled = false;
    });
};