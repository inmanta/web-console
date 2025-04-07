import { Action, action } from "easy-peasy";
import { Query, RemoteData } from "@/Core";

export interface ServerStatusSlice {
  status: RemoteData.Type<
    Query.Error<"GetServerStatus">,
    Query.Data<"GetServerStatus">
  >;
  setData: Action<
    ServerStatusSlice,
    RemoteData.Type<
      Query.Error<"GetServerStatus">,
      Query.Data<"GetServerStatus">
    >
  >;
}

export const serverStatusSlice: ServerStatusSlice = {
  status: RemoteData.notAsked(),
  setData: action((state, data) => {
    state.status = data;
  }),
};
