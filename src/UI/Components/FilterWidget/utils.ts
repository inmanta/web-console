/**
 * countActiveFilters.
 *
 * Counts the number of active filter values in a filter object.
 * Array values contribute their length; any other truthy value counts as one.
 *
 * @param {T} filter - The filter object to count active values in.
 * @returns {number} The total number of active filter values.
 */
export const countActiveFilters = <T extends object>(filter: T): number => {
  return Object.values(filter).reduce((acc, value) => {
    if (!value) {
      return acc;
    }
    if (Array.isArray(value)) {
      return acc + value.length;
    }

    return acc + 1;
  }, 0);
};
