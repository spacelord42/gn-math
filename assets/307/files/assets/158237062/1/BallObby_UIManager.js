/*BallObbyUimanager script that handles UI panels and interactions by Emre Şahin - emolingo games */
var BallObbyUimanager = pc.createScript('ballObbyUimanager');
BallObbyUimanager.attributes.add("closeMarket", { type: "entity" });
BallObbyUimanager.prototype.initialize = function () {
    this.marketPanelTween = null;

    this.closeMarket.button.on("click", () => {
        this.closeMarket.parent.enabled = false;
    });
    let market = this.closeMarket.parent;
    market.enabled = false;
};

BallObbyUimanager.prototype.update = function (dt) {
    if (this.app.keyboard.wasPressed(pc.KEY_M)) {
        let market = this.closeMarket.parent;
        if (this.marketPanelTween != null) return;
        if (market.enabled == false) {
            market.enabled = true;
            market.setLocalScale(0.5, 0.5, 0.5);
            this.marketPanelTween = market
                .tween(market.getLocalScale()).to(new pc.Vec3(0.805, 0.805, 0.805), 0.2, pc.SineOut)
                .onComplete(() => {
                    this.marketPanelTween = null;
                })
                .start();
        }
        else {
            market.setLocalScale(0.805, 0.805, 0.805);
            this.marketPanelTween = market
                .tween(market.getLocalScale()).to(new pc.Vec3(0, 0, 0), 0.2, pc.SineOut)
                .onComplete(() => {
                    market.enabled = false;
                    this.marketPanelTween = null;

                })
                .start();
        }
    }
};