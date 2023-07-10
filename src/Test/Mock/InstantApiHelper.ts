import { ApiHelper, Either, ErrorWithHTTPCode, Maybe } from "@/Core";
import * as Outcome from "./Outcome";

export class InstantApiHelper<Data> implements ApiHelper {
  constructor(
    private getOutcome: (url: string) => Outcome.Type<string, Data>
  ) {}

  get<Data>(url): Promise<Either.Type<string, Data>> {
    return Outcome.handle<string, Data>(
      this.getOutcome(url) as Outcome.Type<string, Data>
    );
  }

  getWithHTTPCode<Data>(): Promise<Either.Type<ErrorWithHTTPCode, Data>> {
    throw new Error("Method not implemented.");
  }

  getWithoutEnvironment<Data>(url): Promise<Either.Type<string, Data>> {
    return Outcome.handle<string, Data>(
      this.getOutcome(url) as Outcome.Type<string, Data>
    );
  }
  getWithoutEnvironmentAsText(url): Promise<Either.Type<string, string>> {
    return Outcome.handle<string, string>(
      this.getOutcome(url) as Outcome.Type<string, string>
    );
  }
  post<Data>(): Promise<Either.Type<string, Data>> {
    throw new Error("Method not implemented.");
  }
  postWithoutResponse(): Promise<Maybe.Type<string>> {
    throw new Error("Method not implemented.");
  }
  postWithoutResponseAndEnvironment(): Promise<Maybe.Type<string>> {
    throw new Error("Method not implemented.");
  }
  putWithoutEnvironment<Data>(): Promise<Either.Type<string, Data>> {
    throw new Error("Method not implemented.");
  }
  patch(): Promise<Maybe.Type<string>> {
    throw new Error("Method not implemented.");
  }
  delete(): Promise<Maybe.Type<string>> {
    throw new Error("Method not implemented.");
  }
  head(): Promise<number> {
    throw new Error("Method not implemented.");
  }
}
