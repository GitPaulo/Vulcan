Math.roundDP = (value, decimals) => Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);

Math.randomRange = (min, max) => Math.random() * (max - min) + min;

Math.simpleUUID = () => ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c) => {
        let r = Math.random() * 16 | 0;
        let v = (c === 'x') ? r : (r & 0x3 | 0x8);

        return v.toString(16);
    }
));

Math.formatMilliseconds = (ms) => {
    let minutes = Math.floor(ms / 60000);
    let seconds = ((ms % 60000) / 1000).toFixed(0);

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
};
