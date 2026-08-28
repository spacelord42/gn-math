var RainbowObby_Coin = pc.createScript("RainbowObby_Coin");

RainbowObby_Coin.prototype.initialize = function () {
  this.entity.collision.on("triggerenter", (result) => {
    if (!result.script) return;
    if (!result.script.RainbowObby_CharacterController) return;
    if (!result.script.RainbowObby_CharacterController.isLocalPlayer) return;

    RainbowObby_Bank.addCoins(1);

    this.entity.fire("collected");
    this.entity.destroy();
  });
};
