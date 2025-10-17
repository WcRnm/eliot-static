class Logger {
    constructor() {
        this.colorDebug = 'black';
        this.colorInfo = 'DodgerBlue';
        this.colorWarn = 'Tomato';
        this.colorError = 'Red';
        this.colorSucces = 'Green';

        this.startTime = new Date();
    }
    elapsedTime() {
        return new Date() - this.startTime;
    }

    log(msg, color, icon) {
        color = color || "black";
        let bgc = "White";
        switch (color) {
            case "success":  color = "Green";      bgc = "LimeGreen";       break;
            case "info":     color = "DarkBlue";   bgc = "LightBlue";       break;
            case "error":    color = "Red";        bgc = "Black";           break;
            case "start":    color = "OliveDrab";  bgc = "PaleGreen";       break;
            case "warning":  color = "Tomato";     bgc = "Black";           break;
            case "end":      color = "Orchid";     bgc = "MediumVioletRed"; break;
            case 'debug':    color = "DarkGrey";   break
            default: color = color;
        }

        if (typeof msg == "object") {
            console.log(msg);
        } else if (typeof color == "object") {
            console.log("%c" + msg, "color: PowderBlue;font-weight:bold; background-color: RoyalBlue;");
            console.log(color);
        } else {
            if (icon) {
                msg = icon + ' ' + msg;
            }
            console.log("%c[" + this.elapsedTime() + ']' + msg, "color:" + color + "; background-color: " + bgc + ";");
        }
    }

    debug(msg) {
        this.log(msg, 'debug', '🐞' );
    }
    info(msg) {
        this.log(msg, 'info', 'ℹ️');
    }
    warn(msg) {
        this.log(msg, 'warning', '⚠️');
    }
    error(msg) {
        this.log(msg, 'error', '🚨');
    }
    success(msg) {
        this.log(msg, 'success', '✅');
    }
}