const _ = module.exports;

_.toHHMMSS = function () {
    let sec     = parseInt(this, 10); // Don't forget the second param
    let hours   = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = '0' + hours;
    }

    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    if (seconds < 10) {
        seconds = '0' + seconds;
    }

    let time = hours + ':' + minutes + ':' + seconds;

    return time;
};

_.replaceAll = function (search, replacement) {
    let target = this;
    return target.split(search).join(replacement);
};
