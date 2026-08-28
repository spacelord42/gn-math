(function () {
    // iOS positioning is not fun when the keyboard is involved
    // https://blog.opendigerati.com/the-eccentric-ways-of-ios-safari-with-the-keyboard-b5aa3f34228d

    // Needed as we will have edge cases for particlar versions of iOS
    // returns null if not iOS
    function getIosVersion() {
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
            var version = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
            return version;
        }

        return null;
    }

    const iosVersion = getIosVersion();

    // Add the CSS needed to get the safe area values
    // https://benfrain.com/how-to-get-the-value-of-phone-notches-environment-variables-env-in-javascript-from-css/
    document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
    document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)');
    document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)');


    const app = pc.Application.getApplication();
    let inputDom = null;

    function createInputDom() {
        if (inputDom) {
            inputDom.remove();
        }

        inputDom = document.createElement('input');
        inputDom.setAttribute('type', 'text');
        inputDom.style.position = 'absolute';
        inputDom.style.fontFamily = 'Arial, sans-serif';
        inputDom.style.background = 'white';
        inputDom.style.paddingLeft = '10px';
        inputDom.style.paddingRight = '10px';
        inputDom.style.margin = '0px';
        inputDom.style.visibility = 'hidden';
        inputDom.style.zIndex = 1000;

        resetStyle();

        inputDom.value = '';
        document.body.appendChild(inputDom);
    }

    createInputDom();

    let domInPlace = false;
    let currentInputFieldScript = false;
    let iosResizeTimeoutHandle = null;
    const iosResizeTimeoutDuration = 2100;


    function onInputFieldClick(inputFieldScript, inputEvent) {
        inputEvent.stopPropagation();
        showDom(inputFieldScript, inputEvent);
    }

    function showDom(inputFieldScript, inputEvent) {
        // If it's the same input field then do nothing
        if (currentInputFieldScript === inputFieldScript) {
            return;
        }

        // If we have clicked on a different input field then switch to that
        if (currentInputFieldScript && currentInputFieldScript !== inputFieldScript) {
            onBlur();
        }

        currentInputFieldScript = inputFieldScript;

        if (inputDom.style.visibility !== 'visible') {
            // Check if it's a touch event
            if (inputEvent.changedTouches) {
                inputEvent.event.preventDefault();
                domInPlace = false;
            } else {
                domInPlace = true;
            }

            inputDom.style.visibility = 'visible';
            inputDom.onblur = onBlur;
            inputDom.addEventListener('keydown', onKeyDown);
            inputDom.addEventListener('keyup', onKeyUp);
        }

        inputDom.value = inputFieldScript.value;
        inputDom.maxLength = inputFieldScript.maxLength;
        inputDom.placeholder = inputFieldScript.placeHolder;

        inputDom.pattern = null;
        inputDom.spellcheck = false;
        switch (inputFieldScript.inputType) {
            case 'text': {
                inputDom.type = 'text';
                inputDom.spellcheck = true;
            } break;
            case 'text no spellcheck': {
                inputDom.type = 'text';
            } break;
            case 'number': {
                inputDom.type = 'number';
                inputDom.pattern = "[0-9]*";
            } break;
            case 'decimal': {
                inputDom.type = 'number';
            } break;
            case 'email': {
                inputDom.type = 'email';
            } break;
            case 'password': {
                inputDom.type = 'password';
            } break;
            case 'textNoEdit': {
                inputDom.type = 'text';
                inputDom.spellcheck = false;
                inputDom.readOnly = true;
            } break;
            default: {
                inputDom.type = 'text';
                inputDom.spellcheck = true;
            } break;
        }

        inputDom.enterKeyHint = inputFieldScript.enterKeyHint;

        inputDom.focus();
        updateStyle();

        currentInputFieldScript.entity.element.on('resize', updateStyle);
    }

    function onElementSwitch() {
        currentInputFieldScript.entity.fire('uiinput:updatevalue', inputDom.value);
        currentInputFieldScript.entity.element.off('resize', updateStyle);

        // Workaround: If the input field was changed to be a password, 
        // changing it to anything else doesn't update the keyboard layout
        // correctly
        if (currentInputFieldScript.inputType === 'password') {
            createInputDom();
        }

        currentInputFieldScript = null;
    }

    function onBlur() {
        inputDom.onblur = null;
        inputDom.removeEventListener('keydown', onKeyDown);
        inputDom.removeEventListener('keyup', onKeyUp);
        inputDom.style.visibility = 'hidden';

        onElementSwitch();
    }

    function onKeyDown(event) {
        event.stopPropagation();
    }

    function onKeyUp(event) {
        event.preventDefault();
        event.stopPropagation();

        // Enter key
        if (event.keyCode === 13) {
            inputDom.blur();
        }
    }

    function resetStyle() {
        const leftSafeArea = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sal"));
        const rightSafeArea = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sar"));

        inputDom.style.left = '20px';
        inputDom.style.height = '40px';
        inputDom.style.width = (window.innerWidth - 64 - leftSafeArea - rightSafeArea) + 'px';
        inputDom.style.fontSize = '100%';
        inputDom.style.top = '20px';
        inputDom.style.marginTop = 'env(safe-area-inset-top)';
        inputDom.style.marginLeft = 'env(safe-area-inset-left)';
        inputDom.style.bottom = null;
    }

    function updateStyle() {
        if (currentInputFieldScript) {
            if (domInPlace && currentInputFieldScript.entity.element.screenCorners) {
                const corners = currentInputFieldScript.entity.element.screenCorners;
                const devicePixelRatio = Math.min(app.graphicsDevice.maxPixelRatio, window.devicePixelRatio);

                inputDom.style.left = ((corners[0].x / devicePixelRatio) - 2) + 'px';
                inputDom.style.bottom = ((corners[0].y / devicePixelRatio) - 2) + 'px';
                inputDom.style.top = null;

                const width = ((corners[2].x - corners[0].x) / devicePixelRatio) - 20;
                const height = (corners[2].y - corners[0].y) / devicePixelRatio;

                inputDom.style.width = width + 'px';
                inputDom.style.height = height + 'px';

                inputDom.style.fontSize = Math.round(height * 0.5) + 'px';
            } else {
                resetStyle();
            }
        }
    }

    function onResize() {
        if (iosVersion && !iosResizeTimeoutHandle) {
            app.off('uiinput:clicked', onInputFieldClick);
            iosResizeTimeoutHandle = setTimeout(onIosResizeTimeout, iosResizeTimeoutDuration);
        }

        // Resize the input on the next frame
        setTimeout(() => {
            updateStyle();
        });
    }

    function onIosResizeTimeout() {
        app.on('uiinput:clicked', onInputFieldClick);
        iosResizeTimeoutHandle = null;
    }

    // !!! On iOS, there is some code in the boilerplate to ensure
    // that the canvas fills the screen when rotating from landscape
    // to portrait. Unfortunately, this means we can't bring up the keyboard
    // until two seconds after a resize event :(
    if (iosVersion) {
        iosResizeTimeoutHandle = setTimeout(onIosResizeTimeout, iosResizeTimeoutDuration);
    } else {
        app.on('uiinput:clicked', onInputFieldClick);
    }
    app.graphicsDevice.on('resizecanvas', onResize);
})();