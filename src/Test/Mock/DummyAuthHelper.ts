import { AuthHelper } from "@/Core";

export class DummyAuthHelper implements AuthHelper {
  getLoggedInUserName(): string | null {
    return "inmanta";
  }
}
