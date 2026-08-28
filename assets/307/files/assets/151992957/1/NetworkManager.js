/*BikeObby_NetworkManager script that handles network connections and packets by Emre Şahin - emolingo games */
var BikeObby_NetworkManager = pc.createScript('networkManager');
BikeObby_NetworkManager.attributes.add('stageMats', { type: 'asset', assetType: 'material', array: true });
BikeObby_NetworkManager.attributes.add('bikes', { type: 'asset', assetType: 'template', array: true });
BikeObby_NetworkManager.attributes.add('playerTemplate', { type: 'asset', assetType: 'template' });
BikeObby_NetworkManager.attributes.add('mobileControls', { type: 'entity' });
BikeObby_NetworkManager.attributes.add('marketPanel', { type: 'entity' });
BikeObby_NetworkManager.attributes.add('shopButton', { type: 'entity' });
BikeObby_NetworkManager.attributes.add('menuPanel', { type: 'entity' });
BikeObby_NetworkManager.attributes.add('menuButton', { type: 'entity' });
BikeObby_NetworkManager.attributes.add('deadPanel', { type: 'entity' });
BikeObby_NetworkManager.attributes.add('blackBackground', { type: 'entity' });
BikeObby_NetworkManager.attributes.add('jetpackUI', { type: 'entity' });
BikeObby_NetworkManager.attributes.add('jumpCoilUI', { type: 'entity' });
BikeObby_NetworkManager.attributes.add('joinRoomUI', { type: 'entity' });
BikeObby_NetworkManager.attributes.add('music', { type: 'entity' });
BikeObby_NetworkManager.attributes.add('world1', { type: 'entity' });
BikeObby_NetworkManager.attributes.add('world2', { type: 'entity' });

