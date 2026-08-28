var TouchJoystick = pc.createScript('touchJoystick');
TouchJoystick.attributes.add('identifier', { 
    type: 'string', 
    default: 'joystick0',
    title: 'Idenitifier',
    description: 'A unique name for the joystick to refer to it by in the API. Joysticks are also buttons so this will also be the name of button in the API. It will give a warning in browser tools if the name is not unique.'
});

TouchJoystick.attributes.add('type', { 
    type: 'string',
    default: 'fixed', 
    enum:[
        {'Fixed in place': 'fixed'},
        {'Move to first touch and fixed': 'relative'},
        {'Move to first touch and drags': 'drag'}
    ],
    title: 'Type',
    description: 'Set type of behavior for the joystick.'
});

TouchJoystick.attributes.add('baseEntity', { 
    type: 'entity',
    title: 'Base Entity',
    description: 'Image Element Entity that shows the base of the joystick.'
});

TouchJoystick.attributes.add('nubEntity', { 
    type: 'entity',
    title: 'Nub Entity',
    description: 'Image Element Entity that shows the nub (top) of the joystick.'
});

TouchJoystick.attributes.add('axisDeadZone', { 
    type: 'number', 
    default: 10,
    title: 'Axis Dead Zone',
    description: 'The number of UI units from the position of the Base Entity where input is not registered.' 
});

TouchJoystick.attributes.add('axisRange', { 
    type: 'number', 
    default: 50,
    title: 'Axis Range',
    description: 'The number of UI units from the position of the Base Entity that the Nub Entity can move to and is the maximum range'
});

TouchJoystick.attributes.add('hideOnRelease', { 
    type: 'boolean', 
    default: false,
    title: 'Hide on Release',
    description: 'Will only show the joystick when the user is using it and will hide it on touch end. This is commonly used if you don\'t want the joystick to block what\'s being shown on screen.'
});

TouchJoystick.attributes.add('positionOnRelease', { 
    type: 'string', 
    default: 'stay',
    enum:[
        {'Stay': 'stay'},
        {'Original': 'original'},
        {'Last start': 'lastStart'}
    ],
    title: 'Position on Release',
    description: 'Where to move the joystick on release and can help keep the screen tidy so that there are clear areas to show the game and arrange controls.'
});

TouchJoystick.attributes.add('vibrationPress', { 
    type: 'number', 
    default: 0,
    title: 'Vibration duration (ms)',
    description: 'If the device supports vibration with \'Navigator.vibrate\', it will vibrate for the duration set here on touch down.Set to 0 to disable.'});

// initialize code called once per entity
TouchJoystick.prototype.initialize = function() {
    if (window.touchJoypad && window.touchJoypad.sticks[this.identifier] !== undefined) {
        console.warn('Touch joystick identifier already used, please use another for Entity: ' + this.entity.name);
        return;
    }

    this._originalLocalPosition = this.baseEntity.getLocalPosition().clone();
    this._lastPointerDownPosition  = new pc.Vec3();

    this._setAxisValues(0, 0);
    this._inputDown = false;
    this._pointerId = -1;

    this._canVibrate = !!navigator.vibrate;

    this._setButtonState(false);

    this.on('state', (state) => {
        this._setEvents(state ? 'on' : 'off');
    });

    this.on('destroy', () => {
        if (window.touchJoypad) {
            window.touchJoypad.sticks[this.identifier] = undefined;
        }
    });

    this._setEvents('on');
};

TouchJoystick.prototype._setEvents = function (offOn) {
    this._setAxisValues(0, 0);
    this._pointerDown = false;
    this._pointerId = -1;

    this.baseEntity.enabled = !this.hideOnRelease;

    this.entity.element[offOn]('mousedown', this._onMouseDown, this);
    this.entity.element[offOn]('mousemove', this._onMouseMove, this);
    this.entity.element[offOn]('mouseup', this._onMouseUp, this);

    if (this.app.touch) {
        this.entity.element[offOn]('touchstart', this._onTouchDown, this);
        this.entity.element[offOn]('touchmove', this._onTouchMove, this);
        this.entity.element[offOn]('touchend', this._onTouchUp, this);
        this.entity.element[offOn]('touchcancel', this._onTouchUp, this);
    }
};

TouchJoystick.__uiPos = new pc.Vec2();
TouchJoystick.prototype.screenToUi = function (screenPosition) {
    /** @type {pc.Vec2} */
    const uiPos = TouchJoystick.__uiPos;

    // Convert to a normalised value of -1 to 1 on both axis
    const canvasWidth = this.app.graphicsDevice.canvas.clientWidth;
    const canvasHeight = this.app.graphicsDevice.canvas.clientHeight;  

    uiPos.x = screenPosition.x / canvasWidth;
    uiPos.y = screenPosition.y / canvasHeight;

    uiPos.mulScalar(2).subScalar(1);
    uiPos.y *= -1;

    return uiPos;
};

TouchJoystick.prototype._onMouseDown = function (e) {
    // Give mouse events an id
    e.id = 0;
    this._onPointerDown(e);
    if (this._pointerDown) {
        e.stopPropagation();
    }
};

TouchJoystick.prototype._onMouseMove = function (e) {
    e.id = 0;
    this._onPointerMove(e);
    if (this._pointerDown) {
        e.stopPropagation();
    }
};

