const flow = require('lodash').flow;

// Promise.all() for objects
Object.defineProperty(Promise, 'allKeys', {
  configurable: true,
  writable: true,
  value: async function allKeys(object) {
    const resolved = {};
    const promises = Object
      .entries(object)
      .map(async ([key, promise]) =>
        resolved[key] = await promise
      )
    await Promise.all(promises);
    return resolved;
  }
})

function asyncWrapper(fn) {
  return async args => {
    const asyncArg = await Promise.resolve(args);
    return await fn(asyncArg);
  };
}

function flowAsync (fns) {
  const wrappedFns = fns.map(asyncWrapper);
  return flow(wrappedFns);
}

module.exports = {
  flowAsync,
};