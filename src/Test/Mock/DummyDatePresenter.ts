import { DateInfo } from "@/Core";
import { DatePresenter } from "@/UI/Presenters";

export class DummyDatePresenter implements DatePresenter {
  diff(): string {
    return "10 seconds";
  }
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
