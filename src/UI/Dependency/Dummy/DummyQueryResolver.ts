import { Query, RemoteData, QueryResolver } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<Query.Kind>,
  Query.UsedData<Query.Kind>
>;

export class DummyQueryResolver implements QueryResolver {
  useOneTime(): [Data, () => void] {
    throw new Error("Method not implemented.");
  }

  useContinuous(): [Data, () => void] {
    throw new Error("Method not implemented.");
  }
}
