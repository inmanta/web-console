import { AuthHelper } from "@/Core";

export class DummyAuthHelper implements AuthHelper {
  getUsername(): string | null {
    return "inmanta";
  }
}
