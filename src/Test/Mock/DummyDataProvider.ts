import { DataProvider, RemoteData, ResourceModel } from "@/Core";

export class DummyDataProvider implements DataProvider {
  useSubscription(): void {
    throw new Error("DummyDataManager.useSubscription mocked");
  }
  useData(): RemoteData.Type<string, ResourceModel[]> {
    throw new Error("DummyDataManager.useData mocked");
  }
  trigger(): void {
    throw new Error("DummyDataManager.trigger mocked");
  }
}
