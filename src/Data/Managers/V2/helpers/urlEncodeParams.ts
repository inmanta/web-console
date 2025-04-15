/**
 * Encodes the string values of an object using `encodeURIComponent`.
 *
 * This function takes an object as input and returns a new object where all string values
 * are URL-encoded. Non-string values are left unchanged.
 *
 * @param {Type} params - The object containing key-value pairs to be URL-encoded.
 * @returns {Type} A new object with the same keys as the input, but with string values URL-encoded.
 */
export function urlEncodeParams<Type extends object>(params: Type) {
  const encodedQuery = Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      const encodedValue = typeof value === "string" ? encodeURIComponent(value) : value;

      return [key, encodedValue];
    })
  );

  return encodedQuery as Type;
}
