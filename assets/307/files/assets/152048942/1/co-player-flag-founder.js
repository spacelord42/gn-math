/*CoPlayerFlagFounder script finds flags by name by Burak Ersin - emolingo games */
var CoPlayerFlagFounder = pc.createScript('coPlayerFlagFounder');

CoPlayerFlagFounder.prototype.findCheckPointEntity = function () {
    let lastStageID = Number.parseInt(CoSaveSystem.getItem("CAROBBY_stage")) - 1;
    const checkPointEntity = this.app.root.findByName("Flag " + lastStageID.toString());
    return checkPointEntity;
};