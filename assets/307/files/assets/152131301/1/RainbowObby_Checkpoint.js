var RainbowObby_Checkpoint = pc.createScript("RainbowObby_Checkpoint");

RainbowObby_Checkpoint.byNumber = new Map();
RainbowObby_Checkpoint._i = 0;
RainbowObby_Checkpoint._timeout = null;

RainbowObby_Checkpoint.attributes.add("coin", {
  type: "asset",
  assetType: "template",
  title: "Coin Prefab",
});

RainbowObby_Checkpoint.prototype.initialize = function () {
  if (!this.entity.parent.didInitCheckpoints) {
    this.entity.parent.didInitCheckpoints = true;
    const children = this.entity.parent.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const script = child.script.RainbowObby_Checkpoint;
      script.number = RainbowObby_Checkpoint._i++;
      RainbowObby_Checkpoint.byNumber.set(script.number, script);
    }
  }

  if (this.coin) {
    if (!RainbowObby_Storage.getItem("RainbowObby_CC-" + this.number)) {
      const coin = this.coin.resource.instantiate();
      coin.setPosition(
        this.entity.getPosition().clone().add(new pc.Vec3(0, 2, 0))
      );

      coin.on("collected", () => {
        RainbowObby_Storage.setItem("RainbowObby_CC-" + this.number, "1");
      });

      this.app.root.addChild(coin);
    }

    this.entity.on("destroy", () => {
      RainbowObby_Checkpoint.byNumber.clear();
      RainbowObby_Checkpoint._i = 0;
    });
  }

  this.entity.collision.on("collisionstart", (result) => {
    if (!result.other.script) return;
    if (!result.other.script.RainbowObby_CharacterController) return;
    if (result.other.script.RainbowObby_CharacterController.isLocalPlayer) {
      if (this.number === 102) {
        RainbowObby_Storage.setItem("RainbowObby_world1", true);
      }

      const currentCheckpoint = parseInt(
        RainbowObby_Storage.getItem("RainbowObby_currentCheckpoint") || "0"
      );
      if (this.number > currentCheckpoint) {
        // Get SFX component
        const sfx = this.app.root.findByName("SFX");
        const sound = sfx.sound;
        sound.play("checkpoint");

        RainbowObby_Storage.setItem(
          "RainbowObby_currentCheckpoint",
          this.number
        );

        // Get timer
        const timer = this.app.root.findByName("Timer");
        const timerScript = timer.script.RainbowObby_SpeedrunTimer;
        // Set checkpointReachedText

        let checkpointReachedText = this.app.root.findByName(
          "CheckpointReachedText"
        );
        checkpointReachedText.setLocalScale(0, 0, 0);
        checkpointReachedText.enabled = true;
        checkpointReachedText.element.text =
          "Checkpoint " +
          (this.number + 1) +
          " reached in " +
          timerScript.textElement.element.text;

        // Tween checkpointReachedText in
        const op = { s: 0 };
        /*
        new TWEEN.Tween(op)
          .to({ s: 1 }, 250)
          .easing(TWEEN.Easing.Sinusoidal.InOut)
          .onUpdate(() => {
            checkpointReachedText.setLocalScale(op.s, op.s, op.s);
          })
          .onComplete(() => {
            if (RainbowObby_Checkpoint._timeout)
              clearTimeout(RainbowObby_Checkpoint._timeout);
            RainbowObby_Checkpoint._timeout = setTimeout(() => {
              const op = { s: 1 };
              new TWEEN.Tween(op)
                .to({ s: 0 }, 250)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(() => {
                  checkpointReachedText.setLocalScale(op.s, op.s, op.s);
                })
                .onComplete(() => {
                  checkpointReachedText.enabled = false;
                })
                .start();
            }, 2500);
          })
          .start();
          */
        console.log(checkpointReachedText)
        checkpointReachedText
          .tween(checkpointReachedText.getLocalScale())
          .to(new pc.Vec3(1, 1, 1), 0.25, pc.SineInOut)
          .onComplete(() => {
            if (RainbowObby_Checkpoint._timeout)
              clearTimeout(RainbowObby_Checkpoint._timeout);
            RainbowObby_Checkpoint._timeout = setTimeout(() => {
              checkpointReachedText
                .tween(checkpointReachedText.getLocalScale())
                .to(new pc.Vec3(0, 0, 0), 0.25, pc.SineInOut)
                .onComplete(() => {
                  checkpointReachedText.enabled = false;
                })
                .start();
            }, 2500);
          })
          .start();
      }
    }
  });
}
