import { AuthHelper } from "@/Core";

export class DummyAuthHelper implements AuthHelper {
  isDisabled(): boolean {
    return false;
  }
  getUsername(): string | null {
    return "inmanta";
  }
}
