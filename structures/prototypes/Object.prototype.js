const proto = Object.prototype;

global.extend(proto, 'methodNames', function () {
  const obj = this;
  let properties = new Set();
  let currentObj = obj;

  do {
    Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
  } while ((currentObj = Object.getPrototypeOf(currentObj)));

  return [...properties.keys()].filter(item => typeof obj[item] === 'function');
});
