export interface DateInfo {
  full: string;
  relative: string;
}

export interface DatePresenter {
  getFull(timestamp: string): string;
  getRelative(timestamp: string): string;
  get(timestamp: string): DateInfo;
}
