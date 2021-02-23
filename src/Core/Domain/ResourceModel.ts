export interface ResourceModel {
  resource_id: string;
  resource_state: string;
}

export interface ResourceModelWithInstance extends ResourceModel {
  instanceId: string;
}
