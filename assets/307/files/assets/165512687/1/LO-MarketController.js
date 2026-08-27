var LoMarketController = pc.createScript('loMarketController');
LoMarketController.attributes.add("ladderRender", { type: "entity" });
LoMarketController.attributes.add("skinRender", { type: "entity" });

LoMarketController.attributes.add("ladderMat", { type: "asset", assetType: "material", array: true });
LoMarketController.attributes.add("skinMat", { type: "asset", assetType: "material", array: true });



LoMarketController.attributes.add("marketButtons", {
    type: "json", schema: [{
        name: "skin",
        type: "entity",
        array: true
    },
    {
        name: "sellectedSkin",
        type: "entity",
    },
    {
        name: "ladder",
        type: "entity",
        array: true
    },
    {
        name: "sellectedLadder",
        type: "entity",
    }],
});


// initialize code called once per entity
LoMarketController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("NetworkManager").script.loNetworkManager;
    this.uiManager = this.app.root.findByName("NetworkManager").script.loUimanager;
    console.log(Utils.getItem("lo-skin"))
    if (Utils.getItem("lo-skin")) {
        this.currentSkinMat = Number.parseInt(Utils.getItem("lo-skin"));
        this.skinRender.render.meshInstances[0].material = this.skinMat[this.currentSkinMat].resource;
    }
    else {
        this.currentSkinMat = 0;
        Utils.setItem("lo-skin", 0);
    }



    if (Utils.getItem("lo-ladder")) {
        this.currentLadderMat = Number.parseInt(Utils.getItem("lo-ladder"));

        this.ladderRender.render.meshInstances[0].material = this.ladderMat[this.currentLadderMat].resource;
    }
    else {
        this.currentLadderMat = 0;
        Utils.setItem("lo-ladder", 0);
    }



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

LoMarketController.prototype.onButtonSkin = function (id, fee, isAds, script) {
    if (!script.isOwn) {
        if (!isAds)
            if (this.app.coin >= fee) {
                console.log("complete")
                this.app.coin -= fee;
                Utils.setItem("loCoin", this.app.coin)
                this.app.fire("UpdateCoinText");
                script.isOwn = true;
                script.owned();
                this.setSkin(id);
            }
            else {
                const needMoney = fee - this.app.coin;
                this.app.fire('WarningTextController:setWarning', "you need " + needMoney + " gold to buy new skin", 5, new pc.Color(1, 0, 0, 1));
                console.log("non complete")
            }
        else {
            // ads rewarded
            fee--;
            script.fee--;
            script.showADS();
            if (script.fee <= 0) {
                script.isOwn = true;
                script.owned();
                this.setSkin(id);
            }
        }
    }
    else {
        this.setSkin(id);
        script.owned();
    }
};

LoMarketController.prototype.onButtonLadder = function (id, fee, isAds, script) {
    if (!script.isOwn) {
        if (!isAds)
            if (this.app.coin >= fee) {
                console.log("complete")
                this.app.coin -= fee;
                Utils.setItem("loCoin", this.app.coin)
                this.app.fire("UpdateCoinText");
                script.isOwn = true;
                script.owned();
                //this.setSkin(id);
                this.setLadder(id);

            }
            else {
                const needMoney = fee - this.app.coin;
                this.app.fire('WarningTextController:setWarning', "you need " + needMoney + " gold to buy new ladder", 5, new pc.Color(1, 0, 0, 1));
                console.log("non complete")
            }
        else {
            // ads rewarded
            fee--;
            script.fee--;
            script.showADS();
            if (script.fee <= 0) {
                script.isOwn = true;
                script.owned();
                //this.setSkin(id);
                this.setLadder(id);

            }
        }
    }
    else {
        this.setLadder(id);
        script.owned();
    }
};

LoMarketController.prototype.setSkin = function (id) {
    this.skinRender.render.meshInstances[0].material = this.skinMat[id].resource;
    Utils.setItem("lo-skin", id);
    if (this.networkManager.room)
        this.networkManager.room.send("SendSkin", { ladderSkin: Number.parseInt(Utils.getItem("lo-ladder")), playerSkin: Number.parseInt(Utils.getItem("lo-skin")) });
    //this.marketButtons.sellectedSkin.setPosition(this.marketButtons.skin[id]);
    let allSkins = Utils.getItem("lo-allSkins");
    if (allSkins) {
        if (JSON.parse(allSkins).skin.includes(id)) return;
        console.log(JSON.parse(allSkins))
        const json = JSON.parse(allSkins)
        json.skin.push(id);
        Utils.setItem("lo-allSkins", JSON.stringify(json));
    }
    else {
        let newItem = { skin: [], ladder: [] };
        let item = newItem.skin;
        item.push(id);
        const json = JSON.stringify(newItem);
        Utils.setItem("lo-allSkins", json);
    }
    //Utils.setItem("lo-Ladder",id);
}

LoMarketController.prototype.setLadder = function (id) {
    this.ladderRender.render.meshInstances[0].material = this.ladderMat[id].resource;
    Utils.setItem("lo-ladder", id);
    if (this.networkManager.room)
        this.networkManager.room.send("SendSkin", { ladderSkin: Number.parseInt(Utils.getItem("lo-ladder")), playerSkin: Number.parseInt(Utils.getItem("lo-skin")) });


    //this.marketButtons.sellectedSkin.setPosition(this.marketButtons.skin[id]);
    let allSkins = Utils.getItem("lo-allSkins");
    if (allSkins) {
        if (JSON.parse(allSkins).ladder.includes(id)) return;
        const json = JSON.parse(allSkins)
        json.ladder.push(id);
        Utils.setItem("lo-allSkins", JSON.stringify(json));
    }
    else {
        let newItem = { skin: [], ladder: [] };
        let item = newItem.ladder;
        item.push(id);
        const json = JSON.stringify(newItem);
        Utils.setItem("lo-allSkins", json);
    }
    //Utils.setItem("lo-Ladder",id);

};
// update code called every frame
LoMarketController.prototype.update = function (dt) {
    if (this.app.keyboard.wasPressed(pc.KEY_M)) {
        if (this.app.isMarketEnabled) {
            this.disableMarket();
        } else {
            this.enableMarket();
        }
    }
};

LoMarketController.prototype.enableMarket = function () {
    this.marketPanel.enabled = true;
    this.app.isMarketEnabled = true;

};

LoMarketController.prototype.disableMarket = function () {
    this.marketPanel.enabled = false;
    this.app.isMarketEnabled = false;
    this.uiManager.closeMenu();

};
