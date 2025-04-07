import { Query } from "@/Core";

export const getUrl = ({
  id,
  version,
}: Query.SubQuery<"GetVersionedResourceDetails">) =>
  `/api/v2/desiredstate/${version}/resource/${id}`;
