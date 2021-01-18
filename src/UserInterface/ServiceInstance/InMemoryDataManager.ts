import { Either } from "Core";
import { response } from "Fixtures";
import { DataManager } from "./DataManager";
import { InventoryResponse } from "Core";

export class InMemoryDataManager implements DataManager {
  async getInstancesForService(
    serviceName: string
  ): Promise<Either.Type<string, InventoryResponse>> {
    serviceName;
    return Promise.resolve(Either.right(response));
  }
}
