/*RigidBody extension script that allows to raycastAll using tag by Burak Ersin - emolingo games */
(function(){    
    var _distanceVec3 = new pc.Vec3();
    
    pc.RigidBodyComponentSystem.prototype.raycastFirstByTag = function (start, end, tag) {
        var closestDistanceSqr = Number.MAX_VALUE;
        var closestResult = null;
        
        // Go through all the entities that intersect with the raycast and 
        // find the closest one that matches the tag query passed
        var results = this.app.systems.rigidbody.raycastAll(start, end);
        for (var i = 0; i < results.length; ++i) {
            var result = results[i];
            if (result.entity.tags.has(tag)) {
                _distanceVec3.sub2(result.point, start);
                var distanceSqr = _distanceVec3.lengthSq();
                if (distanceSqr < closestDistanceSqr) {
                    closestDistanceSqr = distanceSqr;
                    closestResult = result;
                }
            }
        }
        
        return closestResult;
    };
})();