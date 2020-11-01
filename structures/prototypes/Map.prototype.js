Map.prototype.toString = function () {
  let result = {};

  this.forEach((key, value) => {
    result[key] = value;
  });

  return JSON.stringify(result);
};
