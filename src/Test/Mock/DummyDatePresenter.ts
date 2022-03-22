import { DateInfo } from "@/Core";
import { DatePresenter } from "@/UI/Presenters";

export class DummyDatePresenter implements DatePresenter {
  toUnixMs(): number {
    return 0;
  }
  diff(): string {
    return "10 seconds";
  }
  getFull(): string {
    return "full";
  }
  getDate(): string {
    return "day";
  }
  getTime(): string {
    return "time";
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
  parseFull(): Date {
    return new Date();
  }
}
