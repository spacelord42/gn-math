/*WindArea script that creates wind area that pushes the player by Emre Şahin - emolingo games */
var WindArea = pc.createScript('windArea');
WindArea.attributes.add('direction', { type: 'vec3' });
// initialize code called once per entity
WindArea.prototype.initialize = function () {
    this.entity.collision.on('triggerenter', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.target = otherEntity;
        }
    }, this);

    this.entity.collision.on('triggerleave', function (otherEntity) {
        if (otherEntity.tags.has("Player")) {
            this.target = null;
        }
    }, this);
};

WindArea.prototype.update = function () {
    if (this.target) {
        this.target.rigidbody.applyForce(this.direction);
    }
};