/*CoUiManager script that handles UI panels by Burak Ersin - emolingo games */
var CoUiManager = pc.createScript('coUiManager');
CoUiManager.attributes.add("gameScreen", { type: "entity" });
CoUiManager.attributes.add("shopScreen", { type: "entity" });
CoUiManager.attributes.add("takeNitroSkillScreen", { type: "entity" });
CoUiManager.attributes.add("takeTotemSkillScreen", { type: "entity" });
CoUiManager.attributes.add("carBuyPanelsParent", { type: "entity" });
CoUiManager.attributes.add("deathScreen", { type: "entity" });
CoUiManager.attributes.add("mobileControllers", { type: "entity" });
CoUiManager.attributes.add("backgroundScreen", { type: "entity" });
CoUiManager.attributes.add("menuScreen", { type: "entity" });
CoUiManager.attributes.add("clearDataScreen", { type: "entity" });
CoUiManager.attributes.add("loadingScreen", { type: "entity" });
CoUiManager.attributes.add("joinRoomScreen", { type: "entity" });
CoUiManager.attributes.add("createRoomFailedScreen", { type: "entity" });
CoUiManager.attributes.add("shareRoomScreen", { type: "entity" });
CoUiManager.attributes.add("joinRoomFailedScreen", { type: "entity" });
CoUiManager.attributes.add('nitroParent', { type: 'entity' });
CoUiManager.attributes.add('totemParent', { type: 'entity' });
CoUiManager.attributes.add('nitroTimeText', { type: 'entity' });
CoUiManager.attributes.add('bikeGameScreen', { type: 'entity' });
CoUiManager.attributes.add('progressBarEntity', { type: 'entity' });
CoUiManager.attributes.add('clearLevelScreen', { type: 'entity' });

CoUiManager.prototype.initialize = function () {
    this.isFirstLogin = true;
    this.frameCalculator = 0;
    this.mobileControllers.enabled = pc.platform.touch;

    this.app.coBackGroundEnabled = false;

    this.app.mouse.on("mousedown", this.onMouseDown, this);
    this.app.on("coUiManager:closeAllScreens", this.closeAllScreens, this);
    this.app.on("coUiManager:openGameScreen", this.openGameScreen, this);
    this.app.on("coUiManager:openCarBuyScreen", this.openCarBuyScreen, this);
    this.app.on("coUiManager:openTakeTotemSkillScreen", this.openTakeTotemSkillScreen, this);
    this.app.on("coUiManager:openTakeNitroSkillScreen", this.openTakeNitroSkillScreen, this);
    this.app.on("coUiManager:openShopScreen", this.openShopScreen, this);
    this.app.on("coUiManager:openMenuScreen", this.openMenuScreen, this);
    this.app.on("coUiManager:openLoadingScreen", this.openLoadingScreen, this);
    this.app.on("coUiManager:openJoinRoomScreen", this.openJoinRoomScreen, this);
    this.app.on("coUiManager:openClearDataScreen", this.openClearDataScreen, this);
    this.app.on("coUiManager:openClearLevelScreen", this.openClearLevelScreen, this);
    this.app.on("coUiManager:openBikeGameScreen", this.openBikeGameScreen, this);
    this.app.on("onGetRoomCreateErrorMessage", this.openCreateRoomFailedScreen, this);
    this.app.on("onGetRoomIDAndRoomLink", this.openShareRoomScreen, this);
    this.app.on("onUnSuccesfulJoinToRoom", this.openJoinRoomFailedScreen, this);
    this.app.on("playerDied", this.openDeathScreen, this);
    this.app.on("playerRespawned", this.openGameScreen, this);

    this.app.on("skill:getTotem", this.getTotem, this);

    this.app.on("skill:getNitro", this.getNitro, this);

    this.app.on("skill:nitroEnd", this.nitroEnd, this);

    this.app.on("skill:TotemEnd", this.totemEnd, this);

    this.app.on("changedNitroTime", this.changeNitroTime, this);
    this.on("destroy", () => {
        this.eventDestroy();
    }, this);

    this.onOrientationChange();
    window.addEventListener("resize", this.onOrientationChange.bind(this), false);
    window.addEventListener("orientationchange", this.onOrientationChange.bind(this), false);
};

