import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetVersionedResourceDetails">,
  Query.Data<"GetVersionedResourceDetails">
>;

export interface VersionedResourceDetailsSlice {
  listByResource: Record<string, Data>;
  setList: Action<
    VersionedResourceDetailsSlice,
    {
      resourceId: string;
      data: Data;
    }
  >;
}

export const versionedResourceDetailsSlice: VersionedResourceDetailsSlice = {
  listByResource: {},
  setList: action(({ listByResource }, { resourceId, data }) => {
    listByResource[resourceId] = data;
  }),
};
