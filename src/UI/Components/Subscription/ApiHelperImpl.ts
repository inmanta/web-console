import { Either, ApiHelper } from "@/Core";
import { DataModel, Subject } from "./DataModel";

export class ApiHelperImpl implements ApiHelper<Subject, string, DataModel> {
  async getData(subject: Subject): Promise<Either.Type<string, DataModel>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Either.right({ id: subject.id, value: 2 }));
      }, 200);
    });
  }
}
