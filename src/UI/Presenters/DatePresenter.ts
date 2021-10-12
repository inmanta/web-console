import { DateInfo } from "@/Core";

export interface DatePresenter {
  getFull(timestamp: string): string;
  getRelative(timestamp: string): string;
  get(timestamp: string): DateInfo;
  getShort(timestamp: Date): string;
  parseShort(timestamp: string): Date;
  diff(timestamp1: string, timestamp2: string): string;
}
