/**
 * Add json serialisation support for bigints
 *
 * @NOTE This module needs to be imported somewhere
 * for this extension to take effect.
 */
BigInt.prototype["toJSON"] = function () {
  return this.toString();
};
