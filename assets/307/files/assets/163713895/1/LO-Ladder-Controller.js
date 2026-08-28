var LoLadderController = pc.createScript('loLadderController');
LoLadderController.attributes.add("ladder", { type: "entity" })
LoLadderController.attributes.add("body", { type: "entity" })

LoLadderController.prototype.initialize = function () {
    this.obje = null
    this.ladderButton = this.app.root.findByName("Ladder Button");
    this.camera = this.app.root.findByName("Camera");
    this.touchPanel = this.app.root.findByName("Left Half Touch Joystick");
    this.app.on("LO_RewardedLadder", this.setLadder, this);
    if (this.app.touch) {
        this.touchPanel.element.on("touchstart", this.onElementTouchStart, this);
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
    }
    this.on("destroy", () => {
        //this.touchPanel.element.off("touchstart", this.onElementTouchStart, this);
        //this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStart, this);

        this.app.off("LO_RewardedLadder", this.setLadder, this);
    })
};
LoLadderController.prototype.setLadder = function () {
    this.obje = this.ladder;
    this.obje.script.loLadder.materialHalfOpacity();
    this.obje.script.loLadder.setOutline(false)
};
LoLadderController.prototype.update = function (dt) {
    if (this.obje) {
        this.ladderButton.enabled = true;
        if (this.app.keyboard.wasPressed(pc.KEY_E) || this.app.mouse.wasPressed(0) || window.touchJoypad.buttons.wasPressed('LadderButton')) {
            this.obje.script.loLadder.materialDefauld();
            this.obje = null;
            return;
        }
        let myPosition = this.entity.getPosition().clone();
        let forward = this.camera.forward.clone().scale(-.1);
        let result = this.toForwardRaycast();
        if (result) {
            let pos = new pc.Vec3(result.point.x + forward.x, myPosition.y, result.point.z + forward.z);
            this.obje.setPosition(pos);
        }
        else {
            let to = this.body.forward.clone().scale(-2).add(myPosition);
            this.obje.setPosition(to);
        }
        this.obje.setRotation(this.body.getRotation().clone());
        this.obje.rotateLocal(-90, 0, 0)
        return;
    }
    else {
        if (!this.app.touch) {
            let camPoint = this.camera.getPosition().clone();
            let to = this.camera.getPosition().clone().add(this.camera.forward.clone().scale(25));
            let hit = this.app.systems.rigidbody.raycastFirstByTag(camPoint, to, "Ladder");
            if (hit && this.entity.getPosition().clone().distance(hit.entity.getPosition().clone()) < this.app.ladderDistace) {
                hit.entity.script.loLadder.setOutline(true)
                this.tempItem = hit.entity;
                if (this.app.keyboard.wasPressed(pc.KEY_E) || this.app.mouse.wasPressed(0)) {
                    if (hit) {
                        this.obje = hit.entity;
                        this.obje.script.loLadder.materialHalfOpacity();
                        hit.entity.script.loLadder.setOutline(false)
                    }
                }
            }
            else {
                if (this.tempItem) {
                    this.tempItem.script.loLadder.setOutline(false)
                    this.tempItem = null;
                }
            }
        }
        else {
            this.ladderButton.enabled = false;

            if (this.entity.getPosition().clone().distance(this.ladder.getPosition().clone()) < 5) {
                this.ladder.script.loLadder.setOutline(true)
                this.isMobileLadder = true;
            }
            else {
                if (this.tempItem) {
                    this.tempItem.script.loLadder.setOutline(false)
                    this.tempItem = null;
                }
            }
        }
    }
};

LoLadderController.prototype.onTouchStart = function (e) {
    // On perform the raycast logic if the user has one finger on the screen
    //this.doRayCast(event.touches[event.touches.length - 1]);

    //console.log(e.touches[e.touches.length - 1].x)

    this.doRaycast(e.touches[e.touches.length - 1].x, e.touches[e.touches.length - 1].y);

    e.event.preventDefault();
};
LoLadderController.prototype.onElementTouchStart = function (e) {
    // On perform the raycast logic if the user has one finger on the screen
    //this.doRayCast(event.touches[event.touches.length - 1]);

    this.doRaycast(e.touches[e.touches.length - 1].clientX, e.touches[e.touches.length - 1].clientY);

    //e.event.preventDefault();
};
LoLadderController.prototype.doRaycast = function (screenX, screenY) {
    // The pc.Vec3 to raycast from (the position of the camera)
    var from = this.camera.getPosition().clone();

    // The pc.Vec3 to raycast to (the click position projected onto the camera's far clip plane)
    var to = this.camera.camera.screenToWorld(screenX, screenY, this.camera.camera.farClip);

    // Raycast between the two points and return the closest hit result
    var result = this.app.systems.rigidbody.raycastFirstByTag(from, to, "Ladder");
    //var result = this.app.systems.rigidbody.raycastFirst(from, to);
    // If there was a hit, store the entity

    if (result && this.isMobileLadder) {
        this.obje = result.entity;
        this.obje.script.loLadder.materialHalfOpacity();
        result.entity.script.loLadder.setOutline(false)
    }
};

LoLadderController.prototype.toForwardRaycast = function () {
    let my = this.entity.getPosition().clone();
    let to = this.body.forward.clone().scale(-2).add(my);

    return this.app.systems.rigidbody.raycastFirstByTag(my, to, "Ground")
};
LoLadderController.prototype.raycast = function () {
    let hit = this.app.systems.rigidbody.raycastFirstByTag(camPoint, to, "Ladder");

};