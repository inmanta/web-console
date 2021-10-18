import { KeyMaker } from "@/Core";

export class ServiceKeyMaker implements KeyMaker<[string, string]> {
  make([environment, name]: [string, string]): string {
    return `${environment}__?__${name}`;
  }

  matches([environment]: [string, string], key: string): boolean {
    return key.startsWith(environment);
  }
}
