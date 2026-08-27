var RainbowObby_ConfettiStuff = pc.createScript("RainbowObby_ConfettiStuff");

RainbowObby_ConfettiStuff.attributes.add("particles", {
  type: "entity",
  title: "Confetti",
});

RainbowObby_ConfettiStuff.prototype.initialize = function () {
  this.entity.collision.on("triggerenter", (result) => {
    if (!result.script) return;
    if (!result.script.RainbowObby_CharacterController) return;
    if (!result.script.RainbowObby_CharacterController.isLocalPlayer) return;
    if (this._used) return;

    this._used = true;
    this.particles.particlesystem.play();
    setTimeout(() => {
      this.particles.particlesystem.stop();
    }, 10000);
  });
};
