/**
 * Makes a key based on input.
 */
export interface KeyMaker<Input> {
  make(input: Input): string;
  matches(input: Input, key: string): boolean;
}
