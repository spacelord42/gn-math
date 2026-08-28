var LoNetworkManager = pc.createScript('loNetworkManager');
LoNetworkManager.attributes.add("clientTemplete", { type: "entity" });
LoNetworkManager.attributes.add("remoteLadderTemplete", { type: "entity" });

// initialize code called once per entity
LoNetworkManager.prototype.initialize = function () {
    this.market = this.app.root.findByName("Market").script.loMarketController;
    this.minYposition = 0;
    this.maxYposition = 258.074;
    this.player = this.app.root.findByName("Player");
    this.stagePercentagePin = this.app.root.findByName("stagePercentagePin");
    this.progressText = this.app.root.findByName("stagePercentageText");
    this.remoteClients = {};
    this.remoteladder = {};
    this.playerSchema = {};
    this.ladderSchema = {};
    this.connectToServer();

    this.findObjects();

    this.app.on("CreateRoom", this.createRoom, this);
    this.app.on("JoinRoom", this.joinRoom, this);
    this.app.on("UpdateCoinText", this.updateCoin, this);

    if (Utils.getItem("loCoin"))
        this.app.coin = Utils.getItem("loCoin");
    else {
        this.app.coin = 0
    }
    this.coinText.element.text = this.app.coin;

    if (!this.app.touch) {
        this.app.root.findByName("MobileControls").enabled = false;
    }
    this.on('destroy', function () {
        this.app.off("CreateRoom", this.createRoom, this);
        this.app.off("JoinRoom", this.joinRoom, this);


    }, this);
};
LoNetworkManager.prototype.updateCoin = function () {
    this.coinText.element.text = this.app.coin;
};
LoNetworkManager.prototype.findObjects = function () {
    this.coinText = this.app.root.findByName("CoinText");
};

LoNetworkManager.prototype.joinRoom = async function (id) {
    if (this.app.colyseus == null) {
        //this.app.colyseus = new Colyseus.Client("ws://localhost:2567");
        this.app.colyseus = new Colyseus.Client("ws://localhost:2567");
    }
    if (this.room) {
        await this.room.leave();
    }
    this.leaveRoom();
    try {
        this.room = await this.app.colyseus.joinById(id);
        this.stateListen();
    }
    catch (error) {
        this.app.fire("onUnSuccesfulJoinToRoom", error.toString());
    }
};

