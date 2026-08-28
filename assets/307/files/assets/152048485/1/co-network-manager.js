/*CoNetworkManager script that handles network connections and packets by Emre Şahin - emolingo games */
var CoNetworkManager = pc.createScript('coNetworkManager');
CoNetworkManager.attributes.add("playerTemplate", { type: "asset", assetType: "template" });
CoNetworkManager.attributes.add("player", { type: "entity" });
CoNetworkManager.attributes.add("connectingText", { type: "entity" });
CoNetworkManager.attributes.add("carChange", { type: "entity" });
CoNetworkManager.attributes.add("onlinePlayersParent", { type: "entity" });
CoNetworkManager.attributes.add("onlinePlayersCountText", { type: "entity" });
CoNetworkManager.attributes.add("localHost", { type: "boolean", default: false });

CoNetworkManager.prototype.initialize = function () {
    this.room = null;
    this.join = 0;//0 
    this.playerEntitys = {};
    this.joinID = "";
    this.connectToServer();

    this.userName;

    this.isDie = false;

    this.currentStage;

    this.wait = true;

    this.app.on("CreateRoom", this.createRoom, this);
    this.app.on("JoinRoom", this.joinRoom, this);
    this.app.on("LeaveRoom", this.leaveRoom, this);
    this.on('destroy', function () {
        this.app.off("CreateRoom", this.createRoom, this);
        this.app.off("JoinRoom", this.joinRoom, this);
        this.app.off("LeaveRoom", this.leaveRoom, this);
        clearInterval(this.playerStateSend);
    }, this);

};

CoNetworkManager.prototype.leaveRoom = async function () {
    if (this.room)
        await this.room.leave();
    else {

    }
    this.app.root.findByName("Sound Manager").sound.stop("Game Music");
};

CoNetworkManager.prototype.connectToServer = async function () {
    if (this.app.colyseus == null) {
        //this.app.colyseus = new Colyseus.Client("ws://localhost:2567");
        this.app.colyseus = new Colyseus.Client("wss://rainbowobby1.emolingo.games");

    }
    try {
        let roomIdFromURL = PokiSDK.getURLParam('room');

        if (roomIdFromURL) {

            //this.joinById(roomIdFromURL);
            this.room = await this.app.colyseus.joinById(roomIdFromURL.slice(0, -1));
            this.sendPacket("changeCar", { carId: CoSaveSystem.getItem("CAROBBY_carID") * 1 });
        }
        else {
            this.room = await this.app.colyseus.joinOrCreate("carObby");
        }

        this.sendPacket("changeCar", { carId: CoSaveSystem.getItem("CAROBBY_carID") * 1 });

        this.onAddPlayer();
    }
    catch (message) {
        //console.log(message);
        this.connectingText.enabled = false;
    }
};

CoNetworkManager.prototype.onAddPlayer = function () {
    var that = this;
    this.room.state.players.onAdd((player, sessionId) => {
        this.connectingText.enabled = false;

        if (this.room.sessionId == sessionId) {
            this.playerStateSend = setInterval(this.sendPosition.bind(this), 100);
            player.listen("username", (newName, oldName) => {
                //this.playerEntitys[sessionId].username = newName;
                this.player.parent.script.coPlayer.playerText.element.text = newName;
                //localPlayerin nicki
                this.userName = newName;
            });
            return;
        }
        var entity = this.playerTemplate.resource.instantiate();/*
        if (player.x == undefined || player.y == undefined || player.z == undefined) {
            entity.enabled = true;
            entity.setLocalPosition(new pc.Vec3(163.236, 36.513, 175.064));
        }
        else {
            entity.setLocalPosition(new pc.Vec3(player.x, player.y, player.z));
        }
        if (player.x == undefined) {
            entity.enabled = true;
            entity.setLocalPosition(new pc.Vec3(163.236, 36.513, 175.064));
        }
        */
        this.app.root.addChild(entity);
        this.playerEntitys[sessionId] = { entity: entity };
        this.playerEntitys[sessionId].isDie = false;/*
        if (player.carId == undefined) {
            this.carChange.script.coCarChangeManager.changeClientCar(0, sessionId);
        } else {
            this.carChange.script.coCarChangeManager.changeClientCar(player.carId, sessionId);
        }*/

        player.listen("carId", (newId, oldId) => {
            this.carChange.script.coCarChangeManager.changeClientCar(newId, sessionId);
            this.playerEntitys[sessionId].entity.script.clientWheelParent.nameText.element.text =
                this.playerEntitys[sessionId].username;//oyuncu arabayı deiştirince name ini deişme
        });
        player.listen("frontWheelRotation", (newRotation, oldRotation) => {
            this.playerEntitys[sessionId].entity.script.clientWheelParent.steering = newRotation;
        });
        player.listen("isDie", (newValue, oldValue) => {
            this.playerEntitys[sessionId].isDie = newValue;
            this.playerEntitys[sessionId].entity.enabled = !newValue;
        });
        player.listen("username", (newName, oldName) => {
            this.playerEntitys[sessionId].username = newName;
            this.playerEntitys[sessionId].entity.script.clientWheelParent.nameText.element.text = newName;
            //clientle bağlanan oyuncunun nicki
        });
        player.onChange(() => {
            if (this.room.sessionId != sessionId) {
                that.updatePosition(sessionId, player);
            }
        });
    });
    this.room.state.players.onRemove((player, sessionId) => {
        this.playerEntitys[sessionId].entity.destroy();

        delete this.playerEntitys[sessionId];
    });

};
CoNetworkManager.prototype.createRoom = async function () {
    if (this.app.colyseus == null)
        this.app.colyseus = new Colyseus.Client("wss://rainbowobby1.emolingo.games");
    try {
        if (this.room)
            await this.room.leave();
        this.room = await this.app.colyseus.create("carObby", { private: true });
        this.sendPacket("changeCar", { carId: CoSaveSystem.getItem("CAROBBY_carID") * 1 });
        this.leaveRoom();
        this.onAddPlayer();
        this.copiedRoomId();

        //console.log("Oda Basari Ile Olusturuldu, RoomId: " + roomID)
    }
    catch (message) {
        console.log(message);
        this.app.fire("onGetRoomCreateErrorMessage", message);
    }
};

