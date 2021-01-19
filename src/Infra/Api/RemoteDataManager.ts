import { InventoryResponse, Either } from "@/Core";
import { DataManager } from "./DataManager";

/**
 * The RemoteDataManager is responsible for fetching data
 * based on a single action. So each different method and
 * entity within the REST api should have a separate
 * function in this class.
 *
 * This DataManager is not being used yet!
 */
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
