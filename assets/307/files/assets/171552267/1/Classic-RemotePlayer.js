/*ClassicRemotePlayer script that handles non local player controls by Emre Şahin - emolingo games */
var ClassicRemotePlayer = pc.createScript('classicRemotePlayer');
ClassicRemotePlayer.attributes.add("nameText", { type: "entity" });
ClassicRemotePlayer.attributes.add("body", { type: "entity" });
ClassicRemotePlayer.attributes.add("deadObject", { type: "asset", assetType: "template" });

ClassicRemotePlayer.attributes.add("carpet", { type: "entity" });
ClassicRemotePlayer.attributes.add("carpetHand", { type: "entity" });
ClassicRemotePlayer.attributes.add("jet", { type: "entity" });
ClassicRemotePlayer.attributes.add("coil", { type: "entity" });
ClassicRemotePlayer.attributes.add("totem", { type: "entity" });
ClassicRemotePlayer.attributes.add("shoes", { type: "entity", array: true });

ClassicRemotePlayer.prototype.initialize = function () {
    this.uiManager = this.entity.root.findByName("NetworkManager").script.classicUimanager;
    this.currentMaterial = this.uiManager.skinMaterials[0];
    this.renderBody = this.body.findByName("N00b7.001").render;
    this.skinBody = this.entity.children[0];
    this.userName = this.entity.children[1];
    this.anim = this.skinBody.anim;
};

ClassicRemotePlayer.prototype.setPlayer = function (name) {
    this.nameText.element.text = name;
};

ClassicRemotePlayer.prototype.setSkin = function (skin) {
    let value = 0;
    if (skin) {
        value = this.findSkinId(skin);
    }
    else
        return;

    this.renderBody.meshInstances[0].material = this.uiManager.skinMaterials[value].resource;
    this.currentMaterial = this.uiManager.skinMaterials[value];
};

ClassicRemotePlayer.prototype.dead = function () {
    this.skinBody.enabled = false;
    this.userName.enabled = false;

    let deadEntity = this.deadObject.resource.instantiate();
    this.app.root.addChild(deadEntity);
    this.deadEntity = deadEntity;
    deadEntity.setPosition(this.entity.getPosition().clone());
    deadEntity.setRotation(this.entity.getRotation().clone());
    deadEntity.children.forEach((item) => {
        if (item.rigidbody) {
            item.rigidbody.enabled = true
            if (item.render.meshInstances.length > 0) {
                item.render.meshInstances[0].material = this.currentMaterial.resource
            }
        }
    });
    this.deadTimeout = setTimeout(() => {
        deadEntity.destroy();
    }, 5000)
};
ClassicRemotePlayer.prototype.respawn = function () {
    if (this.deadEntity)
        this.deadEntity.destroy();
    if (this.deadTimeout) {
        clearTimeout(this.deadTimeout);
    }
    this.skinBody.enabled = true;
    this.userName.enabled = true;
};
// update code called every frame
ClassicRemotePlayer.prototype.update = function (dt) {
    this.lerp(dt);
};

ClassicRemotePlayer.prototype.setAnim = function (air, walking, climbing) {
    //this.entity.anim.setBoolean("jumping");
    if (!this.isCarpet) {
        this.anim.setBoolean("falling", air);
        this.anim.setBoolean("walking", walking);
        this.anim.setBoolean("isClimbing", climbing);
    }
    else {
        this.anim.setBoolean("falling", false);
        this.anim.setBoolean("walking", false);
        this.anim.setBoolean("isClimbing", false);
    }
};

ClassicRemotePlayer.prototype.lerp = function (dt) {
    //position
    this.interpolatedPosition = this.entity.getPosition().clone();
    if (this.interpolatedPosition.distance(this.entity.networkPosition) < 20) {
        this.interpolatedPosition.lerp(this.entity.getPosition(),
            this.entity.networkPosition, 5 * dt);
        this.entity.setPosition(this.interpolatedPosition);
    } else {
        this.entity.setPosition(this.entity.networkPosition);
    }

    //rotation
    this.interpolatedRotation = this.body.getRotation().clone();
    this.interpolatedRotation.slerp(this.body.getRotation(),
        this.entity.networkRotation, 5 * dt);
    this.body.setRotation(this.interpolatedRotation);
};

ClassicRemotePlayer.prototype.findSkinId = function (name) {
    if (name == "default") {
        return 0;
    } else if (name == "angel") {
        return 1;
    } else if (name == "alien") {
        return 2;
    } else if (name == "ninja") {
        return 3;
    } else if (name == "pirate") {
        return 4;
    } else if (name == "devil") {
        return 5
    } else if (name == "discord") {
        return 6
    }
    return 0;
};

ClassicRemotePlayer.prototype.setShoe = function (enabled) {
    this.shoes[0].enabled = enabled
    this.shoes[1].enabled = enabled
};
ClassicRemotePlayer.prototype.setJetPack = function (enabled) {
    this.jet.enabled = enabled
};
ClassicRemotePlayer.prototype.setTotem = function (enabled) {
    this.totem.enabled = enabled
};
ClassicRemotePlayer.prototype.setCoil = function (enabled) {
    this.coil.enabled = enabled
};
ClassicRemotePlayer.prototype.setCarpet = function (enabled) {
    this.carpet.enabled = enabled
    this.isCarpet = enabled;
};
ClassicRemotePlayer.prototype.hasCarpet = function (enabled) {//hand
    this.carpetHand.enabled = enabled
};