/*CoPlayerSpeedController script that kills player if speed is too high by Burak Ersin - emolingo games */
var CoPlayerSpeedController = pc.createScript('coPlayerSpeedController');
CoPlayerSpeedController.attributes.add('car', { type: 'entity' });
CoPlayerSpeedController.attributes.add('player', { type: 'entity' });

CoPlayerSpeedController.prototype.initialize = function () {
    this.networkManager = this.app.root.findByName("Network Manager").script.coNetworkManager;
}

CoPlayerSpeedController.prototype.postUpdate = function (dt) {
    if (this.car && this.car.script) {
        var speed = this.car.script.vehicle.speed;
        var absSpeed = Math.abs(speed);
        var realSpeed = Math.round(absSpeed)
        this.app.fire("onChangedCarSpeed", realSpeed);
        if (this.player != undefined)
            this.car.script.coSoundController.distance = speed / 20;
        let vehicleScript = this.car.script.vehicle;
        let playerScript = this.player.script.coPlayer;
        if (realSpeed > 200 && playerScript.isDead == false) {
            playerScript.isDead = true;
            this.app.fire("playerDied");
        }
    }
};