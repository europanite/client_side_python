const dummy = new Proxy({}, { get: () => undefined });
module.exports = {
  ...dummy,
  registerRootComponent: () => {},
  installExpoGlobals: () => {},
  default: dummy,
};
