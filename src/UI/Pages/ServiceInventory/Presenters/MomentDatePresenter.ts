import moment from "moment-timezone";
import { DateInfo } from "@/Core";
import { DatePresenter } from "./DatePresenter";

export class MomentDatePresenter implements DatePresenter {
  constructor(private readonly timezone: string) {}
  get(timestamp: string): DateInfo {
    return {
      full: this.getFull(timestamp),
      relative: this.getRelative(timestamp),
    };
  }

  getFull(timestamp: string): string {
    return moment
      .utc(timestamp)
      .tz(this.timezone)
      .format("MMMM Do YYYY, h:mm:ss a z");
  }

  getRelative(timestamp: string): string {
    return moment.utc(timestamp).tz(this.timezone).fromNow();
  }
}
