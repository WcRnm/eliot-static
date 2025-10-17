class Logger {
    log(msg, color) {
        color = color || "black";
        let bgc = "White";
        switch (color) {
            case "success":  color = "Green";      bgc = "LimeGreen";       break;
            case "info":     color = "DodgerBlue"; bgc = "White";           break;
            case "error":    color = "Red";        bgc = "Black";           break;
            case "start":    color = "OliveDrab";  bgc = "PaleGreen";       break;
            case "warning":  color = "Tomato";     bgc = "Black";           break;
            case "end":      color = "Orchid";     bgc = "MediumVioletRed"; break;
            default: color = color;
        }

        if (typeof msg == "object") {
            console.log(msg);
        } else if (typeof color == "object") {
            console.log("%c" + msg, "color: PowderBlue;font-weight:bold; background-color: RoyalBlue;");
            console.log(color);
        } else {
            console.log("%c" + msg, "color:" + color + ";font-weight:bold; background-color: " + bgc + ";");
        }
    }

    debug(msg) {
        this.log(msg,);
    }
    info(msg) {
        this.log(msg, 'info');
    }
    warn(msg) {
        this.log(msg, 'warning');
    }
    error(msg) {
        this.log(msg, 'error');
    }
    success(msg) {
        this.log(msg, 'success');
    }
}