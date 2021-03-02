import { DataProvider, Query, RemoteData } from "@/Core";

type Data = RemoteData.Type<Query.Error<Query.Kind>, Query.Data<Query.Kind>>;

export class DummyDataProvider implements DataProvider {
  useContinuous(): [Data, () => void] {
    throw new Error("DummyDataManager.useData mocked");
  }
}
