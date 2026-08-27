/*BallObbyButton script that handles button clicks by Emre Şahin - emolingo games */
var BallObbyButton = pc.createScript('ballObbyButton');
BallObbyButton.attributes.add("type", { type: "string" });
BallObbyButton.prototype.initialize = function () {
    this.entity.button.on("click", () => {
        if (this.type == "MarketClose") {
            this.entity.parent.enabled = false;
        }
    });
};

BallObbyButton.prototype.update = function (dt) {

};