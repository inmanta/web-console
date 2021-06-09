import { DateInfo } from "@/Core";
import { DatePresenter } from "@/UI/Contracts";

export class DummyDatePresenter implements DatePresenter {
  getFull(): string {
    return "full";
  }
  getRelative(): string {
    return "relative";
  }
  get(): DateInfo {
    return {
      full: "full",
      relative: "relative",
    };
  }
  getShort(): string {
    return "short";
  }
  parseShort(): Date {
    return new Date();
  }
}