CoUiManager.prototype.getNitro = function () {
    this.nitroParent.enabled = true;
};
CoUiManager.prototype.getTotem = function () {
    this.totemParent.enabled = true;
};
CoUiManager.prototype.nitroEnd = function () {
    this.nitroParent.enabled = false;
};
CoUiManager.prototype.totemEnd = function () {
    this.totemParent.enabled = false;
};
CoUiManager.prototype.changeNitroTime = function (time) {
    this.nitroTimeText.element.text = time;
};
CoUiManager.prototype.eventDestroy = function () {
    this.app.mouse.off("mousedown", this.onMouseDown, this);
    this.app.off("coUiManager:closeAllScreens", this.closeAllScreens, this);
    this.app.off("coUiManager:openGameScreen", this.openGameScreen, this);
    this.app.off("coUiManager:openCarBuyScreen", this.openCarBuyScreen, this);
    this.app.off("coUiManager:openTakeTotemSkillScreen", this.openTakeTotemSkillScreen, this);
    this.app.off("coUiManager:openTakeNitroSkillScreen", this.openTakeNitroSkillScreen, this);
    this.app.off("coUiManager:openShopScreen", this.openShopScreen, this);
    this.app.off("coUiManager:openMenuScreen", this.openMenuScreen, this);
    this.app.off("coUiManager:openBikeGameScreen", this.openBikeGameScreen, this);
    this.app.off("coUiManager:openClearDataScreen", this.openClearDataScreen, this);
    this.app.off("coUiManager:openLoadingScreen", this.openLoadingScreen, this);
    this.app.off("coUiManager:openJoinRoomScreen", this.openJoinRoomScreen, this);
    this.app.off("onGetRoomCreateErrorMessage", this.openCreateRoomFailedScreen, this);
    this.app.off("onGetRoomIDAndRoomLink", this.openShareRoomScreen, this);
    this.app.off("onUnSuccesfulJoinToRoom", this.openJoinRoomFailedScreen, this);
    this.app.off("playerDied", this.openDeathScreen, this);
    this.app.off("playerRespawned", this.openGameScreen, this);
    this.app.off("coUiManager:openClearLevelScreen", this.openClearLevelScreen, this);
    this.app.off("skill:getTotem", this.getTotem, this);

    this.app.off("skill:getNitro", this.getNitro, this);

    this.app.off("skill:nitroEnd", this.nitroEnd, this);

    this.app.off("skill:TotemEnd", this.totemEnd, this);

    this.app.off("changedNitroTime", this.changeNitroTime, this);
};
CoUiManager.prototype.postUpdate = function (dt) {
    if (pc.platform.touch)
        return;

    if (this.menuScreen.enabled || this.backgroundScreen.enabled) {
        this.changeCursorVisibility(true);
    }

    if (!pc.Mouse.isPointerLocked()) {
        if (this.backgroundScreen.enabled == false && this.menuScreen.enabled == false && this.gameScreen.enabled == true && this.isFirstLogin == false) {
            this.frameCalculator += 1;
        } else {
            this.frameCalculator = 0;
        }
    } else {
        this.frameCalculator = 0;
    }

    if (this.frameCalculator > 20) {
        this.openMenuScreen();
        this.frameCalculator = 0;
    }
};

CoUiManager.prototype.onMouseDown = function () {
    if (this.backgroundScreen.enabled == false) {
        this.changeCursorVisibility(false);
        this.isFirstLogin = false;
    }
};

CoUiManager.prototype.closeAllScreens = function () {
    this.frameCalculator = 0;
    this.gameScreen.enabled = false;
    this.shopScreen.enabled = false;
    this.takeNitroSkillScreen.enabled = false;
    this.takeTotemSkillScreen.enabled = false;
    this.carBuyPanelsParent.enabled = false;
    this.backgroundScreen.enabled = false;
    this.menuScreen.enabled = false;
    this.clearDataScreen.enabled = false;
    this.deathScreen.enabled = false;
    this.loadingScreen.enabled = false;
    this.joinRoomScreen.enabled = false;
    this.createRoomFailedScreen.enabled = false;
    this.shareRoomScreen.enabled = false;
    this.joinRoomFailedScreen.enabled = false;
    this.bikeGameScreen.enabled = false;
    this.clearLevelScreen.enabled = false;
};

