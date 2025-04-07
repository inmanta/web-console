import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetParameters">,
  Query.Data<"GetParameters">
>;

export interface ParametersSlice {
  listByEnv: Record<string, Data>;
  setList: Action<
    ParametersSlice,
    {
      environment: string;
      data: Data;
    }
  >;
}

export const parametersSlice: ParametersSlice = {
  listByEnv: {},
  setList: action(({ listByEnv }, { environment, data }) => {
    listByEnv[environment] = data;
  }),
};
