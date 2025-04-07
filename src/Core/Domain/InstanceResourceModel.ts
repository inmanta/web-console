import { Resource } from '@/Core/Domain/Resource';

export interface InstanceResourceModel {
  resource_id: string;
  resource_state: Resource.Status;
}
