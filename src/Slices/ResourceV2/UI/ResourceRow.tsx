import { Status } from "@/Core/Domain/Resource/Resource";

export interface ResourceRow {
  id: string;
  type: string;
  agent: string;
  value: string;
  dependeciesNbr: number;
  deployState: Status;
}