LoNetworkManager.prototype.createRoom = async function () {
    if (this.app.colyseus == null) {
        //this.app.colyseus = new Colyseus.Client("ws://localhost:2567");
        this.app.colyseus = new Colyseus.Client("ws://localhost:2567");
    }
    if (this.room) {
        await this.room.leave();
    }
    this.leaveRoom();
    try {
        this.room = await this.app.colyseus.create("my_room", { private: true });
        this.stateListen();
        this.getUrl();
    }
    catch (error) {
        this.app.fire("onUnSuccesfulJoinToRoom", error.toString());
    }
};
LoNetworkManager.prototype.getUrl = function () {
    if (this.room != null)
        PokiSDK.shareableURL({ room: this.room.roomId + "4" }).then(url => {
            const roomID = this.room.roomId;

            const roomLink = url;
            this.app.fire("onGetRoomIDAndRoomLink", roomLink, roomID);
        });
}
LoNetworkManager.prototype.connectToServer = async function () {
    if (this.app.colyseus == null) {
        //this.app.colyseus = new Colyseus.Client("ws://localhost:2567");
        this.app.colyseus = new Colyseus.Client("ws://localhost:2567");

    }
    try {
        let roomIdFromURL = PokiSDK.getURLParam('room');

        if (roomIdFromURL) {
            this.room = await this.app.colyseus.joinById(roomIdFromURL.slice(0, -1));
            //this.sendPacket("changeCar", { carId: CoSaveSystem.getItem("CAROBBY_carID") * 1 });
        }
        else {
            this.room = await this.app.colyseus.joinOrCreate("my_room");
        }

        //this.sendPacket("changeCar", { carId: CoSaveSystem.getItem("CAROBBY_carID") * 1 });
        this.stateListen();
        this.room.send("changePowerUp", { log: "a" })

    }
    catch (message) {
        //console.log(message);
        this.connectingText.enabled = false;
    }
};
LoNetworkManager.prototype.stateListen = function () {
    if (!this.market) {
        this.market = this.app.root.findByName("Market").script.loMarketController;
    }
    if (this.room)
        this.room.send("SendSkin", { ladderSkin: Number.parseInt(Utils.getItem("lo-ladder")), playerSkin: Number.parseInt(Utils.getItem("lo-skin")) });
    if (this.room)

        this.room.onMessage("ClientChangePowerUp", (message) => {
            if (message.session != this.room.sessionId) {
                console.log(message.message)
                if (message.message.end) {
                    if (message.message.end != 2)
                        this.remoteClients[message.session].script.loInventoryController.clearItem(message.message.end);
                    else {
                        this.remoteladder[message.session].findByName("UpgradeLadder").enabled = false;
                    }
                }
                if (message.message.start) {
                    if (message.message.start != 2)
                        this.remoteClients[message.session].script.loInventoryController.setItem(message.message.start);
                    else {
                        this.remoteladder[message.session].findByName("UpgradeLadder").enabled = true;
                    }
                }
            }
        });

    this.room.state.players.onAdd((player, sessionId) => {


        if (this.room.sessionId != sessionId) {
            let entity = this.clientTemplete.clone();
            this.app.root.addChild(entity);
            entity.findByName("Username").element.text = player.username;
            entity.enabled = true;
            entity.setPosition(player.x, player.y, player.z);
            this.remoteClients[sessionId] = entity;
            this.playerSchema[sessionId] = player;
            entity.findByName("N00b7.001").render.meshInstances[0].material = this.market.skinMat[player.skin].resource;

            player.listen("skin", (newSkin, oldSkin) => {
                this.remoteClients[sessionId].findByName("N00b7.001").render.meshInstances[0].material = this.market.skinMat[newSkin].resource;
            });

        }
        else {
            this.player.script.loPlayerController.username.element.text = player.username;
        }
        player.onChange(() => {
            if (this.room.sessionId != sessionId) {
                this.playerSchema[sessionId] = player;
            }
        });
    });

    this.room.state.ladders.onAdd((ladder, sessionId) => {
        if (this.room.sessionId != sessionId) {

            let ladderentity = this.remoteLadderTemplete.clone();
            this.app.root.addChild(ladderentity);
            ladderentity.enabled = ladder.enabled;
            ladderentity.setPosition(ladder.x, ladder.y, ladder.z, ladder.w);
            ladderentity.children[0].render.meshInstances[0].material = this.market.ladderMat[ladder.skin].resource;
            this.remoteladder[sessionId] = ladderentity;
            //this.ladderSchema[sessionId] = ladder;

            ladder.listen("skin", (newSkin, oldSkin) => {
                this.remoteladder[sessionId].children[0].render.meshInstances[0].material = this.market.ladderMat[newSkin].resource;
            });
        }
        ladder.onChange(() => {
            if (this.room.sessionId != sessionId) {
                this.ladderSchema[sessionId] = ladder;
            }
        });
    });
    this.room.state.players.onRemove((player, sessionId) => {
        this.remoteClients[sessionId].destroy();

        delete this.remoteClients[sessionId];
        delete this.playerSchema[sessionId];
    });
    this.room.state.ladders.onRemove((ladder, sessionId) => {
        this.remoteladder[sessionId].destroy();

        delete this.remoteladder[sessionId];
        delete this.ladderSchema[sessionId];
    });
};

