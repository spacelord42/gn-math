/*ClassicPortal script that handles portals that change map section by Emre Şahin - emolingo games */
var ClassicPortal = pc.createScript('classicPortal');
ClassicPortal.attributes.add("next", { type: "boolean", default: true });
ClassicPortal.attributes.add("to", { type: "number" });
ClassicPortal.attributes.add("eventFire", { type: "string" });
ClassicPortal.attributes.add("eventID", { type: "string" });

ClassicPortal.prototype.initialize = function () {
    this.entity.collision.on("triggerenter", this.trigger, this);
};

ClassicPortal.prototype.trigger = function (entity) {
    if (entity.tags.has("Player")) {
        if (this.next)
            this.app.fire("OnPortal", 1);
        else {
            this.app.fire("OnPortal", this.to, true);
        }
        this.app.fire(this.eventFire, this.eventID);
    }
};