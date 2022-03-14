export function urlEncodeParams<Q>(query: Q) {
  const encodedQuery = Object.fromEntries(
    Object.entries(query).map(([key, value]) => {
      const encodedValue =
        typeof value === "string" ? encodeURIComponent(value) : value;
      return [key, encodedValue];
    })
  );
  return encodedQuery as Q;
}
