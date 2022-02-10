import { Query } from "@/Core";
import { GetUrl, GetUrlWithEnv } from "./types";

function urlEncodeParams<Kind extends Query.Kind>(query: Query.SubQuery<Kind>) {
  const encodedQuery = Object.fromEntries(
    Object.entries(query).map(([key, value]) => {
      const encodedValue =
        typeof value === "string" ? encodeURIComponent(value) : value;
      return [key, encodedValue];
    })
  );
  return encodedQuery as Query.SubQuery<Kind>;
}

export function getEncodedUrlWithEnv<Kind extends Query.Kind>(
  getUrl: GetUrlWithEnv<Kind>,
  query: Query.SubQuery<Kind>,
  environment: string
) {
  const encodedQuery = urlEncodeParams(query);
  return getUrl(encodedQuery, environment);
}

export function getEncodedUrl<Kind extends Query.Kind>(
  getUrl: GetUrl<Kind>,
  query: Query.SubQuery<Kind>
) {
  const encodedQuery = urlEncodeParams(query);
  return getUrl(encodedQuery);
}
