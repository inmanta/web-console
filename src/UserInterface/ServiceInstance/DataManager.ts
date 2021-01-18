import { Either } from "@app/Core";
import { Response } from "./Response";

export interface DataManager {
  getInstancesForService(
    serviceName: string
  ): Promise<Either.Type<string, Response>>;
}
