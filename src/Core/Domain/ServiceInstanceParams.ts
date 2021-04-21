export interface ServiceInstanceParams {
  filter?: Filter;
  sort?: Sort;
}

export enum AttributeSet {
  Active = "active_attributes",
  Candidate = "candidate_attributes",
  Rollback = "rollback_attributes",
}

export interface Filter {
  attributeSetEmpty?: AttributeSet[];
  attributeSetNotEmpty?: AttributeSet[];
  deleted?: DeletedRule;
  id?: string[];
  identity?: { key: string; value: string };
  state?: string[];
}

export type DeletedRule = "Include" | "Only" | undefined;

export interface Sort {
  name: string;
  order: SortDirection;
}
export type SortDirection = "asc" | "desc";

export enum Kind {
  State = "State",
  Id = "Id",
  AttributeSet = "AttributeSet",
  Deleted = "Deleted",
  IdentityAttribute = "IdentityAttribute",
}

export const List: Kind[] = [
  Kind.State,
  Kind.Id,
  Kind.AttributeSet,
  Kind.Deleted,
];
