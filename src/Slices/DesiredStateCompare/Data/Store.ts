import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetDesiredStateDiff">,
  Query.Data<"GetDesiredStateDiff">
>;

export interface DesiredStateDiffSlice {
  listByEnv: Record<string, Data>;
  setList: Action<
    DesiredStateDiffSlice,
    {
      environment: string;
      data: Data;
    }
  >;
}

export const desiredStateDiffSlice: DesiredStateDiffSlice = {
  listByEnv: {},
  setList: action(({ listByEnv }, { environment, data }) => {
    listByEnv[environment] = data;
  }),
};
