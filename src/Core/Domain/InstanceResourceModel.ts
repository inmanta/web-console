import { Status } from "@/Core/Domain/Resource/Resource";

export interface InstanceResourceModel {
  resource_id: string;
  resource_state: Status;
}
