import { Parameter } from "@/Core/Domain/Parameter";

export interface Fact extends Parameter {
  resource_id: string;
}
