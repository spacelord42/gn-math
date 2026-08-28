/*CoShareRoomScreen script that handles share room screen panel controls by Burak Ersin - emolingo games */
var CoShareRoomScreen = pc.createScript('coShareRoomScreen');
CoShareRoomScreen.attributes.add('quitButton', { type: 'entity' });
CoShareRoomScreen.attributes.add('linkText', { type: 'entity' });
CoShareRoomScreen.attributes.add('copyLinkButton', { type: 'entity' });
CoShareRoomScreen.attributes.add('copyLinkButtonText', { type: 'entity' });
CoShareRoomScreen.attributes.add('idText', { type: 'entity' });
CoShareRoomScreen.attributes.add('copyIDButton', { type: 'entity' });
CoShareRoomScreen.attributes.add('copyIDButtonText', { type: 'entity' });

CoShareRoomScreen.prototype.initialize = function () {
    this.quitButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openGameScreen");
    }, this);

    this.copyLinkButton.button.on('click', function (event) {
        this.copyLinkButtonText.element.text = "COPIED";
        setTimeout(() => {
            this.copyLinkButtonText.element.text = "COPY";
        }, 2000);

        let url = this.linkText.element.text;
        if (window.clipboardData && window.clipboardData.setData) {
            // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
            window.clipboardData.setData("Text", url);
        }
        else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = url;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand("copy");  // Security exception may be thrown by some browsers.
            }
            catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
            }
            finally {
                document.body.removeChild(textarea);
            }
        }
        this.app.fire('WarningTextController:setWarning', "Copied the room Id, now share with your friends!", 5, new pc.Color(0, 1, 0, 1));
        //navigator.clipboard.writeText(this.linkText.element.text);
    }, this);

    this.copyIDButton.button.on('click', function (event) {
        this.copyIDButtonText.element.text = "COPIED";
        setTimeout(() => {
            this.copyIDButtonText.element.text = "COPY";
        }, 2000);
        //navigator.clipboard.writeText(this.idText.element.text);
        let url = this.idText.element.text;
        if (window.clipboardData && window.clipboardData.setData) {
            // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
            window.clipboardData.setData("Text", url);
        }
        else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = url;
            textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand("copy");  // Security exception may be thrown by some browsers.
            }
            catch (ex) {
                console.warn("Copy to clipboard failed.", ex);
            }
            finally {
                document.body.removeChild(textarea);
            }
        }
    }, this);
};

CoShareRoomScreen.prototype.onReceivedData = function (roomLink, roomID) {
    this.idText.element.text = roomID;
    this.linkText.element.text = roomLink;
};