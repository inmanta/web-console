import { DataManager, RemoteData, ResourceModel, Subject } from "@/Core";

export class DummyDataManager
  implements DataManager<Subject, string, ResourceModel[]> {
  useSubscription(): void {
    throw new Error("DummyDataManager useSubscription mocked");
  }
  useData(): RemoteData.Type<string, ResourceModel[]> {
    throw new Error("DummyDataManager useData mocked");
  }
}
