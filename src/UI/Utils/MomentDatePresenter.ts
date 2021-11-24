import moment from "moment-timezone";
import { DateInfo } from "@/Core";
import { DatePresenter } from "@/UI/Presenters";

export class MomentDatePresenter implements DatePresenter {
  private readonly timezone: string = moment.tz.guess();

  diff(timestamp1: string, timestamp2: string): string {
    return `${moment
      .duration(moment(timestamp1).diff(moment(timestamp2)))
      .asSeconds()} seconds`;
  }

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

  private getRelative(timestamp: string): string {
    return moment.utc(timestamp).tz(this.timezone).fromNow();
  }

  getShort(timestamp: Date): string {
    return moment.tz(timestamp, this.timezone).format("YYYY-MM-DD+HH:mm z");
  }

  parseShort(timestamp: string): Date {
    return moment.tz(timestamp, "YYYY-MM-DD+HH:mm z", this.timezone).toDate();
  }
}
