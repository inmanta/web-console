import { DateInfo } from "@/Core";

export interface DatePresenter {
  get(timestamp: string): DateInfo;
  getTime(timestamp: string): string;
  getDate(timestamp: string): string;
  getFull(timestamp: string): string;
  parseFull(timestamp: string): Date;
  diff(timestamp1: string, timestamp2: string): string;
  toUnixMs(timestamp: string): number;
  format(timestamp: string, template: string): string;
}
