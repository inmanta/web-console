import { RemoteData, ResourceModel, StateHelper } from "@/Core";

type Data = RemoteData.Type<string, ResourceModel[]>;

export class DummyStateHelper implements StateHelper<string, ResourceModel[]> {
  private state = {};

  set(id: string, value: Data): void {
    this.state[id] = value;
  }

  getHooked(id: string): Data {
    return this.state[id];
  }

  getOnce(id: string): Data {
    return this.state[id];
  }
}
