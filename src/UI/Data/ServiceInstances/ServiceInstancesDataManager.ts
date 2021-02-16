import {
  DataManager,
  RemoteData,
  ServiceInstanceModel,
  Query,
  StateHelper,
  Fetcher,
} from "@/Core";
import { Type } from "@/Core/Language/RemoteData";

export class ServiceInstancesDataManager
  implements DataManager<RemoteData.Type<string, ServiceInstanceModel[]>> {
  constructor(
    private readonly fetcher: Fetcher<"ServiceInstances">,
    private readonly stateHelper: StateHelper<string, ServiceInstanceModel[]>
  ) {}

  initialize(id: string): void {
    const value = this.stateHelper.getOnce(id);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(id, RemoteData.loading());
    }
  }

  async update(query: Query.ServiceInstancesQuery): Promise<void> {
    this.stateHelper.set(
      query.qualifier.serviceName,
      RemoteData.fromEither(await this.fetcher.getData(query))
    );
  }

  get(id: string): Type<string, ServiceInstanceModel[]> {
    return this.stateHelper.getHooked(id);
  }
}
