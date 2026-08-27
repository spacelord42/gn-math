/*CoTakeSkillScreen script that handles taking rewarded skill screen panel controls by Burak Ersin - emolingo games */
var CoTakeSkillScreen = pc.createScript('coTakeSkillScreen');
CoTakeSkillScreen.attributes.add('buyButton', { type: 'entity' });
CoTakeSkillScreen.attributes.add('quitButton', { type: 'entity' });
CoTakeSkillScreen.attributes.add('skillID', { type: 'number' });

CoTakeSkillScreen.prototype.initialize = function () {
    this.buyButton.button.on('click', function (event) {

        PokiSDK.rewardedBreak({
            size: "small",
            onStart: () => {
                this.app.systems.sound.volume = 0;
            }
        }).then((success) => {
            this.app.systems.sound.volume = 1;
            if (success) {
                this.app.fire("openSound:rewarded");
                gameanalytics.GameAnalytics.addAdEvent(
                    gameanalytics.EGAAdAction.Clicked,
                    gameanalytics.EGAAdType.RewardedVideo,
                    "poki",
                    "carObby"
                );
                if (this.skillID == 0) {
                    this.app.fire("skill:getNitro");
                } else if (this.skillID == 1) {
                    this.app.fire("skill:getTotem");
                }

                this.app.fire('WarningTextController:setWarning', "Reward received!", 5, new pc.Color(0, 1, 0, 1));
                this.app.fire("coUiManager:openGameScreen");
            } else {

            }
        });
    }, this);

    this.quitButton.button.on('click', function (event) {
        this.app.fire("coUiManager:openGameScreen");
    }, this);
};