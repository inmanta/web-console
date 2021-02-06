import { Either } from "@/Core";
import { ApiHelper, DataModel } from "./Interfaces";

export class ApiHelperImpl implements ApiHelper {
  async getData(id: string): Promise<Either.Type<string, DataModel>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Either.right({ id, value: new Date().getSeconds() }));
      }, 1000);
    });
  }
}
