import { IServiceInstanceModel } from "@app/Models/LsmModels";

export interface ServiceInstance extends IServiceInstanceModel {
  created_at: string;
}

export interface InventoryResponse {
  data: ServiceInstance[];
}
