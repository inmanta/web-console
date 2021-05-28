import { DateInfo } from "@/Core";

export interface DatePresenter {
  getFull(timestamp: string): string;
  getRelative(timestamp: string): string;
  get(timestamp: string): DateInfo;
  getShort(timestamp: Date): string;
  parseShort(timestamp: string): Date;
}
