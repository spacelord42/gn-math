var RainbowObby_DisappearingBlock = pc.createScript(
  "RainbowObby_DisappearingBlock"
);

RainbowObby_DisappearingBlock.prototype.initialize = function () {
  const originalPosition = this.entity.getLocalPosition().clone();
  this.entity.collision.on("collisionstart", (result) => {
    const op = { y: originalPosition.y };
    /*
    new TWEEN.Tween(op)
      .to({ y: originalPosition.y - 1000 }, 2500)
      .onUpdate(() => {
        if (op.y < originalPosition.y - 250) {
          this.entity.collision.enabled = false;
        }
        this.entity.setLocalPosition(0, op.y, 0);
      })
      .onComplete(() => {
        this.entity.enabled = false;
        setTimeout(() => {
          this.entity.setLocalPosition(originalPosition);
          this.entity.enabled = true;
          this.entity.collision.enabled = true;
        }, 1000);
      })
      .start();*/
    //let data = { value =0 }
    var tween1 = this.app.tween(op).to({ y: originalPosition.y - 1000 }, 2.5, pc.Linear)
      .onUpdate(() => {
        if (op.y < originalPosition.y - 250) {
          this.entity.collision.enabled = false;
        }
        this.entity.setLocalPosition(0, op.y, 0);
      })
      .onComplete(() => {
        this.entity.enabled = false;
        setTimeout(() => {
          this.entity.setLocalPosition(originalPosition);
          this.entity.enabled = true;
          this.entity.collision.enabled = true;
        }, 1000);
      })
      .start();



  });
};
