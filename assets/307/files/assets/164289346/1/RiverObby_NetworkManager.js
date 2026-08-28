var RiverObby_NetworkManager = pc.createScript('riverObbyNetworkManager');
RiverObby_NetworkManager.attributes.add('stageMats', { type: 'asset', assetType: 'material', array: true });
RiverObby_NetworkManager.attributes.add("mobileControls", { type: "entity" });
RiverObby_NetworkManager.attributes.add("onlineCounter", { type: "entity" });
RiverObby_NetworkManager.attributes.add("localPlayer", { type: "entity" });
RiverObby_NetworkManager.attributes.add('playerTemplate', { type: 'asset', assetType: 'template' });
RiverObby_NetworkManager.attributes.add('deadPanel', { type: 'entity' });
RiverObby_NetworkManager.attributes.add('blackBackground', { type: 'entity' });

RiverObby_NetworkManager.prototype.mobileAndTabletCheck = function () {
    return this.app.touch != null;
};

// initialize code called once per entity
RiverObby_NetworkManager.prototype.initialize = async function () {
    this.app.isMobile = this.mobileAndTabletCheck();
    this.app.targetFov = 60;

    this.app.isMarketEnabled = false;
    this.app.deadMenuEnabled = false;
    this.app.rewardedPanelEnabled = false;
    this.app.menuPanelEnabled = false;

    this.mouseLockCounter = 0;
    this.app.canLockPointer = true;
    this.app.cameraStateLocked = false;
    this.isFirstClick = true;
    // on mouse down
    const onMouseDown = () => {
        if (this.isFirstClick == true) {
            this.isFirstClick = false;
        }
        const camResult = this.app.menuPanelEnabled || this.app.deadMenuEnabled || this.app.isMarketEnabled;
        if (camResult == false) {
            if (pc.Mouse.isPointerLocked() == false) {
                this.app.mouse.enablePointerLock();
                this.app.cameraStateLocked = true;
                this.app.fire("lockCamera", false);
                return;
            }
        }
    };
    this.app.mouse.on("mousedown", onMouseDown);

    this.mobileControls.enabled = this.app.isMobile;
    this.jumpButton = this.mobileControls.findByName("JumpButton");
    this.playerController = this.localPlayer.script.riverObbyPlayerController;
    this.lowHPEffect = this.app.root.findByName("lowHPEffect");
    this.savePoints = this.app.root.findByName("CheckPoints");
    this.stageUIText = this.app.root.findByName("StageUIText");
    this.coinText = this.app.root.findByName("CoinText");
    this.onlineCounter = this.app.root.findByName("OnlineCounter");
    this.stagePercentageText = this.app.root.findByName("stagePercentageText").element;
    this.stagePercentagePin = this.app.root.findByName("stagePercentagePin");
    this.progressBar = this.app.root.findByName("ProgressBar");
    //menu
    this.menuPanel = this.app.root.findByName("Menu");
    this.menuCloseButton = this.menuPanel.findByName("CloseButton");
    this.menuCloseButton.button.on('click', function (event) {
        this.setMenu(false);
    }, this);

    this.deadPanelRespawn = this.deadPanel.findByName("RespawnButton");
    this.deadPanelRespawn.button.on('click', function (event) {
        if (this.canRespawn === true) {
            this.playerController.respawn();
            this.respawn();
            this.canRespawn = false;
        }
    }, this);

    this.loadLocalStorageData();

    this.onOrientationChange();
    window.addEventListener("resize", this.onOrientationChange.bind(this), false);
    window.addEventListener("orientationchange", this.onOrientationChange.bind(this), false);

    //sdk init
    //Initialize the SDK
    PokiSDK.init().then(() => {
        console.log("Poki SDK successfully initialized");
        PokiSDK.gameLoadingFinished();

    }).catch(() => {
        console.log("Initialized, something went wrong, load you game anyway");
        // fire your function to continue to game
    });

    if (window.location.href.indexOf('launch.playcanvas.com') > -1) {
        PokiSDK.setDebug(true);
    }

    if (await this.joinServer()) {
        this.listenPlayers();
    }

    this.on('destroy', function () {
        window.removeEventListener("orientationchange", this);
        window.removeEventListener("resize", this);
        this.app.mouse.off("mousedown", onMouseDown);
    }, this);
};

RiverObby_NetworkManager.prototype.onOrientationChange = function () {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w > h) {
        // Landscape
        this.progressBar.enabled = true;
    }
    else {
        // Portrait
        this.progressBar.enabled = false;
    }
}

RiverObby_NetworkManager.prototype.increaseStage = function (stageNumber) {
    this.app.currentStage = stageNumber;
    RiverObby_Utils.setItem("RIVEROBBY_currentStage", this.app.currentStage);
    this.stageUIText.element.text = this.app.currentStage + 1;
    this.stagePercentageText.text = (this.app.currentStage + 1) + "%";
    this.stagePercentagePin.setLocalPosition(this.app.currentStage * 2.685, -40, 0);
};

