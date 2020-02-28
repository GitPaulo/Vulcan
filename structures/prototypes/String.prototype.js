const proto = String.prototype;

global.extend(proto, 'toHHMMSS', function () {
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
});

global.extend(proto, 'replaceAll', function (search, replacement) {
    let target = this;

    return target.split(search).join(replacement);
});

global.extend(proto, 'regexEscape', function (exceptions) {
    let regexString = '[.*+?^${}()|[\\]\\\\]';

    exceptions.forEach((exclude) => {
        // Little hack to deal with backslash escaping (shared by regex and strings)
        if (exclude === '\\') {
            exclude = '\\\\\\\\';
        }

        regexString = regexString.replaceAll(exclude, '');
    });

    return this.replace(new RegExp(regexString, 'g'), '\\$&'); // $& means the whole matched string
});

global.extend(proto, 'isIdentile', function () {
    const letters = this.split('');
    const unique  = new Set(letters);

    return (unique.size === 1) ? true : false;
});

global.extend(proto, 'nthOccurrenceOf', function (pat, n) {
    let L = this.length;
    let i = -1;

    while (n-- && i++ < L) {
        i = this.indexOf(pat, i);

        if (i < 0) {
            break;
        }
    }

    return i;
});

global.extend(proto, 'hasUpperCase', function () {
    return (/[A-Z]/.test(this));
});

global.extend(proto, 'hasLowerCase', function () {
    return (/[a-z]/.test(this));
});
