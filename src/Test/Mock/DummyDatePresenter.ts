import { DateInfo } from "@/Core";
import { DatePresenter } from "@/UI/Inventory/Presenters/DatePresenter";

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
}
