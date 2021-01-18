import { Either } from "Core";
import { InventoryResponse } from "Core";

export interface DataManager {
  getInstancesForService(
    serviceName: string
  ): Promise<Either.Type<string, InventoryResponse>>;
}
