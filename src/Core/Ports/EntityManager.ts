import { RemoteData } from "@/Core/Language";
import { Subject } from "@/Core/Domain";

export interface EntityManager<Error, Data> {
  initialize(id: string): void;
  update(subject: Subject): Promise<void>;
  get(id: string): RemoteData.Type<Error, Data>;
}