CoUiManager.prototype.openGameScreen = function () {
    this.changeCursorVisibility(false);
    this.closeAllScreens();
    this.backgroundScreen.enabled = false;
    this.gameScreen.enabled = true;
};

CoUiManager.prototype.openCarBuyScreen = function (carID) {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    for (i = 0; i < this.carBuyPanelsParent.children.length; i++) {
        this.carBuyPanelsParent.children[i].enabled = parseInt(i) == (parseInt(carID) - 1);
    }
    this.backgroundScreen.enabled = true;
    this.carBuyPanelsParent.enabled = true;
};

CoUiManager.prototype.openTakeTotemSkillScreen = function () {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    this.backgroundScreen.enabled = true;
    this.takeTotemSkillScreen.enabled = true;
};

CoUiManager.prototype.openTakeNitroSkillScreen = function () {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    this.backgroundScreen.enabled = true;
    this.takeNitroSkillScreen.enabled = true;
};

CoUiManager.prototype.openShopScreen = function () {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    //this.app.root.findByName("Background Screen").script.backGroundScreen.closePanel;
    this.backgroundScreen.enabled = true;
    this.shopScreen.enabled = true;
};

CoUiManager.prototype.openMenuScreen = function () {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    this.backgroundScreen.enabled = true;
    this.menuScreen.enabled = true;
};

CoUiManager.prototype.openClearDataScreen = function () {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    this.backgroundScreen.enabled = true;
    this.clearDataScreen.enabled = true;
};

CoUiManager.prototype.openBikeGameScreen = function () {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    this.backgroundScreen.enabled = true;
    this.bikeGameScreen.enabled = true;
};

CoUiManager.prototype.openLoadingScreen = function () {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    this.backgroundScreen.enabled = true;
    this.loadingScreen.enabled = true;
};

CoUiManager.prototype.openJoinRoomScreen = function () {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    this.backgroundScreen.enabled = true;
    this.joinRoomScreen.enabled = true;
};

CoUiManager.prototype.openCreateRoomFailedScreen = function (errorMessage) {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    this.backgroundScreen.enabled = true;
    this.createRoomFailedScreen.enabled = true;
    this.createRoomFailedScreen.script.coCreateRoomFailedScreen.onFailed(errorMessage);
};

CoUiManager.prototype.openShareRoomScreen = function (roomLink, roomID) {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    this.backgroundScreen.enabled = true;
    this.shareRoomScreen.enabled = true;
    this.shareRoomScreen.script.coShareRoomScreen.onReceivedData(roomLink, roomID);
};

CoUiManager.prototype.openJoinRoomFailedScreen = function (errorMessage) {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    this.backgroundScreen.enabled = true;
    this.joinRoomFailedScreen.enabled = true;
    this.joinRoomFailedScreen.script.coJoinRoomFailedScreen.onFailed(errorMessage);
};

CoUiManager.prototype.openDeathScreen = function () {
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    this.backgroundScreen.enabled = true;
    this.deathScreen.enabled = true;
};

CoUiManager.prototype.openClearLevelScreen = function () {
    console.log("open ui manager ui!");
    this.changeCursorVisibility(true);
    this.closeAllScreens();
    this.backgroundScreen.enabled = true;
    this.clearLevelScreen.enabled = true;
};

CoUiManager.prototype.changeCursorVisibility = function (state) {
    //pc.Mouse.isPointerLocked();
    if (pc.platform.touch)
        return;

    if (state == true) {
        this.app.mouse.disablePointerLock();
    } else {
        this.app.mouse.enablePointerLock();
    }
};

CoUiManager.prototype.onOrientationChange = function () {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.progressBarEntity.enabled = w > h;
    /*if (w > h) {
        // Landscape

    }
    else {
        // Portrait

    }*/
};