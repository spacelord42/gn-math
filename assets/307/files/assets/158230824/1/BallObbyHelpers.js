/*BallObby_Utils script that stores data to local storage if supported by Emre Şahin - emolingo games */
var BallObby_Utils = {
    isLocalStorageSupported: function () {
        var isSupported = false;
        if (this.dataStore == null)
            this.dataStore = {};
        try {
            window.localStorage;
            isSupported = true;
        } catch (e) {
            isSupported = false;

        }
        return isSupported;
    },
    setItem: function (key, value) {
        if (this.isLocalStorageSupported()) {
            window.localStorage.setItem(key, value);
        } else {
            this.dataStore[key] = value;
        }
    },
    getItem: function (key) {
        if (this.isLocalStorageSupported()) {
            return window.localStorage.getItem(key);
        } else {
            return this.dataStore[key];
        }
    },
    clear: function () {
        if (this.isLocalStorageSupported()) {
            Object.keys(window.localStorage).forEach(function (key) {
                if (key.includes("BALLOBBY_"))
                    window.localStorage.removeItem(key);
            });
        } else {
            this.dataStore = {};
        }
    }
};
