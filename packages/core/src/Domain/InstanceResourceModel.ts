import { Status } from "@inmanta/web-console-core/Domain/Resource/Resource";

export interface InstanceResourceModel {
  resource_id: string;
  resource_state: Status;
}
