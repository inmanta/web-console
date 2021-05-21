import {
  QueryManager,
  DataProvider,
  ManagerResolver,
  Query,
  RemoteData,
} from "@/Core";

type Data = RemoteData.Type<
  Query.Error<Query.Kind>,
  Query.UsedData<Query.Kind>
>;

export class DummyDataProvider implements DataProvider {
  getManagerResolver(): ManagerResolver<QueryManager> {
    throw new Error("Method not implemented.");
  }
  useOneTime(): [Data, () => void] {
    throw new Error("Method not implemented.");
  }

  useContinuous(): [Data, () => void] {
    throw new Error("Method not implemented.");
  }
}
