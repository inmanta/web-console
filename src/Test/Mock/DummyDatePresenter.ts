import { DateInfo } from "@/Core";
import { DatePresenter } from "@/UI/Presenters";

export class DummyDatePresenter implements DatePresenter {
  format(): string {
    return "formatted";
  }
  toUnixMs(): number {
    return 0;
  }
  diff(): string {
    return "10 seconds";
  }
  getFull(): string {
    return "full";
  }
  getDay(): string {
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
