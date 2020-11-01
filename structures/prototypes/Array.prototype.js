const proto = Array.prototype;

global.extend(proto, 'union', function (array) {
  return [...new Set([...this, ...array])];
});

global.extend(proto, 'difference', function (array) {
  return this.filter(i => array.indexOf(i) < 0);
});

global.extend(proto, 'intersection', function (array) {
  return this.filter(x => array.includes(x));
});

global.extend(proto, 'shuffle', function () {
  this.sort(() => Math.random() - 0.5);
});

global.extend(proto, 'asyncForEach', async function (callback, parallelise = false) {
  if (parallelise) {
    let promises = [];

    for (let index = 0; index < this.length; index++) {
      promises.push(callback(this[index], index, this));
    }

    await Promise.all(promises);
  } else {
    for (let index = 0; index < this.length; index++) {
      await callback(this[index], index, this);
    }
  }
});

global.extend(proto, 'random', function () {
  return this[Math.floor(Math.random() * this.length)];
});

global.extend(proto, 'subsetOf', function (array) {
  return this.every(val => array.includes(val));
});
