export interface InstanceResourceModel {
  resource_id: string;
  resource_state: string;
}

export interface InstanceResourceModelWithInstance
  extends InstanceResourceModel {
  instanceId: string;
}
