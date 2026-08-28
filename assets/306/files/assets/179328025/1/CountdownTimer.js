var CountdownTimer = pc.createScript('countdownTimer');

// initialize code called once per entity
CountdownTimer.prototype.initialize = function() {
    this.timeRemaining = 0;
    this.lastDisplayedSeconds = Math.ceil(this.timeRemaining);
    this.running = false;
    this.callback = null;

    this.entity.on('CountdownTimer:Start', this.start, this);
};

CountdownTimer.prototype.start = function(time, callback) {
    this.timeRemaining = time;
    this.lastDisplayedSeconds = Math.ceil(this.timeRemaining);
    this.running = true;
    this.callback = callback || null;

    var minutes = Math.floor(this.timeRemaining / 60);
    var seconds = Math.floor(this.timeRemaining % 60);
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    this.entity.element.text = minutes + ":" + seconds;
    this.entity.element.color.fromString('#0E980E');
};

CountdownTimer.prototype.update = function(dt) {
    if (this.running && this.timeRemaining > 0) {
        this.timeRemaining -= dt; // Decrease the remaining time by the delta time
        if (this.timeRemaining < 0) {
            this.timeRemaining = 0; // Ensure the timer does not go below zero
            this.running = false; // Stop the timer when it reaches zero
            // CALBACKS
            if (this.callback) {
                this.callback();
            }
        }

        var totalSeconds = Math.ceil(this.timeRemaining); // Get the remaining whole seconds

        // Only update the display when the number of seconds changes
        if (totalSeconds !== this.lastDisplayedSeconds) {
            this.lastDisplayedSeconds = totalSeconds;

            var minutes = Math.floor(totalSeconds / 60); // Calculate minutes
            var seconds = totalSeconds % 60; // Calculate seconds

            // Format minutes and seconds to always show two digits
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            var formattedTime = minutes + ":" + seconds;

            // Update the UI element with the formatted time
            if (this.timeRemaining > 5) {
                this.entity.element.color.fromString('#0E980E');
            } else if (this.timeRemaining == 5){
                 this.entity.element.color.fromString('#F14214');
            }
            this.entity.element.text = formattedTime;
        }
    }
};
