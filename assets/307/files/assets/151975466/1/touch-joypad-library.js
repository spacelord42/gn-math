(function () {
    const prevButtonPropPrefix = '_prev';
    const clickedThresholdMs = 200;

    const prevButtonStates = {
    };

    const buttonStates = {
    };

    const touchJoypad = {
        buttons: {
            isPressed: function (name) {
                const state = buttonStates[name];
                return !!state;
            },

            wasPressed: function (name) {
                const state = buttonStates[name];
                const prev = prevButtonStates[name];
                if (buttonStates[name] !== undefined) {
                    return (!prev && state);
                }

                return false;
            },

            wasReleased: function (name) {
                const state = buttonStates[name];
                const prev = prevButtonStates[name];
                if (buttonStates[name] !== undefined) {
                    return (prev && !state);
                }

                return false;
            },

            wasTapped: function (name) {
                if (this.wasReleased(name)) {
                    const now = Date.now();
                    return (now - prevButtonStates[name] <= clickedThresholdMs);
                }

                return false;
            }
        },

        sticks: {

        }
    };

    touchJoypad.buttonStates = buttonStates;

    const app = pc.Application.getApplication();
    // Update after the script post update but before the browser events
    // https://developer.playcanvas.com/en/user-manual/scripting/application-lifecyle/
    app.on('update', () => {
        for (const key of Object.keys(buttonStates)) {
            const val = buttonStates[key];
            prevButtonStates[key] = val;
        }
    });

    window.touchJoypad = touchJoypad;
})();