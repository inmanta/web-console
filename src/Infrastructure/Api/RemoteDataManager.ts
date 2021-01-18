import { InventoryResponse, Either } from "Core";
import { DataManager } from "./DataManager";

export class RemoteDataManager implements DataManager {
  constructor(private readonly baseUrl: string) {}

  async getInstancesForService(
    environmentId: string,
    serviceName: string
  ): Promise<Either.Type<string, InventoryResponse>> {
    const urlPath = `/lsm/v1/service_inventory/${serviceName}`;

    try {
      const response = await fetch(`${this.baseUrl}${urlPath}`, {
        headers: {
          "X-Inmanta-Tid": environmentId,
        },
      });
      const json = await response.json();
      return Either.right(json);
    } catch (error) {
      return Either.left(error);
    }
  }
}
