var RainbowObby_Chest = pc.createScript("RainbowObby_Chest");

RainbowObby_Chest.prototype.initialize = function () {
  this._opened = false;
  this.entity.collision.on("triggerenter", (result) => {
    if (!result.script) return;
    if (!result.script.RainbowObby_CharacterController) return;
    if (!result.script.RainbowObby_CharacterController.isLocalPlayer) return;

    this.open();
  });
};

RainbowObby_Chest.prototype.open = function () {
  if (this._opened) {
    this.app.fire("character:setFlyingCarpet", true);
    return;
  }
  this._opened = true;
  this.entity.anim.setTrigger("open", true);

  // Get SFX component
  const sfx = this.app.root.findByName("SFX");
  const sound = sfx.sound;
  sound.play("chest");

  setTimeout(() => {
    this.app.fire("character:setFlyingCarpet", true);
  }, 1000);
};
