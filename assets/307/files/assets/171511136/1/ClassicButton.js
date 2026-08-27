/*ClassicButton script that handles button interactions by Emre Şahin - emolingo games */
var ClassicButton = pc.createScript('classicButton');
ClassicButton.attributes.add("eventName", { type: "string" });
ClassicButton.attributes.add("isNumber", { type: "boolean" });
ClassicButton.attributes.add("id", { type: "number" });

ClassicButton.prototype.initialize = function () {
    this.entity.button.on("click", this.click, this);

};

ClassicButton.prototype.click = function () {
    if (this.isNumber)
        this.app.fire(this.eventName, this.id);
    else
        this.app.fire(this.eventName);
};