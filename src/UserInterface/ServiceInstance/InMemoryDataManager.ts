import { Either } from "@app/Core";
import { response } from "@app/fixtures";
import { DataManager } from "./DataManager";
import { Response } from "./Response";

export class InMemoryDataManager implements DataManager {
  async getInstancesForService(
    serviceName: string
  ): Promise<Either.Type<string, Response>> {
    serviceName;
    return Promise.resolve(Either.right(response));
  }
}
