import { Action, action } from "easy-peasy";
import { RemoteData } from "@/Core";
import { CompileDetails } from "@S/CompileDetails/Core/Domain";

/**
 * The Compile Details Slice stores the details of compiles, by compile id.
 */
export interface CompileDetailsSlice {
  byId: Record<string, RemoteData.Type<string, CompileDetails>>;
  setData: Action<
    CompileDetailsSlice,
    { id: string; value: RemoteData.Type<string, CompileDetails> }
  >;
}

export const compileDetailsSlice: CompileDetailsSlice = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.value;
  }),
};