// update code called every frame
LoNetworkManager.prototype.update = function (dt) {
    this.setPorgressBar();
    this.lerp(dt);
    if (this.app.keyboard.wasPressed("r")) {
        if (this.app.isRewardedLadder)
            this.app.fire("LO_RewardedLadder")
    }
};
LoNetworkManager.prototype.lerp = function (dt) {
    Object.keys(this.playerSchema).forEach((sessionId) => {
        //console.log(this.playerSchema[sessionId])
        if (!this.remoteClients[sessionId]) return;
        let firstPosition = this.remoteClients[sessionId].getPosition().clone();
        let to = new pc.Vec3(this.playerSchema[sessionId].x, this.playerSchema[sessionId].y, this.playerSchema[sessionId].z)
        let lerp = firstPosition.lerp(firstPosition, to, dt * 7);
        this.remoteClients[sessionId].setPosition(lerp);
        //slerp

        let firstRotation = this.remoteClients[sessionId].getRotation().clone();
        let toRotation = new pc.Quat().setFromEulerAngles(0, this.playerSchema[sessionId].rotationY, 0);
        let slerp = firstRotation.slerp(firstRotation, toRotation, dt * 15);
        this.remoteClients[sessionId].setRotation(slerp);

        let ladderfirstPosition = this.remoteladder[sessionId].getPosition().clone();
        let ladderto = new pc.Vec3(this.ladderSchema[sessionId].x, this.ladderSchema[sessionId].y, this.ladderSchema[sessionId].z)
        let ladderlerp = ladderfirstPosition.lerp(ladderfirstPosition, ladderto, dt * 7);
        this.remoteladder[sessionId].setPosition(ladderlerp);
        //slerp

        let ladderfirstRotation = this.remoteladder[sessionId].getRotation().clone();
        let ladderToRotation = new pc.Quat(
            this.ladderSchema[sessionId].rx,
            this.ladderSchema[sessionId].ry,
            this.ladderSchema[sessionId].rz,
            this.ladderSchema[sessionId].rw,
        );
        let ladderslerp = ladderfirstRotation.slerp(ladderfirstRotation, ladderToRotation, dt * 15);
        this.remoteladder[sessionId].setRotation(ladderslerp);
        //this.remoteladder[sessionId].rotateLocal(-90, 0, 0)
        this.remoteladder[sessionId].enabled = this.ladderSchema[sessionId].enabled;
        this.setAnimation(sessionId);
    });
};
LoNetworkManager.prototype.setAnimation = function (sessionId) {
    let animator = this.remoteClients[sessionId].children[0].anim;
    if (this.playerSchema[sessionId].grounded) {

        animator.setBoolean("isClimbing", this.playerSchema[sessionId].isClimbing)
        animator.setBoolean("isOnLadder", this.playerSchema[sessionId].isOnLadder)
        animator.setBoolean("walk", this.playerSchema[sessionId].isWalking)
        animator.setBoolean("isInAir", false)
    }
    else {
        if (this.playerSchema[sessionId].isClimbing) {
            animator.setBoolean("isClimbing", this.playerSchema[sessionId].isClimbing)
            animator.setBoolean("isOnLadder", this.playerSchema[sessionId].isOnLadder)
            animator.setBoolean("isInAir", false)
        }
        else {
            animator.setBoolean("isInAir", true)
        }
    }

};
LoNetworkManager.prototype.setPorgressBar = function () {
    let q = 540 / (this.maxYposition - this.minYposition)
    let h = 100 / (this.maxYposition - this.minYposition)
    let percentile = Math.floor(this.player.getPosition().y * h);
    if (percentile < 0) {
        this.progressText.element.text = 0 + " %";
        this.stagePercentagePin.setLocalPosition(0, -40, 0);
    }
    else if (percentile > 100) {
        this.progressText.element.text = 100 + " %";
        this.stagePercentagePin.setLocalPosition(540, -40, 0);
    }
    else {
        this.progressText.element.text = percentile + " %";
        this.stagePercentagePin.setLocalPosition(this.player.getPosition().y * q, -40, 0);
    }
};
LoNetworkManager.prototype.leaveRoom = function () {
    Object.keys(this.playerSchema).forEach((sessionId) => {

        this.remoteClients[sessionId].destroy();

        delete this.remoteClients[sessionId];
        delete this.playerSchema[sessionId];

        this.remoteladder[sessionId].destroy();

        delete this.remoteladder[sessionId];
        delete this.ladderSchema[sessionId];
    })
};
LoNetworkManager.prototype.collectCoin = function () {
    if (this.app.coin) {
        this.app.coin++;
    }
    else {
        this.app.coin = 1;
    }
    Utils.setItem("loCoin", this.app.coin);
    this.coinText.element.text = this.app.coin;

};