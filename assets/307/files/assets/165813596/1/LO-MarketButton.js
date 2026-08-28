var LoMarketButton = pc.createScript('loMarketButton');
LoMarketButton.attributes.add("skinButton", { type: "boolean" });
LoMarketButton.attributes.add("ladderButton", { type: "boolean" });
LoMarketButton.attributes.add("index", { type: "number" });
LoMarketButton.attributes.add("fee", { type: "number" });
LoMarketButton.attributes.add("ads", { type: "boolean" });
LoMarketButton.attributes.add("isOwn", { type: "boolean" });

LoMarketButton.prototype.initialize = function () {
    this.marketScript = this.entity.parent.parent.parent.parent.script.loMarketController;
    this.entity.button.on("click", this.enterButton, this);
    this.text = this.entity.findByName("Text");
    this.text.element.text = this.fee;

    let skinJson = JSON.parse(Utils.getItem("lo-allSkins"));
    if (skinJson) {
        if (this.skinButton)
            for (let i = 0; i < skinJson.skin.length; i++) {
                if (skinJson.skin[i] === this.index) {
                    this.isOwn = true;
                    this.owned();
                }
            }
        else {
            for (let i = 0; i < skinJson.ladder.length; i++) {
                if (skinJson.ladder[i] === this.index) {
                    this.isOwn = true;
                    this.owned();
                }
            }
        }
    }
    /*
    for (let i = 0; i < skinJson.skin.length; i++) {

    }*/
};

LoMarketButton.prototype.enterButton = function () {
    if (this.skinButton)
        this.marketScript.onButtonSkin(this.index, this.fee, this.ads, this);
    else if (this.ladderButton)
        this.marketScript.onButtonLadder(this.index, this.fee, this.ads, this);
};

LoMarketButton.prototype.owned = function () {
    this.entity.findByName("Text").parent.enabled = false;
};
LoMarketButton.prototype.showADS = function () {
    this.text.element.text = this.fee;
}; 