import { Query, KeyMaker } from "@/Core";

export class ServiceKeyMaker implements KeyMaker<Query.Qualifier<"Service">> {
  make({ environment, name }: Query.Qualifier<"Service">): string {
    return `${environment}__?__${name}`;
  }
}
