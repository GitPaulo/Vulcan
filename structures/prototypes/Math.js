const _ = module.exports;

_.roundDP = (value, decimals) => Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);

_.randomRange = (min, max) => Math.random() * (max - min) + min;

_.simpleUUID = () => ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c) => {
        let r = Math.random() * 16 | 0;
        let v = (c === 'x') ? r : (r & 0x3 | 0x8);

        return v.toString(16);
    })
);
