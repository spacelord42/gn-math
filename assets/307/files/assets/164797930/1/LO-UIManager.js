var LoUimanager = pc.createScript('loUimanager');

LoUimanager.attributes.add("market", { type: "entity" });
LoUimanager.attributes.add("marketButtons", { type: "entity", array: true });

LoUimanager.attributes.add("menu", { type: "entity" });

LoUimanager.attributes.add("joinRoomPanel", { type: "entity" });
LoUimanager.attributes.add("createRoomPanel", { type: "entity" });

LoUimanager.attributes.add("ladder", { type: "entity" });

LoUimanager.prototype.initialize = function () {
    this.tempURL = "https://poki.com/en/g/rainbow-obby";
    this.createRoomButton = this.menu.findByName("CreateRoomButton");
    this.createRoomText = this.createRoomPanel.findByName("IdText");
    this.menuClose = this.menu.findByName("CloseButton");
    this.roomLinkCopyButton = this.createRoomPanel.findByName("JoinRoomFromCodeButton");
    this.blackBG = this.menu.parent.findByName("BlackBG");
    this.menuClose.button.on("click", this.closeMenu, this)
    this.app.on("lo-closeButton", this.allPanelClose, this);
    this.roomLinkCopyButton.button.on("click", this.copyUrl, this);
    this.app.on("onGetRoomIDAndRoomLink", this.setURL, this)
    this.createRoomButton.button.on("click", this.createRoom, this);
    this.mainMenuButton = this.menu.findByName("MainMenuButton")
    //joinRoom
    this.openJoinRoomButton = this.menu.findByName("JoinRoomButton");
    this.joinRoomText = this.joinRoomPanel.findByName("RoomIDText");
    this.joinRoomButton = this.joinRoomPanel.findByName("JoinRoomFromCodeButton");
    this.joinRoomExitButton = this.joinRoomPanel.findByName("CloseButton");

    this.timerText = this.menu.parent.findByName("TimerText");
    if (Utils.getItem("LO_elapsedTime")) {
        this.app.elapsedTime = Number.parseFloat(Utils.getItem("LO_elapsedTime"));
    }
    else {
        Utils.setItem("LO_elapsedTime", 0)
        this.app.elapsedTime = 0;
    }
    if (Utils.getItem("LO_elapsedTimeOff")) {
        this.app.elapsedTimeOff = true;
    }

    this.marketPanel = this.menu.parent.findByName("Market");

    this.joinRoomExitButton.button.on("click", () => {
        this.closeMenu();
    }, this)
    this.openJoinRoomButton.button.on("click", () => {
        this.changeCursorVisibility(true);
        this.joinRoomPanel.enabled = true;
        this.blackBG.enabled = true;
        this.menu.enabled = false;
        this.app.isPause = true;

    }, this);

    this.openJoinRoomButton.button.on("click", () => {
        this.changeCursorVisibility(true);
        this.joinRoomPanel.enabled = true;
        this.blackBG.enabled = true;
        this.menu.enabled = false;
        this.app.isPause = true;

    }, this);
    this.clearDataButton = this.menu.findByName("ClearData");
    this.clearDataButton.button.on("click", () => {
        this.app.coin = 0;
        Utils.setItem("loCoin", this.app.coin)

        Utils.setItem("LO_elapsedTime", 0);
        if (Utils.getItem("LO_elapsedTimeOff"))
            Utils.setItem("LO_elapsedTimeOff", false);
        this.app.elapsedTime = 0;
        this.app.elapsedTimeOff = false;

        this.entity.script.loNetworkManager.player.rigidbody.teleport(new pc.Vec3(-27.804, 0, -1.684));
        this.ladder.rigidbody.teleport(new pc.Vec3(-26.554, 0.189, -1.039), new pc.Vec3(270, 90, 0));

    }, this);

    this.joinRoomButton.button.on("click", this.joinRoom, this);

    this.app.on("openRandomPanel", this.openRandomPanel, this);

    this.mainMenuButton.element.on("click", this.goMainMenuButton, this);

    this.app.on("lo-EndGame", this.endGame, this);

    this.on('destroy', function () {
        this.app.off("lo-closeButton", this.allPanelClose, this);
        //this.roomLinkCopyButton.button.off("click", this.copyUrl, this);
        this.app.off("onGetRoomIDAndRoomLink", this.setURL, this)
        this.app.off("lo-EndGame", this.endGame, this);
        //this.createRoomButton.button.off("click", this.createRoom, this);
        //this.joinRoomButton.button.off("click", this.joinRoom, this);
        //this.openJoinRoomButton.button.off("click", this.openJoinRoomPanel, this);
        //this.mainMenuButton.element.off("click", this.goMainMenuButton, this);

    }, this);
};
LoUimanager.prototype.endGame = async function () {
    this.app.elapsedTimeOff = true;
    Utils.setItem("LO_elapsedTimeOff", true);
};
LoUimanager.prototype.goMainMenuButton = async function () {
    if (this.entity.script.loNetworkManager.room) {
        await this.entity.script.loNetworkManager.room.leave();
    }
    this.app.scenes.changeScene("Menu");
};
LoUimanager.prototype.elapsedTimer = function (dt) {
    if (this.app.elapsedTimeOff) return;
    this.app.elapsedTime += dt * 1;
    var miliseconds = Math.floor((this.app.elapsedTime % 1) * 1000);
    var seconds = Math.floor(this.app.elapsedTime % 60);
    var minutes = Math.floor((this.app.elapsedTime / 60) % 60);

    var timeString = "";
    timeString += minutes + ":";
    timeString += seconds + ".";
    timeString += miliseconds;

    if (timeString !== "")
        this.timerText.element.text = timeString;

    Utils.setItem("LO_elapsedTime", parseInt(this.app.elapsedTime));
}
LoUimanager.prototype.postUpdate = function (dt) {
    this.elapsedTimer(dt);
    if (window.touchJoypad.buttons.wasPressed('jumpButton')) {
        this.openMenu();
    }
    if (this.app.keyboard.wasPressed(pc.KEY_M) || window.touchJoypad.buttons.wasPressed('marketButton')) {
        this.changeCursorVisibility(true);
        this.marketPanel.enabled = true;
        this.blackBG.enabled = true;
        this.menu.enabled = false;
        this.app.isPause = true;
    }
    //lock
    if (pc.platform.touch)
        return;

    if (this.blackBG.enabled) {
        this.changeCursorVisibility(true);
    }

    if (!pc.Mouse.isPointerLocked()) {
        if (this.menu.enabled == false && this.blackBG.enabled === false) {
            this.frameCalculator += 1;
        } else {
            this.frameCalculator = 0;
        }
    } else {
        this.frameCalculator = 0;
    }

    if (this.frameCalculator > 20) {
        this.openMenu();
        this.frameCalculator = 0;
    }
}
LoUimanager.prototype.openMenu = function (dt) {
    this.allPanelClose();
    this.app.isPause = true;
    this.menuClose.enabled = false;
    this.changeCursorVisibility(true);
    this.menu.enabled = true;
    this.frameCalculator = 0;
    this.blackBG.enabled = true;
    setTimeout(() => {
        this.menuClose.enabled = true;
    }, 1010)
};
LoUimanager.prototype.openRandomPanel = function () {
    this.allPanelClose();
    this.app.isPause = true;
    this.changeCursorVisibility(true);
    this.frameCalculator = 0;
    this.blackBG.enabled = true;
};
LoUimanager.prototype.closeMenu = function () {
    this.blackBG.enabled = false;
    this.changeCursorVisibility(false);
    this.menu.enabled = false;
    this.app.isPause = false;
};

