/**
 * countActiveFilters.
 *
 * Counts the number of active filter values in a filter object.
 * Array values contribute their length; any other truthy value counts as one.
 * The disregardDefault flag only marks that the default filter was changed, so it doesn't count.
 *
 * @param {T} filter - The filter object to count active values in.
 * @returns {number} The total number of active filter values.
 */
export const countActiveFilters = <T extends object>(filter: T): number => {
  return Object.entries(filter).reduce((acc, [key, value]) => {
    if (!value || key === "disregardDefault") {
      return acc;
    }
    if (Array.isArray(value)) {
      return acc + value.length;
    }

    return acc + 1;
  }, 0);
};
