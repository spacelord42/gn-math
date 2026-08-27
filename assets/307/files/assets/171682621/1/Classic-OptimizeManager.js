/*ClassicOptimizeManager script that disables unused maps and enables the one required by Emre Şahin - emolingo games */
var ClassicOptimizeManager = pc.createScript('classicOptimizeManager');
ClassicOptimizeManager.attributes.add("world1", { type: "entity" });
ClassicOptimizeManager.attributes.add("world2", { type: "entity" });
ClassicOptimizeManager.attributes.add("world3", { type: "entity" });

ClassicOptimizeManager.prototype.initialize = function () {
    if (Utils.getItem("RainbowObby_currentCheckpoint")) {
        let checkPoint = Number.parseInt(Utils.getItem("RainbowObby_currentCheckpoint"))
        if (checkPoint > 153)
            this.world(3);
        else if (checkPoint > 102) {
            this.world(2);
        }
        else {
            this.world(1);
        }
    }
    else {
        this.world(0);
    }
    this.app.on("WorldControl", this.control, this)

    this.app.on("worldActive", this.world, this)
    this.on("destroy", () => {
        this.app.off("WorldControl", this.control, this)
        this.app.off("worldActive", this.world, this)
    })
};
ClassicOptimizeManager.prototype.control = function () {
    let checkPoint = this.app.currentCheckPoint;
    if (checkPoint > 153)
        this.world(3);
    else if (checkPoint > 102) {
        this.world(2);
    }
    else {
        this.world(1);
    }
};
// update code called every frame
ClassicOptimizeManager.prototype.world = function (number) {
    if (number == 1) {
        this.world1.enabled = true
        this.world2.enabled = false
        this.world3.enabled = false
    }
    else if (number == 2) {
        this.world1.enabled = false
        this.world2.enabled = true
        this.world3.enabled = false
    } else if (number == 3) {
        this.world3.enabled = false
        this.world3.enabled = false
        this.world3.enabled = true
    }
};