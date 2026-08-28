var RainbowObby_DeathOnTouch = pc.createScript("RainbowObby_DeathOnTouch");

RainbowObby_DeathOnTouch.prototype.initialize = function () {
  this.entity.collision.on("collisionstart", this.onCollisionStart, this);
};

RainbowObby_DeathOnTouch.prototype.onCollisionStart = function (result) {
  if (!result.other.script) return;

  const script = result.other.script.RainbowObby_CharacterController;
  if (script) {
    if (script.isLocalPlayer) {
      if (script._hasTotemOfUndying) {
        script.setTotemOfUndying(false);
        return;
      }
      script.die();
    }
  }
};
