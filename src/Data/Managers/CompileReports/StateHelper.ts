import { isEqual } from "lodash";
import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetCompileReports">,
  Query.Data<"GetCompileReports">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetCompileReports">,
  Query.ApiResponse<"GetCompileReports">
>;

export class CompileReportsStateHelper
  implements StateHelper<"GetCompileReports">
{
  constructor(
    private readonly store: Store,
    private readonly environment: string
  ) {}

  set(data: ApiData): void {
    const value = RemoteData.mapSuccess((data) => data, data);
    this.store.dispatch.compileReports.setList({
      environment: this.environment,
      data: value,
    });
  }

  getHooked(): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState(
      (state) => this.enforce(state.compileReports.listByEnv[this.environment]),
      isEqual
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(): Data {
    return this.enforce(
      this.store.getState().compileReports.listByEnv[this.environment]
    );
  }
}
