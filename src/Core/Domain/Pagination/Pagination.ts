import { ParsedNumber } from "@/Core/Language";

export interface Handlers {
  prev?: string[];
  next?: string[];
}

export interface Links {
  first?: string;
  prev?: string;
  self: string;
  next?: string;
  last?: string;
}

export interface Metadata {
  total: ParsedNumber;
  before: ParsedNumber;
  after: ParsedNumber;
  page_size: ParsedNumber;
}
