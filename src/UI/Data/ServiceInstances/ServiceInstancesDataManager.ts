import {
  DataManager,
  RemoteData,
  ServiceInstanceModelWithTargetStates,
  Query,
  StateHelper,
  Fetcher,
  ServiceInstanceModel,
} from "@/Core";
import { Type } from "@/Core/Language/RemoteData";

export class ServiceInstancesDataManager
  implements
    DataManager<
      RemoteData.Type<string, ServiceInstanceModelWithTargetStates[]>
    > {
  constructor(
    private readonly fetcher: Fetcher<"ServiceInstances">,
    private readonly stateHelper: StateHelper<
      string,
      ServiceInstanceModelWithTargetStates[],
      ServiceInstanceModel[]
    >
  ) {}

  initialize(id: string): void {
    const value = this.stateHelper.getOnce(id);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(id, RemoteData.loading());
    }
  }

  async update(query: Query.ServiceInstancesQuery): Promise<void> {
    this.stateHelper.set(
      query.qualifier.name,
      RemoteData.fromEither(await this.fetcher.getData(query))
    );
  }

  get(id: string): Type<string, ServiceInstanceModelWithTargetStates[]> {
    return this.stateHelper.getHooked(id);
  }
}
