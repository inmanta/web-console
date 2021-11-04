import { AuthHelper } from "@/Core";

export class DummyAuthHelper implements AuthHelper {
  isDisabled(): boolean {
    throw new Error("Method not implemented.");
  }
  getUsername(): string | null {
    throw new Error("Method not implemented.");
  }
}
