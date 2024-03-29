import { Resource } from "@/Core/Domain/Resource";

export interface InstanceResourceModel {
  resource_id: string;
  resource_state: Resource.Status;
}

export interface InstanceResourceModelWithInstance
  extends InstanceResourceModel {
  instanceId: string;
}
