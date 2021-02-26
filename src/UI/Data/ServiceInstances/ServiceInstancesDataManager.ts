import {
  DataManager,
  RemoteData,
  ServiceInstanceModelWithTargetStates,
  Query,
  StateHelper,
  Fetcher,
} from "@/Core";
import { Type } from "@/Core/Language/RemoteData";

export class ServiceInstancesDataManager
  implements DataManager<"ServiceInstances"> {
  constructor(
    private readonly fetcher: Fetcher<"ServiceInstances">,
    private readonly stateHelper: StateHelper<"ServiceInstances">
  ) {}

  initialize(qualifier: Query.Qualifier<"ServiceInstances">): void {
    const value = this.stateHelper.getOnce(qualifier);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(qualifier, RemoteData.loading());
    }
  }

  async update(qualifier: Query.Qualifier<"ServiceInstances">): Promise<void> {
    this.stateHelper.set(
      qualifier,
      RemoteData.fromEither(await this.fetcher.getData(qualifier))
    );
  }

  get(
    qualifier: Query.Qualifier<"ServiceInstances">
  ): Type<string, ServiceInstanceModelWithTargetStates[]> {
    return this.stateHelper.getHooked(qualifier);
  }
}
