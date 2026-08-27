var UiInputField = pc.createScript('uiInputField');
UiInputField.attributes.add('textEntity', {
    type: 'entity',
    title: 'Text Entity',
    description: 'The Entity that has the text Element to update with the inputted text.'
});
UiInputField.attributes.add('inputType', {
    type: 'string',
    title: 'Input Type',
    description: 'What type of input will this field accept. On some devices, the virtual keyboard layout may change as well. For example, \'Number\' will bring up a numpad instead of the full keyboard.',
    default: 'text',
    enum: [
        { 'Text': 'text' },
        { 'Text (no spellcheck)': 'text no spellcheck' },
        { 'Email': 'email' },
        { 'Number': 'number' },
        { 'Decimal': 'decimal' },
        { 'Password': 'password' },
        { 'Readonly': 'textNoEdit' },
    ],
});
UiInputField.attributes.add('enterKeyHint', {
    type: 'string',
    title: 'Enter Key Hint',
    description: 'Change what the enter key shows on the virutal keyboard. Different OSs will have different representations of the hint.',
    default: 'enter',
    enum: [
        { 'Enter': 'enter' },
        { 'Done': 'done' },
        { 'Go': 'go' },
        { 'Search': 'search' },
        { 'Send': 'send' }
    ],
});
UiInputField.attributes.add('maxLength', {
    type: 'number', default: 32,
    title: 'Max Length',
    description: 'Maximum length of the text can be.'
});
UiInputField.attributes.add('placeHolder', {
    type: 'string', default: 'Placeholder text...',
    title: 'Place Holder String',
    description: 'When the inputted text is empty, what should show as placeholder? Usually this is a prompt such as \'Enter your email here\'.'
});
UiInputField.attributes.add('placeHolderColor', {
    type: 'rgb',
    title: 'Place Holder Text Color',
    description: 'What color the text should be when the placeholder string is used.'
});


// initialize code called once per entity
UiInputField.prototype.initialize = function () {
    this._textElement = this.textEntity.element;
    this._textColor = this._textElement.color.clone();
    this.value = '';
    this.setEvents('on');
    this.on('destroy', () => {
        this.setEvents('off');
    });

    this._onValueChange('');
};


UiInputField.prototype.setEvents = function (offOn) {
    this.entity[offOn]('uiinput:updatevalue', this._onValueChange, this);
    this.entity.element[offOn]('click', this._onClick, this);
};


UiInputField.prototype._onValueChange = function (value) {
    this.value = value;
    if (value.length > 0) {
        if (this.inputType === 'password') {
            let hiddenText = '';
            for (let i = 0; i < value.length; ++i) {
                hiddenText += '*';
            }

            this._textElement.text = hiddenText;
        } else {
            this._textElement.text = value;
        }

        this._textElement.color = this._textColor;
    } else {
        this._textElement.text = this.placeHolder;
        this._textElement.color = this.placeHolderColor;
    }

    this.entity.fire('updatedvalue', value);
};

UiInputField.prototype._onClick = function (event) {
    this.app.fire('uiinput:clicked', this, event);
};


// swap method called for script hot-reloading
// inherit your script state here
// UiInputField.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/