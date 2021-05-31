import moment from "moment-timezone";
import { DateInfo } from "@/Core";
import { DatePresenter } from "./DatePresenter";

export class MomentDatePresenter implements DatePresenter {
  private readonly timezone: string = moment.tz.guess();

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

  getShort(timestamp: Date): string {
    return moment.tz(timestamp, this.timezone).format("YYYY-MM-DD+HH:mm z");
  }

  parseShort(timestamp: string): Date {
    return moment.tz(timestamp, "YYYY-MM-DD+HH:mm z", this.timezone).toDate();
  }
}
