import {
  ApiHelper,
  DataManager,
  RemoteData,
  ResourceModel,
  Query,
  StateHelper,
} from "@/Core";
import { Type } from "@/Core/Language/RemoteData";

export class ResourcesDataManager
  implements DataManager<RemoteData.Type<string, ResourceModel[]>> {
  constructor(
    private readonly apiHelper: ApiHelper<Query.ResourcesQuery>,
    private readonly stateHelper: StateHelper<string, ResourceModel[]>
  ) {}

  initialize(id: string): void {
    const value = this.stateHelper.getOnce(id);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(id, RemoteData.loading());
    }
  }

  async update(query: Query.ResourcesQuery): Promise<void> {
    this.stateHelper.set(
      query.qualifier.id,
      RemoteData.fromEither(await this.apiHelper.getData(query))
    );
  }

  get(id: string): Type<string, ResourceModel[]> {
    return this.stateHelper.getHooked(id);
  }
}
