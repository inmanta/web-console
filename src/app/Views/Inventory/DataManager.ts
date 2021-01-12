import { Either } from "@app/Core";
import { IServiceInstanceModel } from "@app/Models/LsmModels";

export interface DataManager {
  getInstancesForService(
    serviceName: string
  ): Promise<Either.Type<string, IServiceInstanceModel>>;
}
