var RainbowObby_DeadNoob = pc.createScript("RainbowObby_DeadNoob");

RainbowObby_DeadNoob.attributes.add("renderTargetsArray", {
  type: "entity",
  array: true,
  title: "Render Targets Array",
  description: "The array of render targets",
});

RainbowObby_DeadNoob.prototype.setSkin = function (skin) {
  // Set the skin
  const skins = this.app.assets.findByTag("RainbowObby_skin");
  for (const skinAsset of skins) {
    if (skinAsset.name === skin) {
      for (const renderTarget of this.renderTargetsArray) {
        const meshInstances = renderTarget.render.meshInstances;
        for (const meshInstance of meshInstances) {
          meshInstance.material = skinAsset.resource;
        }
      }
      break;
    }
  }
};
