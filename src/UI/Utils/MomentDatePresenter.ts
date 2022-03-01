import moment from "moment-timezone";
import { DateInfo } from "@/Core";
import { DatePresenter } from "@/UI/Presenters";

export class MomentDatePresenter implements DatePresenter {
  format(timestamp: string, template: string): string {
    return moment.utc(timestamp).tz(this.timezone).format(template);
  }

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
    return this.format(timestamp, "YYYY/MM/DD HH:mm:ss");
  }

  getDay(timestamp: string): string {
    return this.format(timestamp, "YYYY/MM/DD");
  }

  getTime(timestamp: string): string {
    return this.format(timestamp, "HH:mm:ss");
  }

  private getRelative(timestamp: string): string {
    return moment.utc(timestamp).tz(this.timezone).fromNow();
  }

  parseFull(timestamp: string): Date {
    return moment.tz(timestamp, "YYYY/MM/DD HH:mm:ss", this.timezone).toDate();
  }

  toUnixMs(timestamp: string): number {
    return moment.utc(timestamp).valueOf();
  }
}
