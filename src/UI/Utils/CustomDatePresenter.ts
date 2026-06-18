import dayjs from "@/dayjs";
import { DateInfo } from "@/Core";
import { DatePresenter } from "@/UI/Presenters";

export class CustomDatePresenter implements DatePresenter {
  private readonly timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;

  format(timestamp: string, template: string): string {
    return dayjs.utc(timestamp).tz(this.timezone).format(template);
  }

  diff(timestamp1: string, timestamp2: string): string {
    return `${dayjs.duration(dayjs(timestamp1).diff(dayjs(timestamp2))).asSeconds()} s`;
  }

  get(timestamp: string): DateInfo {
    return {
      full: this.getFull(timestamp),
      relative: this.getRelative(timestamp),
      dateTimeMilliseconds: `${this.getDate(timestamp)} ${this.getTime(timestamp)}`,
    };
  }

  getFull(timestamp: string): string {
    return this.format(timestamp, "YYYY/MM/DD HH:mm:ss");
  }

  getDate(timestamp: string): string {
    return this.format(timestamp, "YYYY/MM/DD");
  }

  getTime(timestamp: string): string {
    return this.format(timestamp, "HH:mm:SSS");
  }

  private getRelative(timestamp: string): string {
    return dayjs.utc(timestamp).tz(this.timezone).fromNow();
  }

  parseFull(timestamp: string): Date {
    return dayjs.tz(timestamp, "YYYY/MM/DD HH:mm:ss", this.timezone).toDate();
  }

  toUnixMs(timestamp: string): number {
    return dayjs.utc(timestamp).valueOf();
  }
}
