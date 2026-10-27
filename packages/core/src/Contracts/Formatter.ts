export interface Formatter<Source = string> {
  format(source: Source): string;
}
