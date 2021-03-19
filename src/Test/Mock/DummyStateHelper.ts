import { Query, RemoteData, StateHelper } from "@/Core";

type Data<K extends Query.Kind> = RemoteData.Type<string, Query.Data<K>>;
type ApiData<K extends Query.Kind> = RemoteData.Type<
  string,
  Query.ApiResponse<K>
>;

export class DummyStateHelper<K extends Query.Kind> implements StateHelper<K> {
  private state = {};

  set(qualifier: Query.Qualifier<K>, value: ApiData<K>): void {
    this.state[getKey(qualifier)] = value;
  }

  getHooked(qualifier: Query.Qualifier<K>): Data<K> {
    return this.state[getKey(qualifier)];
  }

  getOnce(qualifier: Query.Qualifier<K>): Data<K> {
    return this.state[getKey(qualifier)];
  }
}

function getKey(qualifier: Query.Qualifier<Query.Kind>): string {
  return JSON.stringify(qualifier);
}
