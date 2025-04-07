/**
 * Add json serialisation support for bigints
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
 *
 * @NOTE This module needs to be imported somewhere
 * for this extension to take effect.
 */
BigInt.prototype["toJSON"] = function () {
  return this.toString();
};
