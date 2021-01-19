import { IServiceInstanceModel } from "@app/Models/LsmModels";

export type ServiceInstance = IServiceInstanceModel;

export interface InventoryResponse {
  data: ServiceInstance[];
}
