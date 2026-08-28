/*PokiSdkManager script that handles PokiSDK gameplay events by Emre Şahin - emolingo games */
var PokiSdkManager = pc.createScript('pokiSdkManager');

PokiSdkManager.prototype.initialize = function () {
    this.app.pokiGamePlayStart = false
    this.app.on("SdkGamePlay", this.sdk, this)
    this.on("destroy", () => {
        this.app.off("SdkGamePlay", this.sdk, this)
    }, this)
};

PokiSdkManager.prototype.sdk = function (value) {
    if (this.app.pokiGamePlayStart !== value) {
        if (this.app.pokiGamePlayStart) {
            this.app.pokiGamePlayStart = false
            PokiSDK.gameplayStop();
        }
        else {
            this.app.pokiGamePlayStart = true
            PokiSDK.gameplayStart();
        }
    }
};