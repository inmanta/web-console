import { Either, InventoryResponse } from "@/Core";

export interface DataManager {
  getInstancesForService(
    environmentId: string,
    serviceName: string
  ): Promise<Either.Type<string, InventoryResponse>>;
}
