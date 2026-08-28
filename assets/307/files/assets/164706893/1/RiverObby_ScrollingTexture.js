var RiverObbyScrollingTexture = pc.createScript('riverObbyScrollingTexture');


RiverObbyScrollingTexture.attributes.add('materialAsset', {
    type: 'asset'
});

RiverObbyScrollingTexture.attributes.add('speed', {
    type: 'vec2',
});
RiverObbyScrollingTexture.attributes.add('opacity', { type: "boolean" });

RiverObbyScrollingTexture.tmpVec2 = new pc.Vec2();
RiverObbyScrollingTexture.tmpOffset = new pc.Vec2();

RiverObbyScrollingTexture.prototype.initialize = function () {
    // get the material that we will animate
    if (this.materialAsset) {
        this.material = this.materialAsset.resource;
    }
};

RiverObbyScrollingTexture.prototype.update = function (dt) {
    return;


    var velocity = RiverObbyScrollingTexture.tmpVec2;
    var offset = RiverObbyScrollingTexture.tmpOffset;

    // Calculate how much to offset the texture
    // Speed * dt
    velocity.set(this.speed.x, this.speed.y);
    velocity.scale(dt);

    // Update the diffuse and normal map offset values
    offset.copy(this.material.emissiveMapOffset);
    offset.add(velocity);

    //this.material.offset.set(new pc.Vec2(this.speed.x * dt, 0));
    this.material.emissiveMapOffset = offset;
    this.material.normalMapOffset = offset;
    this.material.diffuseMapOffset = offset;
    if (this.opacity)
        this.material.opacityMapOffset = offset;

    this.material.update();
};