TouchJoystick.prototype._onMouseUp = function (e) {
    e.id = 0;
    if (this._pointerDown) {
        e.stopPropagation();
    }

    this._onPointerUp(e);
};

TouchJoystick.prototype._onTouchDown = function (e) {
    if (this._pointerDown) {
        return;
    }

    const wasPointerDown = this._pointerDown;
    e.id = e.touch.identifier;
    this._onPointerDown(e);

    if (!wasPointerDown && this._pointerDown) {
        e.stopPropagation();
    }
};

TouchJoystick.prototype._onTouchMove = function (e) {
    e.id = e.touch.identifier;
    this._onPointerMove(e);

    if (this._pointerDown) {
        e.stopPropagation();
    }

    e.event.preventDefault();
};

TouchJoystick.prototype._onTouchUp = function (e) {
    if (this._pointerDown) {
        e.id = e.touch.identifier;
        this._onPointerUp(e);
        e.stopPropagation();
    }

    e.event.preventDefault();
};

TouchJoystick.prototype._onPointerDown = function (pointer) {
    const uiPos = this.screenToUi(pointer);
    switch (this.type) {
        case 'drag':
        case 'relative': {
            this.baseEntity.setPosition(uiPos.x, uiPos.y, 0);
            this.nubEntity.setLocalPosition(0, 0, 0);
            this._pointerDown = true;
        } break;
        case 'fixed': {
            this.nubEntity.setPosition(uiPos.x, uiPos.y, 0);
            this._updateAxisValuesFromNub();
            this._pointerDown = true;
        } break;
    }

    if (this._pointerDown) {
        if (this._canVibrate && this.vibrationPress !== 0) {
            navigator.vibrate(this.vibrationPress);
        }
        
        // If it's a mouse event, we don't have an id so lets make one up
        this._pointerId = pointer.id ? pointer.id : 0;
        this._setButtonState(true);
        this._lastPointerDownPosition.copy(this.baseEntity.getLocalPosition());
        this.baseEntity.enabled = true;

        // Set the values for the joystick immediately
        this._onPointerMove(pointer);
    }
};

TouchJoystick.__tempNubPos = new pc.Vec3();
TouchJoystick.__tempBasePos = new pc.Vec3();

TouchJoystick.prototype._onPointerMove = function (pointer) {
    if (this._pointerDown && this._pointerId == pointer.id) {
        const uiPos = this.screenToUi(pointer);
        const axisRangeSq = this.axisRange * this.axisRange;
        this.nubEntity.setPosition(uiPos.x, uiPos.y, 0);

        /** @type {pc.Vec3} */
        const nubPos = TouchJoystick.__tempNubPos;
        nubPos.copy(this.nubEntity.getLocalPosition());

        const nubLengthSq = nubPos.lengthSq();

        if (nubLengthSq >= axisRangeSq) {
            if (this.type === 'drag') {
                // Work out how much we need to move the base entity by so that
                // it looks like it is being dragged along with the nub
                const distanceDiff = nubPos.length() - this.axisRange;
                const basePos = TouchJoystick.__tempBasePos;
                basePos.copy(nubPos);
                basePos.normalize().mulScalar(distanceDiff);
                basePos.add(this.baseEntity.getLocalPosition());
                this.baseEntity.setLocalPosition(basePos);
            }

            nubPos.normalize().mulScalar(this.axisRange);
            this.nubEntity.setLocalPosition(nubPos);
        } 
        
        this._updateAxisValuesFromNub();
    }
};

TouchJoystick.prototype._onPointerUp = function (pointer) {
    if (this._pointerDown && this._pointerId == pointer.id) {
        this.nubEntity.setLocalPosition(0, 0, 0);
        if (this.hideOnRelease) {
            this.baseEntity.enabled = false;
        }

        switch(this.positionOnRelease) {
            case 'original': {
                this.baseEntity.setLocalPosition(this._originalLocalPosition);
            } break;
            case 'lastStart': {
                this.baseEntity.setLocalPosition(this._lastPointerDownPosition);
            } break;
        }

        this._pointerId = -1;
        this._updateAxisValuesFromNub();
        this._setButtonState(false);
        this._pointerDown = false;
    }
};

TouchJoystick.prototype._updateAxisValuesFromNub = function() {
    const axisRange = this.axisRange - this.axisDeadZone;

    const nubPos = this.nubEntity.getLocalPosition();
    const signX = Math.sign(nubPos.x);
    const signY = Math.sign(nubPos.y);

    const axisX = pc.math.clamp(Math.abs(nubPos.x) - this.axisDeadZone, 0, axisRange) * signX;
    const axisY = pc.math.clamp(Math.abs(nubPos.y) - this.axisDeadZone, 0, axisRange) * signY;

    this._setAxisValues(axisX/axisRange, axisY/axisRange);
};

TouchJoystick.prototype._setAxisValues = function (x, y) {
    if (window.touchJoypad) {
        window.touchJoypad.sticks[this.identifier] = { x: x, y: y };
    }

    this.axisX = x;
    this.axisY = y;
};

TouchJoystick.prototype._setButtonState = function (state) {
    if (window.touchJoypad) {
        window.touchJoypad.buttonStates[this.identifier] = state ? Date.now() : null;
    }

    this._state = state;
};

// swap method called for script hot-reloading
// inherit your script state here
// TouchJoystick.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// https://developer.playcanvas.com/en/user-manual/scripting/