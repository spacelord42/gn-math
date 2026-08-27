/*CoLookAtCamera script that makes the object look at target object by Emre Şahin - emolingo games */
var CoLookAtCamera = pc.createScript('coLookAtCamera');
CoLookAtCamera.attributes.add('angle', { type: 'vec3', default: [180, 0, 180] });
CoLookAtCamera.attributes.add('client', { type: 'boolean' });

CoLookAtCamera.prototype.initialize = function () {
    if (!this.client) {
        this.camera = this.entity.parent.parent.findByName("Camera");
    }
    else {
        /// this.entity.children.length
        //this.camera = this.app.root.findByName("Camera");
        this.networkManager = this.app.root.findByName("Network Manager").script.coNetworkManager;

        this.camera = this.networkManager.player.findByName("Camera");
    }
};

CoLookAtCamera.prototype.postUpdate = function (dt) {
    if (this.camera == null || this.camera == undefined) {
        if (!this.client) {
            this.camera = this.app.root.findByName("Camera");
            this.camera.once("destroy", () => {
                this.camera = null;
            }, this);
        }
        else {
            this.networkManager = this.app.root.findByName("Network Manager").script.coNetworkManager;
            this.camera = this.networkManager.player.findByName("Camera");
            this.camera.once("destroy", () => {
                this.camera = null;
            }, this);
        }
        return;
    }

    this.entity.lookAt(this.camera.getPosition());
    this.entity.rotateLocal(this.angle.x, this.angle.y, this.angle.z);
};