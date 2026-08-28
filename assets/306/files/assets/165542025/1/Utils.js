var Utils = {
    version : 'v7',
    dataVersion : 'v-10.1',
    gameName : 'shipo',
    shortName : 'shipo',
    parseFloat : function(number){
        return parseFloat(parseFloat(number).toFixed(1)) * 5;  
    },
	lookAt : function(x0, y0, x1, y1){
		return Math.atan2(x1 - x0, y1 - y0);
	},
    generateUUID : function(){
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
    },
    generateUserId : function(){
        const randomValues = new Uint8Array(16);
        crypto.getRandomValues(randomValues);

        const hashArray = Array.from(randomValues).map(byte => byte.toString(16).padStart(2, '0'));
        const hash = hashArray.join('').substr(0, 32);

        return hash;
    },
    waitForChanges : function(callback){
        setTimeout(function(){
            if(callback){
                callback();
            }
        }, 60);
    },
    distance : function(x1, y1, x2, y2){
        return Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );  
    },
	toDeg : function(angle){
		return angle * (180 / Math.PI);
	},
	toRad : function(angle){
		return angle * (Math.PI / 180);
	},
	lerp : function(start, end, amt){
		var value = (1-amt)*start+amt*end;

		if(!isNaN(value)){
			if(Math.abs(value - start) > 50){
				return end;
			}else{
				return value;
			}
		}else{
			return 0;
		}
	},
	rotate : function( a0,a1,t){
        return a0 + this.shortAngleDist(a0,a1)*t;
    },
    shortAngleDist : function(a0,a1) {
        var max = Math.PI*2;
        var da = (a1 - a0) % max;
        return 2*da % max - da;
    },
    float : function(number){
    	if(!isNaN(number)){
    		return number.toFixed(3);
    	}else{
    		return 0;
    	}
    },
    mmss : function($seconds){
        var seconds = $seconds;
        var ms = Math.floor((seconds*1000) % 1000);
        var s = Math.floor(seconds%60);
        var m = Math.floor((seconds*1000/(1000*60))%60);
        var strFormat = "MM:SS";

        if(s < 10) s = "0" + s;
        if(m < 10) m = "0" + m;
        if(ms < 100) ms = "0" + ms;

        strFormat = strFormat.replace(/MM/, m);
        strFormat = strFormat.replace(/SS/, s);

        if($seconds >= 0){
            return strFormat;   
        }else{
            return '00:00';
        }
    },
    pad : function(data, length){
        return ('000' + data).slice(-3);
    },
    isLocalStorageSupported : function(){
        var isSupported = false;
        var mod = 'localStorageSupportTest';
        
        try{
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            
            isSupported = true;
        }catch(e){
            isSupported = false;
        }
        
        return isSupported;
    },
    getColor : function(colorHex){
        var color = new pc.Color();
        color.fromString(colorHex);

        return color;
    },
    setItem : function(key, value){
        key = key + '_' + this.version;

        if(this.isLocalStorageSupported()){
            window.localStorage.setItem(key, value);
        }else{
            this.createCookie(key, value);
        }
    },
    setItemAsArray : function(key, value){
        key = key + '_' + this.version;

        if(this.isLocalStorageSupported()){
            window.localStorage.setItem(key, JSON.stringify(value));
        }else{
            this.createCookie(key, JSON.stringify(value));
        }
    },
    getItem : function(key){
        key = key + '_' + this.version;

        if(this.isLocalStorageSupported()){
            return window.localStorage.getItem(key);
        }else{
            return this.readCookie(key);
        }
    },
    getItemAsNumber : function(key, defaultValue){
        if(this.getItem(key)){
            return parseInt(this.getItem(key));
        }else{
            if(defaultValue){
                return defaultValue;
            }else{
                return 0;
            }
        }
    },
    getItemAsFloat : function(key, defaultValue){
        if(this.getItem(key)){
            return parseFloat(this.getItem(key));
        }else{
            if(defaultValue > -1){
                return defaultValue;
            }else{
                return 0;
            }
        }
    },
    getItemAsArray : function(key){
        if(this.getItem(key)){
            return JSON.parse(this.getItem(key));
        }else{
            return [];
        }
    },
    getItemAsBoolean : function(key){
        if(this.getItem(key)){
            return true;
        }else{
            return false;
        }
    },
    deleteItem : function(key){
        key = key + '_' + this.version;

        if(this.isLocalStorageSupported()){
            window.localStorage.removeItem(key);
        }else{
            this.createCookie(key, '');
        }
    },
    setOnce : function(key){
        if(Utils.getItem(key)){
            return false;
        }else{
            Utils.setItem(key, 'Completed');
            return true;
        }
    },
    getItemAsString : function(_key, value){
        var key = _key + '_' + this.version;

        var alreadyExist = Utils.getItem(_key);

        if(alreadyExist){
            return alreadyExist;
        }

        if(this.isLocalStorageSupported()){
            window.localStorage.setItem(key, value);
        }else{
            this.createCookie(key, value);
        }

        return value;
    },
    createCookie : function(name,value,days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
    },
    readCookie : function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    },
    shuffle : function(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    },
    getRandom : function(array){
        return array[Math.floor(array.length * Math.random())];
    },
    isMobileRegex : function(){
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    },
    isMobile : function(){
        return this.isMobileRegex() || this.isIOS();
    },
    isIOS : function(){
        if (/iPad|iPhone|iPod/.test(navigator.platform)) {
            return true;
        } else {
            return navigator.maxTouchPoints &&
            navigator.maxTouchPoints > 2 &&
            /MacIntel/.test(navigator.platform);
        }
    },
    number : function(value, _default){
        if(value){
            return parseInt(value);
        }else{
            return _default;
        }
    },
    getURLParams : function( name, url ) {
        if (!url) url = location.href;
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( url );
        return results == null ? null : results[1];
    },
    getURLParam : function(param){
        var pageURL = window.location.search.substring(1);
        var URLVariables = pageURL.split('&');
        for (var i = 0; i < URLVariables.length; i++) 
        {
            var parameterName = URLVariables[i].split('=');
            if (parameterName[0] == param) 
            {
                return parameterName[1];
            }
        }
    }
};

