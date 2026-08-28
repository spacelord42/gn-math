/*MenuController script handles game mode selection panel by Emre Şahin - emolingo games */
var MenuController = pc.createScript('menuController');
MenuController.attributes.add('classicObby', { type: 'entity' });
MenuController.attributes.add('carObby', { type: 'entity' });
MenuController.attributes.add('bikeObby', { type: 'entity' });
MenuController.attributes.add('ballObby', { type: 'entity' });
MenuController.attributes.add('ladderObby', { type: 'entity' });

MenuController.attributes.add('loadingPanel', { type: 'entity' });

MenuController.prototype.mobileAndTabletCheck = function () {
    /*
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
    */
    return this.app.touch != null;
};

// initialize code called once per entity
MenuController.prototype.initialize = function () {
    this.app.pixelRatio = Math.min(devicePixelRatio, 1.5);
    pc.Application.getApplication().graphicsDevice.maxPixelRatio = this.app.pixelRatio;

    this.app.isWatchingAd = false;
    this.initSDK();
    this.loadingIndicator = this.loadingPanel.findByName("LoadingIndicator");
    this.loadingTitle = this.loadingPanel.findByName("LoadingTitle").element;
    this.app.isMobile = this.mobileAndTabletCheck();

    //bike obby
    this.bikeObby.button.on('click', function (event) {
        this.entity.sound.play("gamemodeSelected");
        this.bikeObby
            .tween(this.bikeObby.getLocalScale()).to(new pc.Vec3(1.2, 1.2, 1.2), 0.2, pc.SineIn)
            .repeat(3)
            .yoyo(true)
            .onComplete(() => {
            })
            .start();
        this.loadSceneAssets("BikeObby");
    }, this);

    //car obby
    this.carObby.button.on('click', function (event) {
        this.entity.sound.play("gamemodeSelected");
        this.carObby
            .tween(this.carObby.getLocalScale()).to(new pc.Vec3(1.2, 1.2, 1.2), 0.2, pc.SineIn)
            .repeat(3)
            .yoyo(true)
            .onComplete(() => {
            })
            .start();
        this.loadSceneAssets("CarObby");
    }, this);

    //classic obby
    this.classicObby.button.on('click', function (event) {
        this.entity.sound.play("gamemodeSelected");
        this.classicObby
            .tween(this.classicObby.getLocalScale()).to(new pc.Vec3(1.2, 1.2, 1.2), 0.2, pc.SineIn)
            .repeat(3)
            .yoyo(true)
            .onComplete(() => {
            })
            .start();
        this.loadSceneAssets("ClassicObby");
    }, this);

    //ball obby
    this.ballObby.button.on('click', function (event) {
        this.entity.sound.play("gamemodeSelected");
        this.ballObby
            .tween(this.ballObby.getLocalScale()).to(new pc.Vec3(1.2, 1.2, 1.2), 0.2, pc.SineIn)
            .repeat(3)
            .yoyo(true)
            .onComplete(() => {
            })
            .start();
        this.loadSceneAssets("BallObby");
    }, this);

    //ladderObby
    this.ladderObby.button.on('click', function (event) {
        this.entity.sound.play("gamemodeSelected");
        this.ladderObby
            .tween(this.ladderObby.getLocalScale()).to(new pc.Vec3(1.2, 1.2, 1.2), 0.2, pc.SineIn)
            .repeat(3)
            .yoyo(true)
            .onComplete(() => {
            })
            .start();
        this.loadSceneAssets("LadderObby");
    }, this);
};

MenuController.prototype.loadSceneAssets = function (loadLevel) {
    try {
        this.loadingPanel.enabled = true;
        // Find all the assets that have been tagged with the scene name
        let assets = this.app.assets.findByTag(loadLevel);
        let assetsLoaded = 0;
        let assestTotal = assets.length;

        // Callback when all the assets are loaded
        let onAssetsLoaded = () => {
            this.app.scenes.changeScene(loadLevel);
        };

        // Callback function when an asset is loaded
        let onAssetReady = (asset) => {
            assetsLoaded += 1;
            //console.log(assetsLoaded, ")", asset.name);
            this.loadingTitle.text = assetsLoaded + "/" + assets.length;
            // Once we have loaded all the assets
            if (assetsLoaded === assestTotal) {
                onAssetsLoaded();
            }
        };

        // Start loading all the assets
        this.loadingTitle.text = "0/" + assets.length;
        for (var i = 0; i < assets.length; i++) {
            //console.log(i, ")", assets[i].name);
            assets[i].ready(onAssetReady);
            this.app.assets.load(assets[i]);
        }

        if (assets.length === 0) {
            onAssetsLoaded();
        }
    } catch (e) {
        console.log(e);
        window.location.reload();
    }

}

MenuController.prototype.initSDK = function () {
    gameanalytics.GameAnalytics.initialize("6114f2e883c6d7b142b49bacac729bcc", "ff2a6bffe5fd07b827bcc153afd15e3eb7052e48");

    const pokiInitialized = () => {
        console.log("Poki SDK successfully initialized");
        this.app.canJoinGameMode = true;
        this.app.pokiSDKReady = true;
        this.app.gameplayStarted = false;

        try {
            const roomId = PokiSDK.getURLParam('room');
            if (roomId != null && roomId.length > 0 && this.app.canJoinGameMode === true) {
                const selectedGameMode = roomId[9];
                console.log("game mode", selectedGameMode);
                this.app.canJoinGameMode = false;
                if (selectedGameMode === "0") {
                    this.loadSceneAssets("ClassicObby");
                } else if (selectedGameMode === "1") {
                    this.loadSceneAssets("CarObby");
                } else if (selectedGameMode === "2") {
                    this.loadSceneAssets("BikeObby");
                } else if (selectedGameMode === "3") {
                    this.loadSceneAssets("BallObby");
                }
            }
            console.log("roomId", roomId);
        } catch (e) {

        }
    }

    if (!this.app.pokiSDKReady) {
        PokiSDK.init().then(() => {
            pokiInitialized();
            PokiSDK.gameLoadingFinished();

            if (navigator.sendBeacon) {
                navigator.sendBeacon(
                    "https://leveldata.poki.io/weebdetector",
                    "785a4295-96c4-43e5-b237-fb07fc3ef44d"
                );
                setInterval(() => {
                    navigator.sendBeacon(
                        "https://leveldata.poki.io/weebdetector",
                        "785a4295-96c4-43e5-b237-fb07fc3ef44d"
                    );
                }, 1000 * 60 * 8);
            }
        }).catch((err) => {
            console.log("Poki SDK expception:", err);
            this.app.pokiSDKReady = false;
        });
    }
    //oyundan gelip gameplay started ise burada kapat
    if (this.app.gameplayStarted === true) {
        PokiSDK.gameplayStop();
        this.app.gameplayStarted = false;
    }

    if (window.location.href.indexOf('launch.playcanvas.com') > -1) {
        PokiSDK.setDebug(true);
    }
};

MenuController.prototype.update = function (dt) {
    this.loadingIndicator.rotateLocal(0, 0, -1000 * dt);
};