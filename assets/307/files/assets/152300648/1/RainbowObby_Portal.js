var RainbowObby_Portal = pc.createScript("RainbowObby_Portal");

RainbowObby_Portal.attributes.add("teleportCoords", {
  type: "vec3",
  title: "Teleport Coords",
});

RainbowObby_Portal.prototype.initialize = function () {
  this.entity.collision.on("triggerenter", (result) => {
    if (!result.script) return;
    if (!result.script.RainbowObby_CharacterController) return;
    if (!result.script.RainbowObby_CharacterController.isLocalPlayer) return;

    result.script.RainbowObby_CharacterController.teleport(this.teleportCoords);

    // Remove all rewarded stuff
    this.app.fire("character:setJetpackFuel", 0);
    this.app.fire("character:setJumpCoilTimer", 0);
    this.app.fire("character:setBootsTimer", 0);
    this.app.fire("character:setTotemOfUndying", false);
    this.app.fire("character:setFlyingCarpet", false);
  });
};