LoUimanager.prototype.createRoom = function (dt) {
    this.app.fire("CreateRoom");
};
LoUimanager.prototype.joinRoom = function () {
    this.app.fire("JoinRoom", this.joinRoomText.element.text);
};
LoUimanager.prototype.setURL = function (roomLink, roomid) {
    this.createRoomText.element.text = roomid;
    this.createRoomPanel.enabled = true;
    this.tempURL = roomLink;

    this.changeCursorVisibility(true);
    this.blackBG.enabled = true;
    this.menu.enabled = false;
    this.app.isPause = true;
};
LoUimanager.prototype.copyUrl = function () {
    let url = this.tempURL;
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
};
LoUimanager.prototype.allPanelClose = function (menu = false) {
    this.frameCalculator = 0;
    this.blackBG.enabled = false;
    this.createRoomPanel.enabled = false;
    this.joinRoomPanel.enabled = false;
    this.menu.enabled = false;
    this.marketPanel.children[0].enabled = false;
    if (menu)
        this.closeMenu()
};
LoUimanager.prototype.changeCursorVisibility = function (state) {
    //pc.Mouse.isPointerLocked();
    if (pc.platform.touch)
        return;

    if (state == true) {
        this.app.mouse.disablePointerLock();
    } else {
        this.app.mouse.enablePointerLock();
    }
};