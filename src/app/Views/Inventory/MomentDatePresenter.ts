import moment from "moment";
import { DateInfo, DatePresenter } from "./DatePresenter";

export class MomentDatePresenter implements DatePresenter {
  get(timestamp: string): DateInfo {
    return {
      full: this.getFull(timestamp),
      relative: this.getRelative(timestamp),
    };
  }

  getFull(timestamp: string): string {
    return moment(timestamp).format("MMMM Do YYYY, h:mm:ss a");
  }

  getRelative(timestamp: string): string {
    return moment(timestamp).fromNow();
  }
}
