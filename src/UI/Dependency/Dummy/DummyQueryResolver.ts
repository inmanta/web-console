import { Query, RemoteData, QueryResolver } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<Query.Kind>,
  Query.UsedData<Query.Kind>
>;

export class DummyQueryResolver implements QueryResolver {
  useReadOnly(): Data {
    throw new Error("Method not implemented.");
  }
  useOneTime(): [Data, () => void] {
    throw new Error("Method not implemented.");
  }

  useContinuous(): [Data, () => void] {
    throw new Error("Method not implemented.");
  }

  pauseAllContinuousManagers(): void {
    throw new Error("Method not implemented.");
  }

  resumeAllContinuousManagers(): void {
    throw new Error("Method not implemented.");
  }
}
