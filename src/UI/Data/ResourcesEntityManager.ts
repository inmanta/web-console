import {
  ApiHelper,
  EntityManager,
  RemoteData,
  ResourceModel,
  ResourcesSubject,
  StateHelper,
} from "@/Core";
import { Type } from "@/Core/Language/RemoteData";

export class ResourcesEntityManager
  implements EntityManager<string, ResourceModel[]> {
  constructor(
    private readonly apiHelper: ApiHelper<
      ResourcesSubject,
      string,
      ResourceModel[]
    >,
    private readonly stateHelper: StateHelper<string, ResourceModel[]>
  ) {}

  initialize(id: string): void {
    const value = this.stateHelper.get(id);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(id, RemoteData.loading());
    }
  }

  async update(subject: ResourcesSubject): Promise<void> {
    this.stateHelper.set(
      subject.query.id,
      RemoteData.fromEither(await this.apiHelper.getData(subject))
    );
  }

  get(id: string): Type<string, ResourceModel[]> {
    return this.stateHelper.getViaHook(id);
  }
}
