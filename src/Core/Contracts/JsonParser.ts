export interface JsonParser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse(text: string): any;
}

export type JsonParserId = "BigInt" | "Native";

export const isJsonParserId = (id: string): id is JsonParserId =>
  ["BigInt", "Native"].includes(id);
