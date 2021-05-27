import { Query, RemoteData, StateHelper } from "@/Core";

type Data<K extends Query.Kind> = RemoteData.Type<string, Query.Data<K>>;
type ApiData<K extends Query.Kind> = RemoteData.Type<
  string,
  Query.ApiResponse<K>
>;

export class DummyStateHelper<K extends Query.Kind> implements StateHelper<K> {
  private state = {};

  set(value: ApiData<K>, query: Query.SubQuery<K>): void {
    this.state[getKey(query)] = value;
  }

  getHooked(query: Query.SubQuery<K>): Data<K> {
    return this.state[getKey(query)];
  }

  getOnce(query: Query.SubQuery<K>): Data<K> {
    return this.state[getKey(query)];
  }
}

function getKey(query: Query.SubQuery<Query.Kind>): string {
  return JSON.stringify(query);
}
