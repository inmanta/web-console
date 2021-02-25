import { DateInfo } from "@/Core";
import { DatePresenter } from "@/UI/ServiceInventory/Presenters";

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
