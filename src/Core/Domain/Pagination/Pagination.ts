import { ParsedNumber } from "@/Core/Language";
import type { PageInfo_FragmentFragment } from "@/Data/Apollo/gql/graphql";

export interface Handlers {
  prev?: string;
  next?: string;
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

/** The page info of a GraphQL connection, as the generated PageInfo_Fragment type without its typename. */
export type PageInfo = Omit<PageInfo_FragmentFragment, "__typename" | " $fragmentName">;
