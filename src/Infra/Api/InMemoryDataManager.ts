import { Either, InventoryResponse } from "@/Core";
import { response } from "@/Fixtures";
import { DataManager } from "./DataManager";

export class InMemoryDataManager implements DataManager {
  async getInstancesForService(
    serviceName: string
  ): Promise<Either.Type<string, InventoryResponse>> {
    serviceName;
    return Promise.resolve(Either.right(response));
  }
}
