import { Query } from "@/Core";

type Query = Pick<Query.SubQuery<"GetResourceDetails">, "id">;

export const getUrl = ({ id }: Query) => `/api/v2/resource/${id}`;
