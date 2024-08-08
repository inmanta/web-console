import { Kind, SubQuery } from "@/Core/Query/Query";

export function urlEncodeParams<Q extends SubQuery<Kind>>(query: Q) {
  const encodedQuery = Object.fromEntries(
    Object.entries(query).map(([key, value]) => {
      const encodedValue =
        typeof value === "string" ? encodeURIComponent(value) : value;
      return [key, encodedValue];
    }),
  );
  return encodedQuery as Q;
}
