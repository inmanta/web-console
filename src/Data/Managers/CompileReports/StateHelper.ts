import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"CompileReports">,
  Query.Data<"CompileReports">
>;
type ApiData = RemoteData.Type<
  Query.Error<"CompileReports">,
  Query.ApiResponse<"CompileReports">
>;

export class CompileReportsStateHelper
  implements StateHelper<"CompileReports">
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
