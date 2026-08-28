/*ClassicNetworkManager script that handles network connections and packets by Emre Şahin - emolingo games */
var ClassicNetworkManager = pc.createScript('classicNetworkManager');
ClassicNetworkManager.prototype.initialize = function () {
    this.app.currentCheckPoint = 0;
    this.app.coin = 0;
    this.app.allStage = []
    this.setStageNumber();

    //network
    this.playerEntities = {};


    this.ccu = 0;
    this.onlineCounter = this.app.root.findByName("OnlineCounter").element;
    this.connectingServerText = this.app.root.findByName("ConnectingServerText");

    this.menuPanel = this.app.root.findByName("Menu");
    this.menuButton = this.menuPanel.findByName("MainMenuButton");
    this.menuButton.button.on('click', async function (event) {
        if (this.room)
            await this.room.leave();
        this.app.scenes.changeScene("Menu");
    }, this);
    this.menuCloseButton = this.menuPanel.findByName("CloseButton");
    this.menuCloseButton.button.on('click', function (event) {
        this.setMenu(false);
    }, this);
    this.joinRoomPanel = this.app.root.findByName("JoinRoomPanel");
    this.joinRoomButton = this.menuPanel.findByName("JoinRoom");
    this.joinRoomButton.button.on('click', function (event) {
        this.joinRoomPanel.enabled = true;
    }, this);
    this.joinRoomCloseButton = this.joinRoomPanel.findByName("CloseButton");
    this.joinRoomCloseButton.button.on('click', function (event) {
        this.joinRoomPanel.enabled = false;
    }, this);
    //join room
    this.joinRoomInputbox = this.joinRoomPanel.findByName("RoomIdInputBox");
    this.joinRoomFromCodeButton = this.joinRoomPanel.findByName("JoinRoomFromCodeButton");
    this.joinRoomFromCodeButton.button.on('click', async function (event) {
        const roomId = this.joinRoomInputbox.script.uiInputField.value;
        console.log('join roomId:', roomId);
        Utils.setItem("Classic_joinCustomRoom", roomId);
        if (this.room)
            await this.room.leave();
        this.app.scenes.changeScene("ClassicObby");
    }, this);
    //create room
    this.createRoomButton = this.menuPanel.findByName("CreateRoomButton");
    this.createRoomButton.button.on('click', async function (event) {
        Utils.setItem("Classic_createCustomRoom", "1");
        if (this.room)
            await this.room.leave();
        this.app.scenes.changeScene("ClassicObby");
    }, this);
    //reset progress
    this.resetProgressPanel = this.app.root.findByName("ResetProgressPanel");
    this.clearDataButton = this.menuPanel.findByName("ClearData");
    this.clearDataButton.button.on('click', function (event) {
        this.resetProgressPanel.enabled = true;
    }, this);
    //invite room detail
    this.inviteLinkPanel = this.app.root.findByName("InviteLink");
    this.inviteLinkText = this.inviteLinkPanel.findByName("Desc");
    this.inviteLinkCopyButton = this.inviteLinkPanel.findByName("CopyButton");
    this.inviteLinkCopyButton.button.on('click', function (event) {
        if (this.room == null) return;
        if (window.clipboardData && window.clipboardData.setData) {
            // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
            return window.clipboardData.setData("Text", this.room.roomId);
        }
        else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = this.room.roomId;
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
    this.inviteLinkCloseButton = this.inviteLinkPanel.findByName("CloseButton");
    this.inviteLinkCloseButton.button.on('click', function (event) {
        this.inviteLinkPanel.enabled = false;
    }, this);
    //reset progress
    this.resetProgressButton = this.resetProgressPanel.findByName("Yes");
    this.resetProgressButton.button.on('click', async function (event) {
        window.localStorage.removeItem("RainbowObby_coins");
        window.localStorage.removeItem("ClassicObbyMarket");
        window.localStorage.removeItem("RainbowObby_skinId");
        window.localStorage.removeItem("Classic_elapsedTime");
        window.localStorage.removeItem("Classic_elapsedTimerOff");
        window.localStorage.removeItem("RainbowObby_currentCheckpoint");
        this.app.currentCheckPoint = 0;
        this.app.elapsedTime = 0;
        let timer = this.app.root.findByName("Timer");
        if (timer)
            timer.enabled = false;
        this.app.coin = 0;
        if (this.room)
            await this.room.leave();
        this.app.scenes.changeScene("ClassicObby");
    }, this);
    this.resetProgressCloseButton = this.resetProgressPanel.findByName("CloseButton");
    this.resetProgressCloseButton.button.on('click', function (event) {
        this.resetProgressPanel.enabled = false;
    }, this);

    this.app.pixelRatio = Math.min(devicePixelRatio, 1.5);
    pc.Application.getApplication().graphicsDevice.maxPixelRatio = this.app.pixelRatio;
    this.app.marketPanel = false;
    this.app.deadMenuEnabled = false;
    this.app.rewardedPanelEnabled = false;
    this.app.menuPanelEnabled = false;
    this.mouseLockCounter = 0;
    this.app.canLockPointer = true;
    this.app.cameraStateLocked = false;
    this.isFirstClick = true;
    this.app.isWatchingAd = false;

    // on mouse down
    const onMouseDown = () => {
        if (this.isFirstClick == true) {
            setTimeout(() => {
                if (this.inviteLinkPanel.enabled == false)
                    this.isFirstClick = false;
            }, 1000);
        }

        const camResult = this.app.rewardedPanelEnabled || this.app.isWatchingAd || this.inviteLinkPanel.enabled || this.joinRoomPanel.enabled || this.app.menuPanelEnabled || this.app.marketPanel || this.app.deadMenuEnabled;
        if (camResult == false) {
            if (pc.Mouse.isPointerLocked() == false) {
                if (this.app.marketPanel) return;
                this.app.mouse.enablePointerLock();
                this.app.cameraStateLocked = true;
                this.app.fire("lockCamera", false);
                return;
            }
        }
    };
    this.app.mouse.on("mousedown", onMouseDown);

    if (Utils.getItem("RainbowObby_coins")) {
        this.app.coin = Number.parseInt(Utils.getItem("RainbowObby_coins"));
        this.app.fire("UpdateProgresTexts");
    }
    else {
        this.app.coin = 0;
        Utils.setItem("RainbowObby_coins", 0)
    }
    if (Utils.getItem("RainbowObby_currentCheckpoint")) {
        this.app.currentCheckPoint = Number.parseInt(Utils.getItem("RainbowObby_currentCheckpoint"));
    }
    else {
        this.app.currentCheckPoint = 0;
        Utils.setItem("RainbowObby_currentCheckpoint", 0)
    }
    this.app.fire("UpdateProgresTexts");
    this.app.on("OpenMenu", this.openMenu, this);
    this.networkInit();

    this.on('destroy', function () {
        this.app.mouse.off("mousedown", onMouseDown);
        this.app.off("OpenMenu", this.openMenu, this);
    }, this);
};

ClassicNetworkManager.prototype.openMenu = function () {
    this.setMenu(true);
};

ClassicNetworkManager.prototype.joinServer = async function () {
    try {
        this.app.colyseus = new Colyseus.Client("wss://rainbowobby1.emolingo.games");
        //this.app.colyseus = new Colyseus.Client("ws://localhost:2567");
        const customRoomId = Utils.getItem("Classic_joinCustomRoom");
        console.log("try connecting server", customRoomId);
        if (Utils.getItem("Classic_createCustomRoom") === "1") {
            Utils.setItem("Classic_createCustomRoom", "");
            this.room = await this.app.colyseus.create("classicObby", { private: true });
            this.inviteLinkText.element.text = "Room ID is " + this.room.roomId;
            this.setMenu(true);
            this.inviteLinkPanel.enabled = true;
        } else if (customRoomId != "" && customRoomId != null) {
            this.room = await this.app.colyseus.joinById(customRoomId);
            Utils.setItem("Classic_joinCustomRoom", "");
        } else {
            this.room = await this.app.colyseus.joinOrCreate("classicObby");
        }
        console.log("connected to the ", this.room.name);
    } catch (e) {
        console.log(e);
        Utils.setItem("Classic_joinCustomRoom", "");
        Utils.setItem("Classic_createCustomRoom", "");
    }

    if (this.room) {
        this.room.onLeave((code) => {
            console.log("client left the room with code ", code);
        });
        this.room.onError((code, message) => {
            console.log("error code:", code, "oops, error ocurred:", message);
        });
    } else {
        return false;
    }
    return true;
};

ClassicNetworkManager.prototype.networkInit = async function () {
    let joinResult = await this.joinServer();
    if (joinResult) {
        this.connectingServerText.enabled = false;
        this.room.state.players.onAdd((player, sessionId) => {
            this.ccu += 1;
            this.onlineCounter.text = this.ccu + "/12";

            if (sessionId == this.room.sessionId) {
                this.app.fire("SetUsername", player.name);
                this.entity.script.classicUimanager.connectServer();
                this.room.send("isAlive", true);
                return;
            }
            const playerEntityToClone = this.app.root.findByName("RemoteCharacter");

            const entity = playerEntityToClone.clone();

            entity.setPosition(player.position.x, player.position.y, player.position.z);

            entity.enabled = true;


            playerEntityToClone.parent.addChild(entity);

            this.playerEntities[sessionId] = entity;


            if (player.name)
                entity.script.classicRemotePlayer.setPlayer(player.name);//name

            //entity.script.classicRemotePlayer.setSkin(player.skin);//name



            player.listen("skin", (skinName) => {
                entity.script.classicRemotePlayer.setSkin(skinName);
            });
            player.listen("hasJetpack", (enabled) => {
                entity.script.classicRemotePlayer.setJetPack(enabled);
            });
            player.listen("hasJumpCoil", (enabled) => {
                entity.script.classicRemotePlayer.setCoil(enabled);
            });
            player.listen("hasTotemOfUndying", (enabled) => {
                entity.script.classicRemotePlayer.setTotem(enabled);
            });
            player.listen("hasSpeedBoots", (enabled) => {
                entity.script.classicRemotePlayer.setShoe(enabled);
            });
            player.listen("flyingCarpetActive", (enabled) => {
                entity.script.classicRemotePlayer.setCarpet(enabled);
            });
            player.listen("hasFlyingCarpet", (enabled) => {
                entity.script.classicRemotePlayer.hasCarpet(enabled);
            });



            player.listen("isAlive", (alive, oldAlive) => {
                if (oldAlive == null)
                    return;

                if (alive)
                    entity.script.classicRemotePlayer.respawn();
                else
                    entity.script.classicRemotePlayer.dead();

            });

            player.onChange(() => {
                this.changePlayerSchema(entity, player);
            })
        }, false);

        //player disconnected
        this.room.state.players.onRemove((player, sessionId) => {
            this.ccu -= 1;
            this.onlineCounter.text = this.ccu + "/12";

            if (this.localSessionId != sessionId)
                this.playerEntities[sessionId].destroy();
            delete this.playerEntities[sessionId];
        }, false);
    } else {
        setTimeout(() => {
            this.networkInit();
        }, 5000);
    }
};

ClassicNetworkManager.prototype.changePlayerSchema = function (entity, playerSchema) {
    entity.script.classicRemotePlayer.setPlayer(playerSchema.name);
    entity.networkPosition = new pc.Vec3(playerSchema.position.x, playerSchema.position.y, playerSchema.position.z);
    entity.networkRotation = new pc.Quat().setFromEulerAngles(0, playerSchema.rotation, 0);
    entity.script.classicRemotePlayer.setAnim(playerSchema.isInAir, playerSchema.isWalking, playerSchema.isClimbing);

};

ClassicNetworkManager.prototype.setStageNumber = function () {
    this.stage1 = this.app.root.findByName("CheckPoints1");
    this.stage2 = this.app.root.findByName("CheckPoints2");
    this.stage3 = this.app.root.findByName("CheckPoints3");

    for (let i = 0; i < this.stage1.children.length; i++) {
        this.stage1.children[i].script.classicCheckPoint.index = i;
        this.app.allStage.push(this.stage1.children[i]);
    }
    for (let i = 0; i < this.stage2.children.length; i++) {
        this.stage2.children[i].script.classicCheckPoint.index = i + this.stage1.children.length;
        this.app.allStage.push(this.stage2.children[i]);
    }
    for (let i = 0; i < this.stage3.children.length; i++) {
        this.stage3.children[i].script.classicCheckPoint.index = i + (this.stage1.children.length) + (this.stage2.children.length);
        this.app.allStage.push(this.stage3.children[i]);
    }
};
ClassicNetworkManager.prototype.collectCoin = function () {
    this.app.coin++;
    Utils.setItem("RainbowObby_coins", this.app.coin)
};

ClassicNetworkManager.prototype.postUpdate = function (dt) {
    if (this.inviteLinkPanel.enabled == true && pc.Mouse.isPointerLocked()) {
        this.app.mouse.disablePointerLock();
        this.app.fire("lockCamera", true);
        return;
    }

    if (pc.platform.touch || this.isFirstClick)
        return;

    if (!pc.Mouse.isPointerLocked()) {
        camResult = this.inviteLinkPanel.enabled == false && this.app.rewardedPanelEnabled == false && this.app.isWatchingAd == false && this.joinRoomPanel.enabled == false && this.app.menuPanelEnabled == false && this.app.marketPanel == false && this.app.deadMenuEnabled == false;
        if (camResult) {
            this.mouseLockCounter += 1;
        } else {
            this.mouseLockCounter = 0;
        }
    } else {
        this.mouseLockCounter = 0;
    }
    if (this.mouseLockCounter > 20) {
        if (this.isFirstClick == false) {
            this.setMenu(true);
            this.mouseLockCounter = 0;
        }
    }
};

ClassicNetworkManager.prototype.setMenu = function (state = true) {
    if (state) {
        this.menuPanel.enabled = true;
        this.app.menuPanelEnabled = true;
        this.menuCloseButton.enabled = false;
        this.app.fire("lockCamera", true);

        this.app.fire("SdkGamePlay", false);

        setTimeout(() => {
            this.menuCloseButton.enabled = true;
        }, 1000);
    } else {
        this.menuPanel.enabled = false;
        this.app.menuPanelEnabled = false;
        this.app.fire("lockCamera", false);
        //this.app.fire("SdkGamePlay", true);

    }
};