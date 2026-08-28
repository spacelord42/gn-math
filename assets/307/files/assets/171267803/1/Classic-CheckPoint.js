/*ClassicCheckPoint script that handles checkpoint points placed on map by Emre Şahin - emolingo games */
var ClassicCheckPoint = pc.createScript('classicCheckPoint');
ClassicCheckPoint.attributes.add("coin", { type: "asset", assetType: "template" })
ClassicCheckPoint.attributes.add("isEnd", { type: "boolean", default: false })

ClassicCheckPoint.prototype.initialize = function () {
    this.entity.collision.on("collisionstart", this.collisionEnter, this);
    if (this.coin) {
        if (this.app.currentCheckPoint < this.index) {
            const coin = this.coin.resource.instantiate();
            coin.setPosition(
                this.entity.getPosition().clone().add(new pc.Vec3(0, 2.5, 0))
            );
            this.app.root.addChild(coin);
        }
    }
};

ClassicCheckPoint.prototype.collisionEnter = function (result) {
    if (!result) return;
    if (result.other.tags.has("Player")) {
        if (this.index > this.app.currentCheckPoint) {
            this.app.currentCheckPoint = this.index;
            Utils.setItem("RainbowObby_currentCheckpoint", this.index)
            this.app.fire("ClassicMusic", "checkpoint");
        }
        if (this.isEnd) {
            this.app.elapsedTimeOff = true;
            Utils.setItem("Classic_elapsedTimerOff", 1)
        }
    }
    this.app.fire("UpdateProgresTexts");
};