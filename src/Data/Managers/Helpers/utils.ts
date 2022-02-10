import { Query } from "@/Core";

export function urlEncodeParams<Kind extends Query.Kind>(
  query: Query.SubQuery<Kind>
) {
  const encodedQuery = Object.fromEntries(
    Object.entries(query).map(([key, value]) => {
      const encodedValue =
        typeof value === "string" ? encodeURIComponent(value) : value;
      return [key, encodedValue];
    })
  );
  return encodedQuery as Query.SubQuery<Kind>;
}
