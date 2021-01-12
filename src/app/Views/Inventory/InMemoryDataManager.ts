import { Either } from "@app/Core";
import { IServiceInstanceModel } from "@app/Models/LsmModels";
import { serviceInstance } from "@app/fixtures";
import { DataManager } from "./DataManager";

export class InMemoryDataManager implements DataManager {
  async getInstancesForService(): Promise<
    Either.Type<string, IServiceInstanceModel>
  > {
    return Promise.resolve(Either.right(serviceInstance));
  }
}
