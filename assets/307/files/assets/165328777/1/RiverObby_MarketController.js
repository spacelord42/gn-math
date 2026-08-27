var RiverObbyMarketController = pc.createScript('riverObbyMarketController');

// initialize code called once per entity
RiverObbyMarketController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.riverObbyNetworkManager;
    this.marketPanel = this.entity.children[0];
    this.marketButton = this.app.root.findByName("ShopButton");
    this.marketButton.button.on('click', function (event) {
        this.enableMarket();
    }, this);
    this.skinPanel = this.marketPanel.findByName("Skin");
    this.skinPanelButton = this.marketPanel.findByName("MarketButtonSkin");
    this.skinPanelButton.button.on('click', function (event) {
        this.skinPanelButton.setLocalPosition(15, 380.48, 0);
        this.boatPanelButton.setLocalPosition(-3.683, 266.071, 0);
        this.boatPanel.enabled = false;
        this.skinPanel.enabled = true;
    }, this);
    this.boatPanelButton = this.marketPanel.findByName("MarketButtonBoat");
    this.boatPanel = this.marketPanel.findByName("Boat");
    this.boatPanelButton.button.on('click', function (event) {
        this.skinPanelButton.setLocalPosition(-3.683, 380.48, 0);
        this.boatPanelButton.setLocalPosition(15, 266.071, 0);
        this.boatPanel.enabled = true;
        this.skinPanel.enabled = false;
    }, this);
    this.closeButton = this.marketPanel.findByName("CloseButton");
    this.closeButton.button.on('click', function (event) {
        this.disableMarket();
    }, this);
};

// update code called every frame
RiverObbyMarketController.prototype.update = function (dt) {
    if (this.app.keyboard.wasPressed(pc.KEY_M)) {
        if (this.app.isMarketEnabled) {
            this.disableMarket();
        } else {
            this.enableMarket();
        }
    }
};

RiverObbyMarketController.prototype.enableMarket = function () {
    this.marketPanel.enabled = true;
    this.app.isMarketEnabled = true;
    this.app.fire("lockCamera", true);
    this.networkManager.setBlackBG(true);
};

RiverObbyMarketController.prototype.disableMarket = function () {
    this.marketPanel.enabled = false;
    this.app.isMarketEnabled = false;
    this.app.fire("lockCamera", false);
    this.networkManager.setBlackBG(false);
};
