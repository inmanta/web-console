import { Query } from "@/Core";

type Query = Query.SubQuery<"GetVersionedResourceDetails">;

export const getUrl = ({ id, version }: Query) =>
  `/api/v2/desiredstate/${version}/resource/${id}`;