CoNetworkManager.prototype.joinRoom = async function (id) {
    this.leaveRoom();
    if (this.app.colyseus == null)
        this.app.colyseus = new Colyseus.Client("wss://rainbowobby1.emolingo.games");
    try {
        if (this.room)
            await this.room.leave();
        this.room = await this.app.colyseus.joinById(id);
        this.sendPacket("changeCar", { carId: CoSaveSystem.getItem("CAROBBY_carID") * 1 });
        this.leaveRoom();
        this.onAddPlayer();
        this.app.fire("onSuccesfulJoinToRoom");
        this.app.fire("coUiManager:openGameScreen");
    }
    catch (message) {
        this.app.fire("onUnSuccesfulJoinToRoom", message.toString());
    }
};

CoNetworkManager.prototype.updatePosition = function (session, player) {
    if (this.playerEntitys[session] == null) return;
    this.playerEntitys[session].position = new pc.Vec3(player.x, player.y, player.z);
    this.playerEntitys[session].rotationX = player.rotationX;
    this.playerEntitys[session].rotationY = player.rotationY;
    this.playerEntitys[session].rotationZ = player.rotationZ;
    this.playerEntitys[session].rotationW = player.rotationW;
};

CoNetworkManager.prototype.update = function (dt) {
    const allPlayers = Object.values(this.playerEntitys);
    //this.onlinePlayersParent.enabled = allPlayers.length > 0;
    this.onlinePlayersCountText.element.text = (allPlayers.length * 1) + 1;
    for (let i = 0; i < allPlayers.length; i++) {
        let entity = allPlayers[i].entity;
        if (this.wait == false) {
            if (allPlayers[i].isDie) {
                entity.setLocalPosition(allPlayers[i].position);
            } else {
                var newPosition = new pc.Vec3(
                    pc.math.lerp(entity.getPosition().x, allPlayers[i].position.x, dt * 6),
                    pc.math.lerp(entity.getPosition().y, allPlayers[i].position.y, dt * 6),
                    pc.math.lerp(entity.getPosition().z, allPlayers[i].position.z, dt * 6)
                );
                entity.setLocalPosition(newPosition);
            }
        }
        else {
            if (allPlayers[i].position.x != 0 && allPlayers[i].position.y != 0 && allPlayers[i].position.z != 0) {
                entity.setLocalPosition(allPlayers[i].position);
                this.wait = false;
            }
        }
        if (
            allPlayers[i].rotationX == undefined ||
            allPlayers[i].rotationY == undefined ||
            allPlayers[i].rotationZ == undefined ||
            allPlayers[i].rotationW == undefined
        ) return;
        if (
            allPlayers[i].rotationX == NaN ||
            allPlayers[i].rotationY == NaN ||
            allPlayers[i].rotationZ == NaN ||
            allPlayers[i].rotationW == NaN
        ) return;

        const playerQuat = new pc.Quat(
            allPlayers[i].rotationX,
            allPlayers[i].rotationY,
            allPlayers[i].rotationZ,
            allPlayers[i].rotationW
        );
        var rotation = entity.getRotation();
        var quat = rotation.slerp(
            rotation,
            playerQuat,
            dt * 8
        );
        entity.setRotation(quat);

    }

};
CoNetworkManager.prototype.leaveRoom = async function () {
    const allPlayers = Object.values(this.playerEntitys);

    for (let i = 0; i < allPlayers.length; i++) {
        allPlayers[i].entity.destroy();
    }
    this.playerEntitys = {};

    clearInterval(this.leaveRoom);
    console.log(this.playerEntitys);
};


CoNetworkManager.prototype.sendPosition = function () {
    if (this.room == null) return;
    if (!this.isDie)
        this.room.send("updatePosition", {
            x: this.player.getPosition().x,
            y: this.player.getPosition().y,
            z: this.player.getPosition().z,
            rotationX: this.player.getRotation().x,
            rotationY: this.player.getRotation().y,
            rotationZ: this.player.getRotation().z,
            rotationW: this.player.getRotation().w,
        });
    else {
        let foundCheckPoint = this.player.parent.script.coPlayer.physicsEntity.script.coPlayerFlagFounder.findCheckPointEntity();
        this.room.send("updatePosition", {
            x: foundCheckPoint.getPosition().x,
            y: foundCheckPoint.getPosition().y,
            z: foundCheckPoint.getPosition().z,
            rotationX: this.player.getRotation().x,
            rotationY: this.player.getRotation().y,
            rotationZ: this.player.getRotation().z,
            rotationW: this.player.getRotation().w,
        });
    }
    //this.entity.getLocalRotation
};

CoNetworkManager.prototype.sendPacket = function (packetName, message) {
    if (this.room != null) {
        this.room.send(packetName, message);
    }
    console.log(this.player.parent.script);
    this.player.parent.script.coPlayer.playerText.element.text = this.userName;
};

CoNetworkManager.prototype.copiedRoomId = function () {
    if (this.room != null)
        PokiSDK.shareableURL({ room: this.room.roomId + "1" }).then(url => {
            const roomID = this.room.roomId;
            console.log(url);

            const roomLink = url;
            this.app.fire("onGetRoomIDAndRoomLink", roomLink, roomID);
        });
}

