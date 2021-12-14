import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetDesiredStates">,
  Query.Data<"GetDesiredStates">
>;

export interface DesiredStatesSlice {
  listByEnv: Record<string, Data>;
  setList: Action<
    DesiredStatesSlice,
    {
      environment: string;
      data: Data;
    }
  >;
}

export const desiredStatesSlice: DesiredStatesSlice = {
  listByEnv: {},
  setList: action(({ listByEnv }, { environment, data }) => {
    listByEnv[environment] = data;
  }),
};
