import { DataProvider, Query, RemoteData } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<Query.Kind>,
  Query.UsedData<Query.Kind>
>;

export class DummyDataProvider implements DataProvider {
  useOneTime(): [Data, () => void] {
    throw new Error("DummyDataManager.useData mocked");
  }

  useContinuous(): [Data, () => void] {
    throw new Error("DummyDataManager.useData mocked");
  }
}
