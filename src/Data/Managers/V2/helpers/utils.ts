export function urlEncodeParams<Type extends object>(params: Type) {
  const encodedQuery = Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      const encodedValue = typeof value === "string" ? encodeURIComponent(value) : value;

      return [key, encodedValue];
    })
  );

  return encodedQuery as Type;
}