Utils.returningUser = (Utils.getItem('TutorialIndex') ? 'existing_user' : 'new_user') + '';

Utils.gameName = Utils.gameName + '_' + (Utils.isMobile() ? 'mobile' : 'desktop') + '_' + Utils.returningUser;

//set first login
if(!Utils.getItem('FirstLogin')){
    Utils.setItem('FirstLogin', Date.now());
}

Utils.prefixCDN = 'https://data.onrushstats.com/';
Utils.service = function(URL, data, success){
    var params = typeof data == 'string' ? data : Object.keys(data).map(
        function(k){ 
            return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]);
        }
    ).join('&');

    var self = this;
    var xhr  = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', Utils.prefixCDN + URL);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) {
            success(JSON.parse(xhr.responseText)); 
        }
    };
    //xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    //xhr.withCredentials = true;

    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
};

Utils.checkpointsArray = Utils.getItemAsArray('Checkpoints');
Utils.logCheckpoint = function(checkpoint) {
    if(Utils.checkpointsArray.indexOf(checkpoint) > -1){
        return false;
    }

    console.log('[EVENT]', checkpoint);

    if(typeof PokiSDK !== 'undefined'){
        PokiSDK.customEvent('game', 'segment', { label: 'level', value: checkpoint + '' });
    }

    Utils.service('?request=save_data', {
        game_name : Utils.gameName,
        checkpoint : checkpoint
    }, function(data){
        //console.log(data);
    });

    if(typeof GameAnalytics !== 'undefined'){
        GameAnalytics("addProgressionEvent", "Complete", checkpoint);
    }

    Utils.checkpointsArray.push(checkpoint);
    Utils.setItem('Checkpoints', JSON.stringify(Utils.checkpointsArray));
};

Utils.logError = function(error_stack) {
    Utils.service('?request=save_error', {
        game_name : Utils.shortName,
        error_stack : error_stack,
        is_mobile : Utils.isMobile() ? 'true' : false
    }, function(data){
        //console.log(data);
    });
};

Utils.eventStart = Date.now();

Utils.getBrowser = function(){
    var userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("chrome")) {
        return "Chrome";
    } else if (userAgent.includes("firefox")) {
        return "Firefox";
    } else if (userAgent.includes("safari")) {
        return "Safari";
    } else if (userAgent.includes("edge")) {
        return "Edge";
    } else if (userAgent.includes("opera") || userAgent.includes("opr")) {
        return "Opera";
    } else {
        return "Unknown";
    }
};

Utils.addEvent = function(event_name) {
    Utils.service('?request=add_event', {
        game_name : Utils.shortName,
        event_name : event_name
    }, function(data){
        //console.log(data);
    });
};

Utils.addAdsEvent = function() {
    Utils.service('?request=add_ads_count', {
        game_name : Utils.shortName,
        version : Utils.dataVersion
    }, function(data){
        //console.log(data);
    });
};

Utils.addTimeBasedEvent = function(event_name) {
    var time = Date.now() - Utils.eventStart;
    Utils.service('?request=add_time_based_event', {
        game_name : Utils.shortName,
        event_name : event_name,
        time : time
    }, function(data){
        //console.log(data);
    });
};

Utils.addC2PEvent = function(event_name) {
    Utils.service('?request=add_c2p_event', {
        game_name : Utils.shortName,
        event_name : event_name,
        browser : Utils.getBrowser(),
        mobile : Utils.isMobile(),
        time : (Date.now() - Utils.eventStart) / 1000
    }, function(data){
        //console.log(data);
    });
};

Utils.pageStartTime = Date.now();

//this increases player count
Utils.service('?request=start_timer', {
    game_name : Utils.shortName,
    version : Utils.dataVersion
}, function(data){
    
});

setInterval(function(){
    var time = Date.now() - Utils.pageStartTime;

    Utils.service('?request=save_timer', {
        game_name : Utils.shortName,
        version : Utils.dataVersion,
        time : parseInt(time / 1000)
    }, function(data){
        
    });

    Utils.pageStartTime = Date.now();
}, 1000 * 30);