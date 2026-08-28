var LoCloseButton = pc.createScript('loCloseButton');

// initialize code called once per entity
LoCloseButton.prototype.initialize = function () {
    this.entity.button.on("click", this.closeButton, this);

    this.on('destroy', function () {
        this.entity.button.off("click", this.closeButton, this);
    }, this);
};

// update code called every frame
LoCloseButton.prototype.closeButton = function () {
    this.app.fire("lo-closeButton");
};

