import { DataManager, RemoteData, ResourceModel } from "@/Core";

export class DummyDataManager implements DataManager {
  useSubscription(): void {
    throw new Error("DummyDataManager useSubscription mocked");
  }
  useData(): RemoteData.Type<string, ResourceModel[]> {
    throw new Error("DummyDataManager useData mocked");
  }
}