// initialize code called once per entity
BikeObby_NetworkManager.prototype.initialize = async function () {
    this.app.pixelRatio = Math.min(devicePixelRatio, 1.5);
    pc.Application.getApplication().graphicsDevice.maxPixelRatio = this.app.pixelRatio;
    this.isFirstClick = true;

    // on mouse down
    const onMouseDown = () => {
        if (this.isFirstClick == true) {
            this.isFirstClick = false;
            return;
        }
        const camResult = this.app.isWatchingAd || this.app.isMarketEnabled || this.app.isMenuEnabled ||
            this.app.deadMenuEnabled || this.app.isPopupEnabled || this.app.isRewardedPopupEnabled;

        if (camResult == false) {
            if (this.app.cameraStateLocked === false) {
                this.app.mouse.enablePointerLock();
                this.app.cameraStateLocked = true;
                this.app.fire("lockCamera", false);
                return;
            }
        }
    };
    this.app.mouse.on("mousedown", onMouseDown);

    this.musicPlayer = this.app.root.findByName("Music");
    this.mobileControls.enabled = this.app.isMobile;
    this.player = this.app.root.findByName("Player");
    this.playerController = this.player.script.playerController;
    this.lowHPEffect = this.app.root.findByName("lowHPEffect");
    this.progressBar = this.app.root.findByName("ProgressBar");

    this.camera = this.app.root.findByName('Camera');
    this.raycastEndPoint = this.player.findByName('RaycastEndPoint');
    this.stageUIText = this.app.root.findByName("StageUIText");
    this.coinText = this.app.root.findByName("CoinText");
    this.onlineCounter = this.app.root.findByName("OnlineCounter");
    this.stagePercentageText = this.app.root.findByName("stagePercentageText").element;
    this.stagePercentagePin = this.app.root.findByName("stagePercentagePin");
    this.jetpackAmountText = this.jetpackUI.children[0].element;
    this.jumpCoilAmountText = this.jumpCoilUI.children[0].element;
    this.loadLocalStorageData();
    this.onlineCount = 0;
    this.mouseLockCounter = 0;
    this.app.canLockPointer = true;
    this.app.cameraStateLocked = false;
    this.app.isMarketEnabled = false;
    this.app.isMenuEnabled = false;
    this.app.isWatchingAd = false;
    this.app.deadMenuEnabled = false;
    this.app.isPopupEnabled = false;
    this.app.isRewardedPopupEnabled = false;

    this.app.mouseScroll = 0;
    let mouseScroll = BikeObby_Utils.getItem("BIKEOBBY_mouseScroll");
    if (mouseScroll != null && mouseScroll != "" && !isNaN(mouseScroll)) {
        this.app.mouseScroll = Number.parseFloat(mouseScroll);
    }

    this.onOrientationChange();
    window.addEventListener("resize", this.onOrientationChange.bind(this), false);
    window.addEventListener("orientationchange", this.onOrientationChange.bind(this), false);

    this.mainMenuButton = this.menuPanel.findByName("MainMenuButton");
    this.mainMenuButton.button.on('click', async function (event) {
        this.musicPlayer.sound.stop("music");
        if (this.room)
            await this.room.leave();
        this.app.scenes.changeScene("Menu");
    }, this);

    this.createRoomButton = this.menuPanel.findByName("CreateRoomButton");
    this.createRoomButton.button.on('click', async function (event) {
        if (this.room) {
            await this.room.leave();
        }
        this.musicPlayer.sound.stop("music");
        BikeObby_Utils.setItem("BIKEOBBY_createCustomRoom", "1");
        this.app.scenes.changeScene("BikeObby");
    }, this);

    this.joinRoomButton = this.joinRoomUI.findByName("JoinRoomFromCodeButton");
    this.joinRoomCloseButton = this.joinRoomUI.findByName("CloseButton");
    this.joinRoomCloseButton.button.on('click', async function (event) {
        if (this.joinRoomUI.enabled) {
            this.joinRoomUI.enabled = false;
            this.playerController.playerModel.sound.play("close");
        }
    }, this);
    this.joinRoomInputbox = this.joinRoomUI.findByName("RoomIdInputBox");
    this.joinRoomButton.button.on('click', async function (event) {
        const value = this.joinRoomInputbox.script.uiInputField.value;
        if (value.length > 0) {
            var roomId;
            if (value.includes("https")) {
                roomParamIndex = value.indexOf('room=');
                if (roomParamIndex !== -1) {
                    var roomId = value.substring(roomParamIndex + 5); // 'room=' kelimesinin uzunluğu kadar ileri git
                } else {
                    return;
                }
            } else {
                roomId = value;
            }
            console.log('join roomId:', roomId);
            BikeObby_Utils.setItem("BIKEOBBY_joinCustomRoom", roomId);
            if (this.room)
                await this.room.leave();
            this.musicPlayer.sound.stop("music");
            this.app.scenes.changeScene("BikeObby");
        }
    }, this);

    this.joinRoomPanelButton = this.menuPanel.findByName("JoinRoomButton");
    this.joinRoomPanelButton.button.on('click', async function (event) {
        if (this.joinRoomUI.enabled == false) {
            this.joinRoomUI.enabled = true;
            this.playerController.playerModel.sound.play("popup");
        } else {
            this.joinRoomUI.enabled = false;
            this.playerController.playerModel.sound.play("close");
        }
    }, this);

    this.discordButton = this.menuPanel.findByName("DiscordButton");
    this.discordButton.button.on('click', async function (event) {
        window.open("https://discord.gg/QnZx3pMwHU");
    }, this);

    this.menuButtonClose = this.menuPanel.findByName("CloseButton");
    this.menuButton.children[0].enabled = this.app.isMobile == false;
    this.menuButtonClose.button.on('click', function (event) {
        if (this.menuPanel.enabled) {
            this.menuButton.button.fire('click');
            this.app.mouse.enablePointerLock();
            this.app.cameraStateLocked = true;
            this.app.fire("lockCamera", false);
        }
    }, this);
    this.menuButton.button.on('click', function (event) {
        if (this.app.isMarketEnabled || this.app.isPopupEnabled || (this.menuPanel.enabled == false && this.playerController.isDied)) return;

        if (this.menuPanelTween)
            this.menuPanelTween.stop();

        if (this.menuPanel.enabled == false) {
            if (this.app.gameplayStarted === true) {
                PokiSDK.gameplayStop();
                this.app.gameplayStarted = false;
            }
            this.menuButtonClose.enabled = false;
            setTimeout(() => {
                this.menuButtonClose.enabled = true;
            }, 1000);
            this.app.fire("lockCamera", true);
            this.playerController.playerModel.sound.play("popup");
            this.menuPanel.enabled = true;
            this.app.isMenuEnabled = true;
            this.app.mouse.disablePointerLock();
            this.menuPanel.setLocalScale(new pc.Vec3(0.5, 0.5, 0.5));
            this.menuPanelTween = this.menuPanel
                .tween(this.menuPanel.getLocalScale()).to(new pc.Vec3(0.805, 0.805, 0.805), 0.2, pc.SineOut)
                .onComplete(() => {
                    this.menuPanelTween = null;
                })
                .start();
            this.blackBackground.enabled = true;
            this.data = { value: 0 };
            this.blackBackground
                .tween(this.data).to({ value: 0.75 }, 0.2, pc.SineOut)
                .onUpdate((dt) => {
                    this.blackBackground.element.opacity = this.data.value;
                })
                .start();
        } else {
            this.playerController.playerModel.sound.play("close");
            this.app.isMenuEnabled = false;
            this.menuPanel.setLocalScale(new pc.Vec3(0.805, 0.805, 0.805));
            this.menuPanelTween = this.menuPanel
                .tween(this.menuPanel.getLocalScale()).to(new pc.Vec3(0.5, 0.5, 0.5), 0.1, pc.SineIn)
                .onComplete(() => {
                    this.menuPanel.enabled = false;
                    this.menuPanelTween = null;
                })
                .start();
            if (this.playerController.isDied == false) {
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
        }
    }, this);

    this.clearDataButton = this.menuPanel.findByName("ClearData");
    this.clearDataButton.button.on('click', function (event) {
        this.app.fire("popupController:showPopup",
            "Delete progress", "Would you like to reset your progress?", true, this.app, "resetData", "closePopup");
    }, this);

    this.shopButtonClose = this.marketPanel.findByName("CloseButton");
    this.shopButton.children[0].enabled = this.app.isMobile == false;
    this.shopButtonClose.button.on('click', function (event) {
        if (this.marketPanel.enabled) {
            this.shopButton.button.fire('click');
        }
    }, this);
    this.shopButton.button.on('click', function (event) {
        if (this.app.isMenuEnabled || (this.marketPanel.enabled == false && this.playerController.isDied)) return;

        if (this.marketPanelTween)
            this.marketPanelTween.stop();

        if (this.app.marketButtonTween)
            this.app.marketButtonTween.stop();
        if (this.app.marketButtonTweenScale)
            this.app.marketButtonTweenScale.stop();
        this.app.marketButtonTween = null;
        this.app.marketButtonTweenScale = null;
        this.shopButton.setLocalEulerAngles(0, 0, 0);
        this.shopButton.setLocalScale(1, 1, 1);


        if (this.marketPanel.enabled == false) {
            this.app.fire("lockCamera", true);
            this.playerController.playerModel.sound.play("popup");
            this.marketPanel.enabled = true;
            this.app.isMarketEnabled = true;
            this.app.mouse.disablePointerLock();
            this.marketPanel.setLocalScale(new pc.Vec3(0.5, 0.5, 0.5));
            this.marketPanelTween = this.marketPanel
                .tween(this.marketPanel.getLocalScale()).to(new pc.Vec3(0.805, 0.805, 0.805), 0.2, pc.SineOut)
                .onComplete(() => {
                    this.marketPanelTween = null;
                })
                .start();
            this.blackBackground.enabled = true;
            this.data = { value: 0 };
            this.blackBackground
                .tween(this.data).to({ value: 0.75 }, 0.2, pc.SineOut)
                .onUpdate((dt) => {
                    this.blackBackground.element.opacity = this.data.value;
                })
                .start();
        } else {
            this.app.isWatchingAd = true;
            let commercialBreakCounter = Date.now();
            PokiSDK.commercialBreak(() => {
                // you can pause any background music or other audio here
                this.app.systems.sound.volume = 0;
            }).then(() => {
                console.log("Commercial break finished, proceeding to game");
                // if the audio was paused you can resume it here (keep in mind that the function above to pause it might not always get called)
                // continue your game here
                this.app.systems.sound.volume = 1;
                this.app.isWatchingAd = false;

                if (Date.now() - commercialBreakCounter > 1000) {
                    gameanalytics.GameAnalytics.addAdEvent(
                        gameanalytics.EGAAdAction.Show,
                        gameanalytics.EGAAdType.Interstitial,
                        "poki",
                        "BikeObby"
                    );
                }

                this.playerController.playerModel.sound.play("close");
                this.app.isMarketEnabled = false;
                this.marketPanel.setLocalScale(new pc.Vec3(0.805, 0.805, 0.805));
                this.marketPanelTween = this.marketPanel
                    .tween(this.marketPanel.getLocalScale()).to(new pc.Vec3(0.5, 0.5, 0.5), 0.1, pc.SineIn)
                    .onComplete(() => {
                        this.marketPanel.enabled = false;
                        this.marketPanelTween = null;
                    })
                    .start();
                if (this.playerController.isDied == false) {
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
            });
        }
    }, this);

    this.resetButton = this.app.root.findByName("ResetButton");
    this.resetButton.children[0].enabled = this.app.isMobile == false;
    this.resetButton.button.on('click', function (event) {
        if (this.playerController.isDied == false)
            this.playerController.died();
    }, this);

    this.deadPanelRewarded = this.deadPanel.findByName("RewardedAdButton");
    this.deadPanelRewarded.button.on('click', function (event) {
        this.app.isWatchingAd = true;
        PokiSDK.rewardedBreak({
            size: "small",
            onStart: () => {
                // you can pause any background music or other audio here
                this.app.systems.sound.volume = 0;
            }
        }).then((success) => {
            console.log("Rewarded break finished, proceeding to game", success);
            this.app.systems.sound.volume = 1;
            this.app.isWatchingAd = false;
            if (success) {
                this.app.currentStage += 1;
                if (this.app.currentStage > 199)
                    this.app.currentStage = 199;
                this.increaseStage();
                this.playerController.respawn();
                this.respawn();

                gameanalytics.GameAnalytics.addAdEvent(
                    gameanalytics.EGAAdAction.Show,
                    gameanalytics.EGAAdType.RewardedVideo,
                    "poki",
                    "BikeObby"
                );

                this.playerController.playerModel.sound.play("prize");
            }
        });
    }, this);

    this.deadPanelRespawn = this.deadPanel.findByName("RespawnButton");
    this.deadPanelRespawn.button.on('click', function (event) {
        if (this.canRespawn === true) {
            this.playerController.respawn();
            this.respawn();
            this.canRespawn = false;
        }
    }, this);

    this.checkForMarketTween();

    if (await this.joinServer()) {
        this.listenPlayers();
    } else {
        const activeBike = BikeObby_Utils.getItem("BIKEOBBY_activeBike");
        if (activeBike != null && activeBike != "") {
            this.buyBike(activeBike, 0);
        }
    }

    this.on("copiedRoomId", this.copiedRoomId, this);
    this.on('destroy', function () {
        window.removeEventListener("orientationchange", this);
        window.removeEventListener("resize", this);
        this.app.mouse.off("mousedown", onMouseDown);
    }, this);
};

// update code called every frame
BikeObby_NetworkManager.prototype.update = function (dt) {
    this.interpolatePositionAndRotation(dt);

    //reset
    if (this.app.keyboard.wasPressed(pc.KEY_R) && this.playerController.isDied == false) {
        this.playerController.died();
    }
    //market
    if (this.app.keyboard.wasPressed(pc.KEY_M)) {
        this.shopButton.button.fire('click');
    }

    //respawn
    if (this.app.keyboard.wasPressed(pc.KEY_SPACE) && this.app.deadMenuEnabled) {
        this.deadPanelRespawn.button.fire('click');
    }
    //


    this.mouseLockCounter += 1;
    if (this.app.firstTouch == true && this.app.canLockPointer == true && this.mouseLockCounter > 10) {
        this.mouseLockCounter = 0;
        const camResult = this.app.isWatchingAd || this.app.isMarketEnabled || this.app.isMenuEnabled ||
            this.app.deadMenuEnabled || this.app.isPopupEnabled || this.app.isRewardedPopupEnabled;

        if (camResult) {
            if (this.app.cameraStateLocked === true) {
                if (!this.app.isMobile) {
                    this.app.mouse.disablePointerLock();
                    this.app.canLockPointer = false;
                    clearTimeout(this.canLockPointerTimeout);
                    this.canLockPointerTimeout = setTimeout(() => {
                        this.app.canLockPointer = true;
                    }, 1000);
                }
                this.app.cameraStateLocked = false;
                this.app.fire("lockCamera", true);
            }
        } else {
            if (this.app.cameraStateLocked === false) {
                this.app.mouse.enablePointerLock();
                this.app.cameraStateLocked = true;
                this.app.fire("lockCamera", false);
                return;
            }
        }

        if (!this.app.isMobile && pc.Mouse.isPointerLocked() === false && camResult === false) {
            console.log("Mouse is not locked and no other panels are enabled, open the menu");
            this.menuButton.button.fire('click');
        }
    }
};

BikeObby_NetworkManager.prototype.copiedRoomId = function () {
    if (this.room) {
        PokiSDK.shareableURL({ room: this.room.roomId + "2" }).then(url => {
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

BikeObby_NetworkManager.prototype.joinServer = async function () {
    try {
        console.log("try connecting server");
        this.app.colyseus = new Colyseus.Client("wss://rainbowobby1.emolingo.games");
        //this.app.colyseus = new Colyseus.Client("ws://localhost:2567");
        const roomIdFromURL = PokiSDK.getURLParam('room');
        const customRoomId = BikeObby_Utils.getItem("BIKEOBBY_joinCustomRoom");
        if (BikeObby_Utils.getItem("BIKEOBBY_createCustomRoom") === "1") {
            BikeObby_Utils.setItem("BIKEOBBY_createCustomRoom", "");
            this.room = await this.app.colyseus.create("bikeObby", { accessToken: "bikeobby", isPrivate: true });
            this.app.fire("popupController:showPopup",
                "Private Room Created", "Room code: " + this.room.roomId + "2", false, this, "copiedRoomId", "closePopup", { yesButtonText: "Copy" });
        } else if (customRoomId != "" && customRoomId != null) {
            this.room = await this.app.colyseus.joinById(customRoomId.slice(0, -1), { accessToken: "bikeobby" });
            BikeObby_Utils.setItem("BIKEOBBY_joinCustomRoom", "");
        } else if (roomIdFromURL != "" && roomIdFromURL != null) {
            this.room = await this.app.colyseus.joinById(roomIdFromURL.slice(0, -1), { accessToken: "bikeobby" });
            BikeObby_Utils.setItem("BIKEOBBY_joinCustomRoom", "");
        } else {
            this.room = await this.app.colyseus.joinOrCreate("bikeObby", { accessToken: "bikeobby" });
        }
        console.log("connected to the ", this.room.name);
    } catch (e) {
        console.log(e);
        if (e.toString().includes("not found")) {
            BikeObby_Utils.setItem("BIKEOBBY_joinCustomRoom", "");
            this.app.fire('WarningTextController:setWarning', "Failed to join... Room is full or Id invalid :/", 5, new pc.Color(1, 0, 0, 1));
        }
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

BikeObby_NetworkManager.prototype.onOrientationChange = function () {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (w > h) {
        // Landscape
        this.progressBar.enabled = true;
        const tempPos = this.raycastEndPoint.getLocalPosition();
        tempPos.z = this.app.mouseScroll + 16;
        this.raycastEndPoint.setLocalPosition(tempPos);
    }
    else {
        // Portrait
        this.progressBar.enabled = false;
        const tempPos = this.raycastEndPoint.getLocalPosition();
        tempPos.z = this.app.mouseScroll + 24;
        this.raycastEndPoint.setLocalPosition(tempPos);
    }
}

BikeObby_NetworkManager.prototype.listenPlayers = function () {
    this.playerEntities = {};

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
                targetPlayer.grounded = player.grounded;
            }
        });

        let newPlayer;
        //if its local player
        if (this.room.sessionId === sessionId) {
            this.localSessionId = sessionId;
            newPlayer = this.player;
            const activeBike = BikeObby_Utils.getItem("BIKEOBBY_activeBike");
            if (activeBike != null) {
                this.buyBike(activeBike, 0);
            }
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
                this.playerEntities[sessionId].script.otherPlayerController.died();
            } else {
                this.playerEntities[sessionId].script.otherPlayerController.respawn();
            }
        });

        player.listen("bikeId", (newBikeId, oldBikeId) => {
            if (sessionId === this.localSessionId || (newBikeId == 0 && oldBikeId == null)) return;
            if (newBikeId != null && !Number.isNaN(newBikeId) && newBikeId >= 0 && newBikeId < this.bikes.length) {
                this.buyBikeOthers(this.playerEntities[sessionId], newBikeId);
            }
        });

        player.listen("hasJumpCoil", (hasJumpCoil) => {
            if (sessionId === this.localSessionId) return;
            if (hasJumpCoil) {
                this.playerEntities[sessionId].script.otherPlayerController.enableJumpCoil();
            } else {
                this.playerEntities[sessionId].script.otherPlayerController.disableJumpCoil();
            }
        });

        player.listen("hasTotem", (hasTotem) => {
            if (sessionId === this.localSessionId) return;
            if (hasTotem) {
                this.playerEntities[sessionId].script.otherPlayerController.enableTotem();
            } else {
                this.playerEntities[sessionId].script.otherPlayerController.disableTotem();
            }
        });

        player.listen("hasJetpack", (hasJetpack) => {
            if (sessionId === this.localSessionId) return;
            if (hasJetpack) {
                this.playerEntities[sessionId].script.otherPlayerController.enableJetpack();
            } else {
                this.playerEntities[sessionId].script.otherPlayerController.disableJetpack();
            }
        });

        player.listen("isUsingJetpack", (isUsingJetpack) => {
            if (sessionId === this.localSessionId) return;
            if (isUsingJetpack) {
                this.playerEntities[sessionId].script.otherPlayerController.useJetpack();
            } else {
                this.playerEntities[sessionId].script.otherPlayerController.dontUseJetpack();
            }
        });

        player.listen("username", (username) => {
            if (sessionId === this.localSessionId) {
                this.playerController.username.text = username;
            } else {
                this.playerEntities[sessionId].script.otherPlayerController.username.text = username;
            }
        });
    }, false);

    //player disconnected
    this.room.state.players.onRemove((player, sessionId) => {
        this.onlineCount -= 1;
        this.onlineCounter.element.text = this.onlineCount;

        if (this.playerEntities[sessionId].spawnedDeadBody)
            this.playerEntities[sessionId].spawnedDeadBody.destroy();

        if (this.localSessionId != sessionId)
            this.playerEntities[sessionId].destroy();
        delete this.playerEntities[sessionId];
    }, false);

    this.room.onMessage("Server:PlayerController:respawn", (sessionId) => {
        this.playerEntities[sessionId].script.playerController.respawn();
    });
};

BikeObby_NetworkManager.prototype.buyBike = function (type, price) {
    if (this.playerController.activeBikeId == type) return;
    if (BikeObby_Utils.getItem("BIKEOBBY_bikeBoughtType" + type) === "1") { //daha onceden aldiysa
        this.playerController.playerModel.sound.play("equip");
    } else if (this.app.coin >= price) {
        this.decreaseCoin(price);
        this.playerController.playerModel.sound.play("bought");
    } else if (price != 0) {
        //yetersiz bakiye
        this.app.fire('WarningTextController:setWarning', "You need " + (price - this.app.coin) + " gold to buy new bike..", 5, new pc.Color(1, 0, 0, 1));
        this.playerController.playerModel.sound.play("failed");
        return false;
    }

    this.playerController.bikeModel.destroy();
    const newBike = this.bikes[type].resource.instantiate();
    this.playerController.bike.addChild(newBike);
    this.playerController.bikeModel = this.playerController.bike.children[3];

    this.playerController.wheels = [];
    for (let i = 0; i < this.playerController.bikeModel.children.length; i++) {
        const child = this.playerController.bikeModel.children[i];
        if (child.name.includes("wheel")) {
            this.playerController.wheels.push(child);
        }
    }

    this.playerController.playerModel.getLocalPosition().y = bikeData[type].seatY;
    this.playerController.data = bikeData[type];
    if (bikeData[type].isMotor) {
        this.playerController.isRidingMotor = true;
    } else {
        this.playerController.isRidingMotor = false;
    }
    if (bikeData[type].isCar) {
        this.playerController.playerModel.enabled = false;
    } else {
        this.playerController.playerModel.enabled = true;
    }
    this.playerController.bikeSpeed = bikeData[type].speed;
    this.playerController.jumpPower = bikeData[type].jumpPower;
    this.playerController.activeBikeId = type;
    this.playerController.bikeDriveSlot = this.playerController.bikeModel.sound.slot("bikeDrive");
    this.playerController.bikeDriveSound = false;

    if (this.room) {
        this.room.send("Client:ChangeBike", { bikeId: type });
    }
    BikeObby_Utils.setItem("BIKEOBBY_bikeBoughtType" + type, "1");
    BikeObby_Utils.setItem("BIKEOBBY_activeBike", type);

    this.app.fire("ActiveBikeChanged");
    return true;
};

BikeObby_NetworkManager.prototype.buyBikeOthers = function (player, type) {
    const playerController = player.script.otherPlayerController;
    playerController.bike.destroy();
    const newBike = this.bikes[type].resource.instantiate();
    playerController.body.addChild(newBike);
    newBike.setLocalEulerAngles(0, 0, 0);
    newBike.setLocalPosition(0, 0.103, -0.07);
    playerController.bike = newBike;
    playerController.wheels = [];
    for (let i = 0; i < playerController.bike.children.length; i++) {
        const child = playerController.bike.children[i];
        if (child.name.includes("wheel")) {
            playerController.wheels.push(child);
        }
    }

    playerController.playerModel.setLocalPosition(0, 0.103, bikeData[type].seatY + 0.85);
    if (bikeData[type].isCar) {
        playerController.playerModel.enabled = false;
    } else {
        playerController.playerModel.enabled = true;
    }
    if (bikeData[type].isMotor) {
        playerController.isRidingMotor = true;
    } else {
        playerController.isRidingMotor = false;
    }
};

BikeObby_NetworkManager.prototype.collectCoin = function () {
    this.app.coin += 1;
    //this.playerController.collectCoinSlot.pitch = ((this.playerController.collectCoinSlot.pitch + 0.1) % 2) + 0.5;
    this.playerController.playerModel.sound.play("collectCoin");
    BikeObby_Utils.setItem("BIKEOBBY_coin", this.app.coin);
    this.coinText.element.text = this.app.coin;
    this.checkForMarketTween();
};

BikeObby_NetworkManager.prototype.checkForMarketTween = function () {
    if (this.app.marketButtonTween == null) {
        bikeData.forEach(bike => {
            if (BikeObby_Utils.getItem("BIKEOBBY_bikeBoughtType" + bike.type) === "1") {
                bike.bought = true;
            }

            //satin almadiysa ve parasi yetiyosa ve rewarded degilse rewarded butonu sallansin
            if (bike.type != 0 && bike.bought != true && this.app.coin >= bike.price && bike.isRewarded === false && this.app.marketButtonTweenParent == null) {

                this.app.marketButtonTween = this.shopButton.tween(this.shopButton.getLocalRotation())
                    .to(new pc.Quat().setFromEulerAngles(0, 0, -10), 0.2, pc.QuinticOut)
                    .yoyo(true)
                    .repeat(2)
                    .delay(0.4)
                    .loop(true)
                    .start();

                this.app.marketButtonTweenScale = this.shopButton.tween(this.shopButton.getLocalScale())
                    .to(new pc.Vec3(1.1, 1.1, 1.1), 0.4, pc.QuinticOut)
                    .yoyo(true)
                    .repeat(2)
                    .delay(0.2)
                    .loop(true)
                    .start();
            }
        });
    }
};

BikeObby_NetworkManager.prototype.increaseCoin = function (amount) {
    this.app.coin += amount;
    BikeObby_Utils.setItem("BIKEOBBY_coin", this.app.coin);
    this.coinText.element.text = this.app.coin;
};

BikeObby_NetworkManager.prototype.decreaseCoin = function (amount) {
    this.app.coin -= amount;
    BikeObby_Utils.setItem("BIKEOBBY_coin", this.app.coin);
    this.coinText.element.text = this.app.coin;
};

BikeObby_NetworkManager.prototype.increaseStage = function () {
    this.stageUIText.element.text = this.app.currentStage + 1;
    this.stagePercentageText.text = ((this.app.currentStage + 1) / 2) + "%";
    this.stagePercentagePin.setLocalPosition(this.app.currentStage * 2.685, -40, 0);
    if (this.playerController.playerModel)
        this.playerController.playerModel.sound.play("checkpoint");
    if (this.app.currentStage === 99 || this.app.currentStage === 199) {
        if (this.app.currentStage === 199)
            this.app.stopTimer = true;
        this.endConfetti.play();
        setTimeout(() => {
            if (this.endConfetti)
                this.endConfetti.stop();
        }, 15000);
    }
};

BikeObby_NetworkManager.prototype.respawn = function () {
    this.app.deadMenuEnabled = false;
    this.deadPanel.enabled = false;
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
};

BikeObby_NetworkManager.prototype.diedEffect = function () {
    //kirmizi ekran tween
    this.canRespawn = false;
    this.app.deadMenuEnabled = true;
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

    this.shopButtonClose.button.fire('click');
    this.menuButtonClose.button.fire('click');

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

BikeObby_NetworkManager.prototype.loadLocalStorageData = function () {
    this.stagesParent = this.app.root.findByName("Stages1");
    this.endConfetti = this.app.root.findByName("EndConfetti1").particlesystem;
    const currentStage = BikeObby_Utils.getItem("BIKEOBBY_currentStage");
    if (currentStage) {
        this.app.currentStage = Number.parseInt(currentStage)
        if (this.app.currentStage > 99) {
            this.stagesParent = this.app.root.findByName("Stages2");
            this.endConfetti = this.app.root.findByName("EndConfetti2").particlesystem;
            this.world1.enabled = false;
            this.world2.enabled = true;
            this.worldNumber = 2;
        } else {
            this.stagesParent = this.app.root.findByName("Stages1");
            this.endConfetti = this.app.root.findByName("EndConfetti1").particlesystem;
            this.world1.enabled = true;
            this.world2.enabled = false;
            this.worldNumber = 1;
        }
    } else {
        this.app.currentStage = 0;
        BikeObby_Utils.setItem("BIKEOBBY_currentStage", 0);
        this.world1.enabled = true;
        this.world2.enabled = false;
        this.worldNumber = 1;
    }
    const coin = BikeObby_Utils.getItem("BIKEOBBY_coin");
    if (coin) {
        this.app.coin = Number.parseInt(coin)
    } else {
        this.app.coin = 0;
        BikeObby_Utils.setItem("BIKEOBBY_coin", 0);
    }
    this.increaseStage();
    this.coinText.element.text = this.app.coin;
};

BikeObby_NetworkManager.prototype.interpolatePositionAndRotation = function (dt) {
    for (var key in this.playerEntities) {
        //pass local player
        if (key == this.room.sessionId) continue;

        const playerEntity = this.playerEntities[key];

        //position
        const bikeModel = playerEntity.children[0];
        this.interpolatedPosition = bikeModel.getPosition().clone();
        if (this.interpolatedPosition.distance(playerEntity.networkPosition) < 20) {
            this.interpolatedPosition.lerp(bikeModel.getPosition(),
                playerEntity.networkPosition, 5 * dt);
            bikeModel.setPosition(this.interpolatedPosition);
        } else {
            bikeModel.setPosition(playerEntity.networkPosition);
        }

        //rotation
        this.interpolatedRotation = bikeModel.getRotation().clone();
        this.interpolatedRotation.slerp(bikeModel.getRotation(),
            playerEntity.networkRotation, 5 * dt);
        bikeModel.setRotation(this.interpolatedRotation);
    }
};