RiverObby_NetworkManager.prototype.loadLocalStorageData = function () {
    const currentStage = RiverObby_Utils.getItem("RIVEROBBY_currentStage");
    if (currentStage) {
        this.app.currentStage = Number.parseInt(currentStage)
    } else {
        this.app.currentStage = 0;
        RiverObby_Utils.setItem("RIVEROBBY_currentStage", 0);
    }
    const coin = RiverObby_Utils.getItem("RIVEROBBY_coin");
    if (coin) {
        this.app.coin = Number.parseInt(coin)
    } else {
        this.app.coin = 0;
        RiverObby_Utils.setItem("RIVEROBBY_coin", 0);
    }
    this.increaseStage(this.app.currentStage);
    this.coinText.element.text = this.app.coin;
};

RiverObby_NetworkManager.prototype.copiedRoomId = function () {
    if (this.room) {
        PokiSDK.shareableURL({ room: this.room.id }).then(url => {
            if (window.clipboardData && window.clipboardData.setData) {
                // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
                return window.clipboardData.setData("Text", url);
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
        });
        this.app.fire('WarningTextController:setWarning', "Copied the URL, now share with your friends!", 5, new pc.Color(0, 1, 0, 1));
    }
}

RiverObby_NetworkManager.prototype.setBlackBG = function (state = true) {
    if (state) {
        this.blackBackground.enabled = true;
        this.data = { value: 0 };
        this.blackBackground
            .tween(this.data).to({ value: 0.75 }, 0.2, pc.SineOut)
            .onUpdate((dt) => {
                this.blackBackground.element.opacity = this.data.value;
            })
            .start();
    } else {
        this.data = { value: 0.75 };
        this.blackBackground
            .tween(this.data).to({ value: 0 }, 0.1, pc.SineOut)
            .onUpdate((dt) => {
                this.blackBackground.element.opacity = this.data.value;
            })
            .onComplete(() => {
                this.blackBackground.enabled = false;
            })
            .start();
    }
};

RiverObby_NetworkManager.prototype.collectCoin = function (amount = 1) {
    this.app.coin += amount;
    if (amount === 1)
        this.localPlayer.fire("collectCoin");
    RiverObby_Utils.setItem("RIVEROBBY_coin", this.app.coin);
    this.coinText.element.text = this.app.coin;
};

// update code called every frame
RiverObby_NetworkManager.prototype.postUpdate = function (dt) {
    //respawn
    if (this.app.keyboard.wasPressed(pc.KEY_SPACE) && this.app.deadMenuEnabled) {
        this.deadPanelRespawn.button.fire('click');
    }

    if (pc.platform.touch)
        return;

    if (!pc.Mouse.isPointerLocked()) {
        camResult = this.app.menuPanelEnabled == false && this.app.isMarketEnabled == false && this.app.deadMenuEnabled == false;
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

RiverObby_NetworkManager.prototype.setMenu = function (state = true) {
    if (state) {
        this.menuPanel.enabled = true;
        this.setBlackBG(true);
        this.app.menuPanelEnabled = true;
        this.menuCloseButton.enabled = false;
        this.app.fire("lockCamera", true);
        setTimeout(() => {
            this.menuCloseButton.enabled = true;
        }, 2000);
    } else {
        this.menuPanel.enabled = false;
        this.setBlackBG(false);
        this.app.menuPanelEnabled = false;
        this.app.fire("lockCamera", false);
    }
};

RiverObby_NetworkManager.prototype.listenPlayers = function () {
    this.playerEntities = {};
    this.onlineCount = 0;

    //player connected
    this.room.state.players.onAdd((player, sessionId) => {
        this.onlineCount += 1;
        if (this.onlineCounter.element)
            this.onlineCounter.element.text = this.onlineCount;

        player.onChange(() => {
            const targetPlayer = this.playerEntities[sessionId];
            if (targetPlayer == null) return;
            //if its local player then ignore
            if (this.room.sessionId === sessionId) {
            } else { //not local player, interpolate
                let rot = new pc.Vec3(player.rotationX, player.rotationY, player.rotationZ);
                //interpolate this position in update
                targetPlayer.networkPosition = new pc.Vec3(player.x, player.y, player.z);
                //interpolate this rotation in update
                targetPlayer.networkRotation = new pc.Quat().setFromEulerAngles(rot.x, rot.y, rot.z);
                targetPlayer.script.playerControllerOther.handleAnimations(player);
            }
        });

        let newPlayer;
        //if its local player
        if (this.room.sessionId === sessionId) {
            this.localSessionId = sessionId;
            newPlayer = this.player;
        } else {
            newPlayer = this.playerTemplate.resource.instantiate();
            newPlayer.sessionId = sessionId;
            this.app.root.addChild(newPlayer);
        }
        //newPlayer.setPosition(player.x, player.y, player.z);
        this.playerEntities[sessionId] = newPlayer;

        player.listen("isDead", (isDead) => {
            if (sessionId === this.localSessionId) return;
            if (isDead) {
                this.playerEntities[sessionId].script.playerControllerOther.died();
            } else {
                this.playerEntities[sessionId].script.playerControllerOther.respawn();
            }
        });

        player.listen("username", (username) => {
            if (sessionId === this.localSessionId) {
                this.playerController.username.element.text = username;
            } else {
                this.playerEntities[sessionId].script.playerControllerOther.username.element.text = username;
            }
        });

        player.listen("activeItem", (newItem) => {
            //local değilse
            if (sessionId != this.localSessionId) {
                this.playerEntities[sessionId].script.inventoryController.setItemOtherPlayer(newItem);
            }
        });

        player.listen("leftActiveItem", (newItem) => {
            //local değilse
            if (sessionId != this.localSessionId) {
                this.playerEntities[sessionId].script.inventoryController.setItemLeftOtherPlayer(newItem);
            }
        });

        player.listen("faceId", (newId) => {
            //local değilse
            if (sessionId != this.localSessionId) {
                this.playerEntities[sessionId].script.playerControllerOther.setFace(newId);
            }
        });

        player.listen("hatId", (newId) => {
            //local değilse
            if (sessionId != this.localSessionId) {
                this.playerEntities[sessionId].script.playerControllerOther.setHat(newId);
            }
        });

        player.listen("skinId", (newId) => {
            //local değilse
            if (sessionId != this.localSessionId) {
                this.playerEntities[sessionId].script.playerControllerOther.setSkin(newId);
            }
        });
    }, false);

    //player disconnected
    this.room.state.players.onRemove((player, sessionId) => {
        this.onlineCount -= 1;
        this.onlineCounter.element.text = this.onlineCount;

        if (this.localSessionId != sessionId)
            this.playerEntities[sessionId].destroy();
        delete this.playerEntities[sessionId];
    }, false);

    this.room.onMessage("Server:PlayerController:respawn", (sessionId) => {
        this.playerEntities[sessionId].script.playerController.respawn();
    });

    this.room.onMessage("Server:InventoryController:hit", (data) => {
        //local değilse
        if (data.hitOwner != this.localSessionId) {
            this.playerEntities[data.hitOwner].script.inventoryController.hit();
        }
    });

    this.room.onMessage("Server:PlayerControllerOther:died", (data) => {
        //local değilse
        if (data.playerId != this.localSessionId) {
            this.playerEntities[data.playerId].script.playerControllerOther.died();
        }
    });

    this.room.onMessage("Server:PlayerControllerOther:respawn", (data) => {
        //local değilse
        if (data.playerId != this.localSessionId) {
            this.playerEntities[data.playerId].script.playerControllerOther.respawn();
        }
    });
};

RiverObby_NetworkManager.prototype.respawn = function () {
    this.app.deadMenuEnabled = false;
    this.deadPanel.enabled = false;
    this.setBlackBG(false);
};

RiverObby_NetworkManager.prototype.syncLocalData = async function () {

};

RiverObby_NetworkManager.prototype.joinServer = async function () {
    try {
        console.log("try connecting server");
        this.app.colyseus = new Colyseus.Client("ws://localhost:8080");
        this.room = await this.app.colyseus.joinOrCreate("room", { accessToken: "riverobby" });
        console.log("connected to the ", this.room.name);
        //send player data to sync
        this.syncLocalData();
    } catch (e) {
        console.log(e);
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

RiverObby_NetworkManager.prototype.lowHPEffectMethod = function () {
    this.lowHPEffect.enabled = true;
    this.lowHPEffectData = { value: 0 };

    this.lowHPEffectTween = this.lowHPEffect
        .tween(this.lowHPEffectData).to({ value: 1 }, 0.25, pc.Linear)
        .onUpdate((dt) => {
            this.lowHPEffect.element.opacity = this.lowHPEffectData.value;
        })
        .yoyo(true)
        .repeat(2)
        .start();
};

RiverObby_NetworkManager.prototype.diedEffect = function () {
    //kirmizi ekran tween
    this.canRespawn = false;
    this.app.deadMenuEnabled = true;

    this.lowHPEffectMethod();

    this.deadPanel.setLocalPosition(0, -600, 0);
    this.deadPanel.enabled = true;
    this.deadPanel
        .tween(this.deadPanel.getLocalPosition()).to(new pc.Vec3(0, 0, 0), 0.5, pc.SinOut)
        .delay(0.5)
        .start();

    this.blackBackground.enabled = true;
    this.data = { value: 0 };
    this.blackBackground
        .tween(this.data).to({ value: 0.8 }, 0.5, pc.SineOut)
        .onUpdate((dt) => {
            this.blackBackground.element.opacity = this.data.value;
        })
        .onComplete(() => {
            this.canRespawn = true;
        })
        .delay(0.25)
        .start();
};