import {
  ApiHelper,
  EntityManager,
  RemoteData,
  ResourceModel,
  ResourcesQuery,
  StateHelper,
} from "@/Core";
import { Type } from "@/Core/Language/RemoteData";

export class ResourcesEntityManager
  implements EntityManager<RemoteData.Type<string, ResourceModel[]>> {
  constructor(
    private readonly apiHelper: ApiHelper<ResourcesQuery>,
    private readonly stateHelper: StateHelper<string, ResourceModel[]>
  ) {}

  initialize(id: string): void {
    const value = this.stateHelper.get(id);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(id, RemoteData.loading());
    }
  }

  async update(query: ResourcesQuery): Promise<void> {
    this.stateHelper.set(
      query.qualifier.id,
      RemoteData.fromEither(await this.apiHelper.getData(query))
    );
  }

  get(id: string): Type<string, ResourceModel[]> {
    return this.stateHelper.getViaHook(id);
  }
}
