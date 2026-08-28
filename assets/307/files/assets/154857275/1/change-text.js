/*ChangeText script that changes text according to parameters by Emre Şahin - emolingo games */
var ChangeText = pc.createScript('changeText');
ChangeText.attributes.add('newString', { type: 'string' });
ChangeText.attributes.add('onlyChangeOnMobile', { type: 'boolean' });

ChangeText.prototype.initialize = function () {
    if (this.onlyChangeOnMobile) {
        if (pc.platform.touch) {
            this.entity.element.text = this.newString;
        }
        return;
    }

    this.entity.element.text = this.newString;
};