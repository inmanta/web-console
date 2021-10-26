import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetCompileReports">,
  Query.Data<"GetCompileReports">
>;

/**
 * The CompileReportsSlice stores Compile Reports.
 */
export interface CompileReportsSlice {
  /**
   * Stores the full list of Compile Reports by their environment.
   */
  listByEnv: Record<string, Data>;
  /**
   * Sets the compile reports in the listByEnv record.
   */
  setList: Action<
    CompileReportsSlice,
    {
      environment: string;
      data: Data;
    }
  >;
}

export const compileReportsSlice: CompileReportsSlice = {
  listByEnv: {},
  setList: action(({ listByEnv }, { environment, data }) => {
    listByEnv[environment] = data;
  }),
};
